'use strict';

/**
 * Module dependencies.
 */

var assert = require('assert');
var debug = require('debug')('ware');
var Emitter = require('events').EventEmitter;
var compose = require('koa-compose');
var co = require('co');
var slice = Array.prototype.slice;

/**
 * Ware prototype.
 */

var w = Ware.prototype;

/**
 * Expose Ware.
 */

exports = module.exports = Ware;

/**
 * Initialize a new `Ware` manager.
 *
 * @api public
 */

function Ware() {
  if (!(this instanceof Ware)) return new Ware;
  this.on('error', this.onerror);
  this.middleware = [];
  this.context = Object.create(null);
}


/**
 * Inherit from `Emitter.prototype`.
 */

Ware.prototype.__proto__ = Emitter.prototype;

/**
 * Use the given middleware `fn`.
 *
 * @param {GeneratorFunction} fn
 * @return {Ware} self
 * @api public
 */

w.use = function (fn) {
  assert(fn && 'GeneratorFunction' == fn.constructor.name,
    'ware.use() requires a generator function');
  debug('use %s', fn._name || fn.name || '-');
  this.middleware.push(fn);
  return this;
};

/**
 * Run through the middleware with the given `args`
 * and optional `callback`.
 *
 * @param {Mixed} args...
 * @param {GeneratorFunction} callback (optional)
 * @return {Mixed}
 * @api public
 */

w.run = function () {
  debug('run');
  var mw = [].concat(this.middleware);
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var callback = 'function' === typeof last ? last : null;
  if (callback) {
    args.pop();
    mw.push(callback);
  }
  var gen = compose(mw);
  var fn = co.wrap(gen);
  var ctx = this.createContext(args, Object.create(null), this);
  return fn.call(ctx).catch(ctx.onerror);
};

/**
 * Clear the midleware.
 *
 * @return {Object} self
 * @api public
 */

w.clear = function () {
  this.middleware.length = 0;
  return this;
};

/**
 * Create a context.
 *
 * @param {Mixed} input
 * @return {Object} ctx
 * @api private
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
 * Default error handler.
 *
 * @param {Error} err
 * @api private
 */

w.onerror = function (err){
  assert(err instanceof Error, 'non-error thrown: ' + err);
  if (this.listeners('error').length) return;
  var msg = err.stack || err.toString();
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
};
