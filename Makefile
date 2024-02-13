install: install-deps
	npx simple-git-hooks

run:
	bin/rss-agregator.js

install-deps:
	npm ci

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm-publish --dry-run

.PHONY: test
