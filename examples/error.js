var ware = require('..');
var w = ware()
  .use(function *(next) {
    if ('42' != this.input[0].life) throw new Error();
    yield next;
  })
  .use(function *(next) {
    console.log('yes!');
  })
  .on('error', function (err) {
    console.log('no!');
  });

w.run({ life: '41' }); // "no!"
w.run({ life: '42' }); // "yes!"
