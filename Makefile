# build:
# 	make install && make build

develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

lint-fix:
	npx eslint --fix .

.PHONY: test