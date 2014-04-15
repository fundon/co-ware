# co-ware [![Build Status](https://travis-ci.org/fundon/co-ware.svg)](https://travis-ci.org/fundon/co-ware)
  [Ware][] inspired, easily create your own middleware layer using generators via [co][].


### Examples

```js
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

w.run({}, {}, function *() {
  console.log(this.x, this.y);
});
```

Print the arguments of input.

```js
var ware = require('..');
var w = ware()
  .use(function *(next) {
    console.log(this.input); // 1, 2, 3
    yield next;
  });

w.run(1, 2, 3);
```

Handles error.

```js
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
```

### API

#### ware()

  Create a new list of middleware.

#### .use(*fun)

  Push a middleware fn(__GeneratorFunction__) onto the list. If the middleware has an arity of one more than the input to run it's an error middleware.

#### .run(input..., [*callback])

  Runs the middleware functions with input... and optionally calls callback.

#### .clear()

  Clear the middleware.

### License

MIT

[ware]: https://github.com/segmentio/ware
[co]: https://github.com/visionmedia/co
