/**
 * Context prototype.
 */

var proto = module.exports = {

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect: function(){
    return {
      input: this.input,
      output: this.output
    }
  },

  throw: function(msg, status) {
  },

  /**
   * Alias for .throw() for backwards compatibility.
   * Do not use - will be removed in the future.
   *
   * @param {String|Number} msg
   * @param {Number} status
   * @api private
   */

  error: function(msg, status) {
    console.warn('ctx.error is deprecated, use ctx.throw');
    this.throw(msg, status);
  },

   /**
   * Default error handling.
   *
   * @param {Error} err
   * @api private
   */

  onerror: function(err) {
  }

};
