/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.1.0.4.
 ** 
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2018 by yWorks GmbH, Vor dem Kreuzberg 28, 
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.1-MiB-local.
 **
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2018 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.1-B463.
 **
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2018 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
/**
 * Provides support for standard ECMAScript 2015 features that are used by yFiles for HTML but are not present in some of the
 * supported browsers.
 *
 * For details, see the comment on each feature.
 *
 * @yjs.keep
 */
;(function(window) {
  /**
   * This shim is required for all versions of IE but for no version of Edge
   * It is also required for Firefox < 29, Chrome < 33, Safari < 7.1, Opera < 20, iOS Safari < 8.0, Opera Mini,
   * Android Browser < 4.4.4, and many mobile browser implementations.
   * This shim provides a very basic Promise implementation that does not implement the Promise API completely at all,
   * but suffices to be useful for the APIs in yFiles for HTML that use promises. Basic usage in yFiles would be:
   * '''
   * var promise = api.methodThatReturnsAPromise();
   * promise.then(
   *  function(result){ console.log("promise resolved with value" + result)},
   *  function(error){ console.log("method failed with reason" + error)});
   * '''
   */
  if (typeof window.Promise == 'undefined') {
    var runs = []

    function run(fn, arg) {
      runs.push(fn)
      runs.push(arg)
      if (runs.length == 2) {
        setTimeout(function() {
          for (var i = 0; i < runs.length; i += 2) {
            var fn = runs[i]
            var arg = runs[i + 1]
            fn(arg)
          }
          runs.length = 0
        }, 0)
      }
    }

    function resolvePromise(promise, value) {
      if (promise.state !== 0) return
      promise.state = 1
      promise.value = value
      run(runResolveThens, promise)
    }

    function runResolveThens(promise) {
      if (promise.thens.length > 0) {
        for (var i = 0; i < promise.thens.length; i++) {
          var child = promise.thens[i][0]
          var resolver = promise.thens[i][1]
          promise.thens[i][0] = null // to avoid duplicate invocation
          promise.thens[i][1] = null // to avoid duplicate invocation
          if (resolver) {
            try {
              promise.value = resolver(promise.value)
              if (promise.value instanceof Promise) {
                promise.value.then(
                  function(val) {
                    resolvePromise(child, val)
                  },
                  function(err) {
                    rejectPromise(child, err)
                  }
                )
              } else {
                resolvePromise(child, promise.value)
              }
            } catch (e) {
              rejectPromise(child, e)
            }
          } else {
            resolvePromise(child, promise.value)
          }
        }
      }
    }

    function rejectPromise(promise, error) {
      if (promise.state !== 0) return
      promise.state = 2
      promise.value = error
      run(runRejectThens, promise)
    }

    function runRejectThens(promise) {
      if (promise.thens.length > 0) {
        var value = promise.value
        for (var i = 0; i < promise.thens.length; i++) {
          var child = promise.thens[i][0]
          var rejecter = promise.thens[i][2]
          promise.thens[i][1] = null // to avoid duplicate invocation
          if (rejecter) {
            try {
              value = rejecter(promise.value)
            } catch (e) {
              value = e
            }
          }
          rejectPromise(child, value)
        }
      }
    }

    /**
     *
     * @param {function(resolve, reject)} resolver
     * @constructor
     */
    function Promise(resolver) {
      var promise = this
      promise.state = 0
      promise.value = undefined
      promise.thens = []

      function resolveCallback(value) {
        resolvePromise(promise, value)
      }

      function rejectCallback(reason) {
        rejectPromise(promise, reason)
      }

      if (resolver) {
        try {
          resolver(resolveCallback, rejectCallback)
        } catch (e) {
          rejectPromise(promise, e)
        }
      }
    }

    Promise.prototype.then = function(resolve, reject) {
      var child = new Promise()

      run(function(promise) {
        if (promise.state === 1) {
          try {
            var result = resolve(promise.value)
            if (result instanceof Promise) {
              result.then(
                function(val) {
                  resolvePromise(child, val)
                },
                function(err) {
                  rejectPromise(child, err)
                }
              )
            } else {
              resolvePromise(child, result)
            }
          } catch (e) {
            rejectPromise(child, e)
          }
        } else if (promise.state == 2) {
          if (reject) {
            run(reject, promise.value)
          }
          rejectPromise(child, promise.value)
        } else {
          // remember
          promise.thens.push([child, resolve, reject])
        }
      }, this)

      return child
    }

    Promise.prototype.catch = function(reject) {
      return this.then(null, reject)
    }

    Promise.reject = function(reason) {
      return new Promise(function(resolve, reject) {
        reject(reason)
      })
    }

    Promise.resolve = function(value) {
      return new Promise(function(resolve) {
        resolve(value)
      })
    }

    window.Promise = Promise
  }
})(
  'undefined' != typeof window
    ? window
    : 'undefined' != typeof global
      ? global
      : 'undefined' != typeof self
        ? self
        : this
)
