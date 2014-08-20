'use strict';

/**
 *  Module dependencies.
 */

var debug = require('debug')('ware');
var Emitter = require('events').EventEmitter;
var compose = require('koa-compose');
var co = require('co');
var slice = Array.prototype.slice;

/**
 *  Ware prototype.
 */

var w = Ware.prototype;

/**
 *  Expose Ware.
 */

exports = module.exports = Ware;

/**
 *  Initialize a new `Ware` manager.
 *
 *  @api public
 */

function Ware() {
  if (!(this instanceof Ware)) return new Ware();
  this.on('error', this.onerror);
  this.fns = [];
  this.context = Object.create(null);
}


/**
 *  Inherit from `Emitter.prototype`.
 */

Ware.prototype.__proto__ = Emitter.prototype;

/**
 *  Use the given middleware `fn`.
 *
 *  @param {GeneratorFunction} fn
 *  @return {Ware} self
 *  @api public
 */

w.use = function (fn) {
  debug('use %s', fn._name || fn.name || '-');
  this.fns.push(fn);
  return this;
};

/**
 *  Run through the middleware with the given `args` and optional `callback`.
 *
 *  @param {Mixed} args...
 *  @param {GeneratorFunction} callback (optional)
 *  @return {Ware}
 *  @api public
 */

w.run = function () {
  debug('run');
  var mw = [].concat(this.fns);
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var callback = 'function' === typeof last ? last : null;
  if (callback) args.pop();
  mw.push(callback || noop);
  var gen = compose(mw);
  var fn = co(gen);
  var ctx = this.createContext(args, Object.create(null), this);
  fn.call(ctx, ctx.onerror);
  return this;
};

/**
 *  Clear the midleware.
 *
 *  @return {Object} self
 *  @api public
 */

w.clear = function () {
  this.fns.length = 0;
  return this;
};

/**
 *  Create a context.
 *
 *  @param {Mixed} input
 *  @return {Object} ctx
 *  @api private
 */

w.createContext = function (input, output, self) {
  var ctx = Object.create(self.context);
  ctx.input = input;
  ctx.output = output;
  ctx.onerror = function (err) {
    if (!err) return;
    self.removeListener('error', self.onerror);
    self.emit('error', err);
  };
  return ctx;
};

/**
 *  Default error handler.
 *
 *  @param {Error} err
 *  @api private
 */

w.onerror = function(err){
  if (this.listeners('error').length) return;
  console.error(err.stack);
};

/**
 *  Noop.
 *
 *  @api private
 */

function *noop() {}
