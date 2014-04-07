var ware = require('..');

var w = ware()
  .use(function *(next) {
    this.x = 'hello';
    yield next;
  })
  .use(function *(next) {
    this.y = 'world';
    yield next;
  })
  .use(function *(next) {
    yield next;
  });

w.run({a:1}, {b:2}, function *() {
  console.log(this.x, this.y);
});
