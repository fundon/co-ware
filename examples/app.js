var ware = require('..');

var middleware = ware()
  .use(function *(next) {
    //if ('42' != obj.value) return next(new Error());
    yield next;
    console.log(this.i);
  })
  .use(function *(next) {
    console.log('yes!');
  })
  .use(function *(next) {
    console.log('no!');
  });

middleware.run({ life: '41' }); // "no!"
middleware.run({ life: '42' }); // "yes!"
