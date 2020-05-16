
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

.PHONY: netlify clean read test
