
describe('ware', function () {

  var assert = require('assert');
  var noop = function *(){};
  var ware = require('..');

  describe('#use', function () {
    it('should be chainable', function () {
      var w = ware();
      assert(w.use(noop) == w);
    });

    it('should add a middleware to fns', function () {
      var w = ware().use(noop);
      assert(1 == w.fns.length);
    });
  });

  describe('#run', function () {
    it('should receive an error', function (done) {
      var error = new Error();
      ware()
        .use(function *() { throw error })
        .on('error', function (err) {
          assert(err == error);
          done();
        })
        .run();
    });

    it('should receive initial arguments', function (done) {
      ware()
        .use(function *(next) { yield next; })
        .run('req', 'res', function *() {
          assert('req' == this.input[0]);
          assert('res' == this.input[1]);
          done();
        });
    });

    it('should take any number of arguments', function (done) {
      ware()
        .use(function *(next) { yield next; })
        .run('a', 'b', 'c', function *() {
          var input = this.input;
          assert('a' == input[0]);
          assert('b' == input[1]);
          assert('c' == input[2]);
          done();
        });
    });

    it('should let middleware manipulate the same input objects', function (done) {
      ware()
        .use(function *(next) {
          this.input[0].value = this.input[0].value * 2;
          yield next;
        })
        .use(function *(next) {
          this.input[0].value = this.input[0].value.toString();
          yield next;
        })
        .run({ value: 21 }, function *() {
          assert('42' == this.input[0].value);
          done();
        });
    });

    it('should skip non-error handlers on error', function (done) {
      ware()
        .use(function *(next) { throw new Error(); })
        .use(function *(next) { assert(false); })
        .on('error', function (err) {
          assert(err);
          done();
        })
        .run();
    });

    it('should skip error handlers on no error', function (done) {
      ware()
        .use(function *(next) { yield next; })
        .use(function *(next) { assert(false); })
        .on('error', function (err) {
          assert(err);
          done();
        })
        .run();
    });

    it('should not call error middleware on error', function (done) {
      var errors = 0;
      ware()
        .use(function *(next) { throw new Error(); })
        .use(function *(next) { errors++; yield next; })
        .use(function *(next) { errors++; yield next; })
        .on('error', function (err) {
          assert(err);
          assert(2 != errors);
          done();
        })
        .run();
    });

    it('should not require a callback', function (done) {
      ware()
        .use(function *(next) { yield next; })
        .use(function *(next) { done(); })
        .run('obj');
    });
  });
});
