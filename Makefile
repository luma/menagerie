
build: book

book: book.toml Cargo.lock src
	mdbook build

clean:
	mdbook clean

watch: book.toml Cargo.lock src
	mdbook watch --open .

test: book.toml Cargo.lock src
	mdbook test .

read: book.toml Cargo.lock src
	mdbook serve --open .

netlify:
 curl -L https://github.com/rust-lang/mdBook/releases/download/v0.3.7/mdbook-v0.3.7-x86_64-unknown-linux-gnu.tar.gz | tar xvz && ./mdbook build
