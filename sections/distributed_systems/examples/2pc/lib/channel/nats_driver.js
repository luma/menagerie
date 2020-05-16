import Nats from 'nats';

export default class NatsDriver {
  static connect({ log, ...options } = {}) {
    return new Promise((resolve, reject) => {
      const nats = Nats.connect(options);

      nats.once('connect', () => {
        resolve(new NatsDriver(nats, { log }));
      });

      nats.once('error', function(err) {
        reject(err);
      });
    });
  }

  constructor(nats, { log }) {
    this.nats = nats;

    // @TODO we should bubble up errors from NATS
    nats.on('error', (err) => {
      log.error('NATS ERROR:');
      log.error({ err });
    });

    nats.on('close', () => {
      // @TODO handle close
    });
  }

  request(type, payload, callback) {
    this.nats.request(type, payload, callback);
  }

  subscribe(type, options = {}, callback) {
    this.nats.subscribe(type, options, callback);
  }

  unsubscribe(subscriptionId) {
    this.nats.unsubscribe(subscriptionId);
  }

  publish(replyTo, payload) {
    this.nats.publish(replyTo, payload);
  }

  close() {
    return new Promise((resolve) => {
      this.nats.flush(() => {
        this.nats.close();
        resolve();
      });
    });
  }
}
