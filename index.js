'use strict';

/**
 *  Module dependencies.
 */

var debug = require('debug')('ware');
var Emitter = require('events').EventEmitter;
var compose = require('koa-compose');
var co = require('co');

/**
 *  slice() reference.
 */

var slice = Array.prototype.slice;

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
 *
 *  @api public
 */

function Ware () {
  if (!(this instanceof Ware)) return new Ware;
  this.env = process.env.NODE_ENV || 'development';
  this.outputErrors = 'test' != this.env;
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
  var self = this;
  var mw = [].concat(this.fns);
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var callback = 'function' === typeof last ? last : null;
  if (callback) args.pop();
  mw.push(callback || noop);
  var gen = compose(mw);
  var fn = co(gen);
  var ctx = Object.create(this.context);
  ctx.input = args;
  ctx.onerror = function (err) {
    if (!err) return;
    self.emit('error', err);
  };
  fn.call(ctx, ctx.onerror);
  return this;
};

/**
 *  Default error handler.
 *
 *  @param {Error} err
 *  @api private
 */

w.onerror = function(err){
  if (!this.outputErrors) return;
  console.error(err.stack);
};

/**
 *  Noop.
 *
 *  @api private
 */

function *noop() {}
