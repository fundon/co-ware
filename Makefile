REPORTER = tap
TIMEOUT = 30000
MOCHA_OPTS = --check-leaks

node_modules: package.json
	@npm install

test: node_modules
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--harmony-generators \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS)

.PHONY: test
