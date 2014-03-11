/**
 * Module dependencies.
 */

var debug = require('debug')('ware:ware');
//var onFinished = require('finished');
var Emitter = require('events').EventEmitter;
var compose = require('koa-compose');
var context = require('./context');
var input = require('./input');
var output = require('./output')
var co = require('co');

/**
 *  Ware prototype.
 */

var w = Ware.prototype;

/**
 *  Expose `Ware`.
 */

exports = module.exports = Ware;

/**
 *  Initialize a new `Ware` manager.
 */

function Ware () {
  if (!(this instanceof Ware)) return new Ware();
  this.env = process.env.NODE_ENV || 'development';
  this.on('error', this.onerror);
  this.outputErrors = 'test' != this.env;
  this.poweredBy = true;
  this.middleware = [];
  this.context = Object.create(context);
  this.input = Object.create(input);
  this.output = Object.create(output);
}

/**
 * Inherit from `Emitter.prototype`.
 */

Ware.prototype.__proto__ = Emitter.prototype;

/**
 * Use a middleware `fn`.
 *
 * @param {Function} fn
 * @return {Ware}
 */

w.use = function (fn) {
  this.middleware.push(fn);
  return this;
};

/**
 * Return a Input-Output callback.
 *
 * @return {Function}
 * @api public
 */

w.callback = function () {
  var mw = [respond].concat(this.middleware);
  var gen = compose(mw);
  var fn = co(gen);
  var self = this;

  return function (i, o) {
    var ctx = self.createContext(i, o);
    //onFinished(ctx, ctx.onerror);
    fn.call(ctx, ctx.onerror);
  };
};

/**
 * Run through the middleware with the given `args` and optional `callback`.
 *
 * @param {Mixed} args...
 * @param {Function} callback (optional)
 * @return {Ware}
 */

w.run = function () {
  if (!this.handler) {
    this.handler = this.callback();
  }

  var args = [].slice.call(arguments);

  this.handler.apply(null, args);
};

w.createContext = function(i, o) {
  var context = Object.create(this.context);
  var input = context.input = Object.create(this.input);
  var output = context.output = Object.create(this.output);
  context.app = input.app = output.app = this;
  context.i = input.i = output.i = i;
  context.o = input.o = output.o = o;
  input.ctx = output.ctx = context;
  input.output = output;
  output.input = input;
  context.onerror = context.onerror.bind(context);
  return context;
};

/**
 * Default error handler.
 *
 * @param {Error} err
 * @api private
 */

w.onerror = function(err) {
  //if (!this.outputErrors) return;
  //if (404 == err.status) return;
  //console.error(err.stack);
};

/**
 * Output middleware.
 */

function *respond(next) {

  yield *next;

  if (false === this.respond) return;

}
