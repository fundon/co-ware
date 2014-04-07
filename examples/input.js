var ware = require('..');

var w = ware()
  .use(function *(next) {
    console.log(this.input); // 1, 2, 3
    yield next;
  });

w.run(1, 2, 3);
