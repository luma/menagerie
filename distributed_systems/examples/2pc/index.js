#!/usr/bin/env node
import bunyan from 'bunyan';
import NatsDriver from './lib/channel/nats_driver.js';
import Coordinator from './lib/coordinator.js';
import Cohort from './lib/cohort.js';

const log = bunyan.createLogger({ name: '2pc' });
const numCohorts = 4;

const timesAux = (timesLeft, f) => {
  if (timesLeft <= 0) {
    return;
  }

  f();
  timesAux(timesLeft - 1, f);
};

const times = (n, f) => timesAux(n, f);

function setupCoordinator(driver) {
  log.info('setting up Coordinator');
  // 2 cohorts, so 3 nodes total including the coordinator.
  const coordinator = new Coordinator(driver, numCohorts, { log: log.child() });

  coordinator.on('timeout', () => {
    coordinator.log.error('TIMED OUT');
    // we timed out waiting for the cohorts to
    // reply with their votes. Before this callback was called
    // a `rollback` message would have been sent to all cohorts
  });

  coordinator.on('commit', () => {
    coordinator.log.info('CONSENSUS ACHIEVED! COMMITING', coordinator.proposed);

    // TODO completes the operation, and releases all the locks and
    // resources held during the transaction.
  });

  coordinator.on('abort', (err) => {
    coordinator.log.error('ABORTED:');
    coordinator.log.error({ err });
    // We failed to achieve consensus because of err.
    // TODO: err should indicate the type of err (timeout|vote|nack), which nodes,
    // and any additional details
    // TODO undo the transaction and release any resources
  });

  return Promise.resolve(coordinator);
}

function setupCohort(driver) {
  log.info('setting up Cohort');
  const cohort = new Cohort(driver, { log: log.child() });

  cohort.on('proposal', (proposal) => {
    const vote = proposal.value > 3;
    cohort.log.info(`Coordinator proposed ${proposal.value}: voting ` +
              `${ vote ? 'YES' : 'NO' }`);

    if (proposal.value > 3) {
      // Vote Yes (prepare)

      // TODO setup a transaction, write to undo/redo logs (en.wikipedia.org/wik
      // i/Algorithms_for_Recovery_and_Isolation_Exploiting_Semantics) or whatever

      proposal.vote(true);
    } else {
      // Or No (abort)

      proposal.vote(false);
    }
  });

  cohort.on('abort', () => {
    cohort.log.info('Consensus could not be achieved...rolling back.');
    // after this callback is executed successfully (i.e. does
    // not throw) it will send an `ack` message to the coordinator

    // TODO undo the transaction and release any resources
  });

  cohort.on('commit', () => {
    cohort.log.info(`COMMITING ${cohort.proposed}`);
    // after this callback is executed successfully (i.e. does
    // not throw) it will send an `ack` message to the coordinator

    // TODO completes the operation, and releases all the locks and
    // resources held during the transaction.
  });

  return Promise.resolve(cohort);
}


const setupSystem = () => {
  const maybeSystem = [
    NatsDriver.connect({ port: 4222 }).then(setupCoordinator),
  ];

  times(numCohorts, () => {
    maybeSystem.push(NatsDriver.connect({ port: 4222 }).then(setupCohort));
  });

  return Promise.all(maybeSystem);
};

setupSystem().catch((err) => {
  log.error('ERROR WHILE CONNECTING TO NATS:');
  log.error(err);
  process.exit();
}).then(([coordinator, ...cohorts] = []) => {
  log.info(`SYSTEM CONNECTED: coordinator (${coordinator.id}) and cohorts ` +
                  `(${cohorts.map((c) => c.id).join(', ')})`);

  process.once('SIGINT', () => {
    log.info('Shutting down...');

    Promise.all(
      cohorts.map(cohort => cohort.shutdown())
    ).then(() => coordinator.shutdown()).then(() => {
      log.info('All done. Goodbye :-)');
    });
  });


  // TODO setup a transaction, write to undo/redo logs (en.wikipedia.org/wiki
  // /Algorithms_for_Recovery_and_Isolation_Exploiting_Semantics) or whatever

  // There's a race condition between when all the cohorts are fully
  // subscribed and the coordinator proposes. This is because subscribe in the
  // NATs node client pretends to be synchronous (in the sense that there's no
  // way to know when we are subscribed) by returning immediately. Unfortuately
  // it does take time to send the subscribe command to the NATs server and have
  // the subscription honoured.
  //
  // We need an artifical delay here to hopefully give the cohorts time to finish
  // Obviously this could go horribly wrong if any of the cohorts are on a slow
  // network
  // @TODO Figure out a better way then an arbitary delay
  setTimeout(() => {
    // Now kick a round of 2-phase-commit off
    coordinator.propose(4).catch((err) => {
      coordinator.log.error('Failed to propose:');
      coordinator.log.error(err);
      process.exit();
    });
  }, 1000);
});
