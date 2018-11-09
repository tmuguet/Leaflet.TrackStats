(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

module.exports = _arrayWithoutHoles;
},{}],2:[function(_dereq_,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],3:[function(_dereq_,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

module.exports = _interopRequireDefault;
},{}],4:[function(_dereq_,module,exports){
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],5:[function(_dereq_,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

module.exports = _nonIterableSpread;
},{}],6:[function(_dereq_,module,exports){
var arrayWithoutHoles = _dereq_("./arrayWithoutHoles");

var iterableToArray = _dereq_("./iterableToArray");

var nonIterableSpread = _dereq_("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":1,"./iterableToArray":4,"./nonIterableSpread":5}],7:[function(_dereq_,module,exports){
module.exports = _dereq_("regenerator-runtime");

},{"regenerator-runtime":9}],8:[function(_dereq_,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],9:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() {
  return this || (typeof self === "object" && self);
})() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = _dereq_("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":10}],10:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() {
    return this || (typeof self === "object" && self);
  })() || Function("return this")()
);

},{}],11:[function(_dereq_,module,exports){
"use strict";

var metadatas = {}; // Rounds to 8 decimals (IGN API does not support/give more precise data)

if (typeof Math.roundE8 === 'undefined') {
  Math.roundE8 = function roundE8(value) {
    return Math.round(value * 100000000) / 100000000;
  };
}

function getKeyLatLng(lat, lng) {
  return "".concat(Math.roundE8(lng), "/").concat(Math.roundE8(lat));
}

function getKey(coords) {
  return getKeyLatLng(coords.lat, coords.lng);
}

module.exports = {
  add: function add(t, coords) {
    var key = getKey(coords);
    if (!(key in metadatas)) metadatas[key] = {};
    metadatas[key][t] = coords[t];
    return this;
  },
  get: function get(t, coords) {
    var key = getKey(coords);
    return key in metadatas && t in metadatas[key] ? metadatas[key][t] : undefined;
  },
  has: function has(t, coords) {
    var key = getKey(coords);
    return key in metadatas && t in metadatas[key];
  },
  hasZ: function hasZ(coords) {
    return this.has('z', coords);
  },
  hasSlope: function hasSlope(coords) {
    return this.has('slope', coords);
  },
  addZ: function addZ(coords) {
    this.add('z', coords);
    return this;
  },
  addSlope: function addSlope(coords) {
    this.add('slope', coords);
    return this;
  },
  getAll: function getAll(coords) {
    var key = getKey(coords);
    var md = key in metadatas ? metadatas[key] : {};
    return {
      lat: coords.lat,
      lng: coords.lng,
      z: 'z' in md ? md.z : undefined,
      slope: 'slope' in md ? md.slope : undefined
    };
  },
  clear: function clear() {
    Object.keys(metadatas).forEach(function (x) {
      return delete metadatas[x];
    });
    return this;
  }
};

},{}],12:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(_dereq_("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/asyncToGenerator"));

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Gp = (typeof window !== "undefined" ? window['Gp'] : typeof global !== "undefined" ? global['Gp'] : null);

var corslite = _dereq_('@mapbox/corslite');

function latLngToTilePixel(latlng, crs, zoom, tileSize, pixelOrigin) {
  var layerPoint = crs.latLngToPoint(latlng, zoom).floor();
  var tile = layerPoint.divideBy(tileSize).floor();
  var tileCorner = tile.multiplyBy(tileSize).subtract(pixelOrigin);
  var tilePixel = layerPoint.subtract(pixelOrigin).subtract(tileCorner);
  return {
    tile: tile,
    tilePixel: tilePixel
  };
}

module.exports = L.Class.extend({
  options: {},
  initialize: function initialize(apiKey, map, options) {
    this._apiKey = apiKey;
    this._map = map;
    L.Util.setOptions(this, options);
  },
  fetchAltitudes: function fetchAltitudes(latlngs) {
    var _this = this;

    var geometry = [];
    var promises = [];
    latlngs.forEach(function (coords) {
      geometry.push({
        lon: coords.lng,
        lat: coords.lat
      });

      if (geometry.length === 50) {
        // Launch batch
        promises.push(_this._fetchBatchAltitude(geometry.splice(0)));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      promises.push(this._fetchBatchAltitude(geometry.splice(0)));
    }

    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(resolve, reject) {
        var data, results;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return Promise.all(promises);

              case 3:
                data = _context.sent;
                results = [];
                data.forEach(function (x) {
                  return results.push.apply(results, (0, _toConsumableArray2.default)(x));
                });
                resolve(results);
                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                reject(_context.t0);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  _fetchBatchAltitude: function _fetchBatchAltitude(geometry) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      Gp.Services.getAltitude({
        apiKey: _this2._apiKey,
        sampling: geometry.length,
        positions: geometry,
        onSuccess: function onSuccess(result) {
          var elevations = [];
          result.elevations.forEach(function (val) {
            elevations.push({
              lat: val.lat,
              lng: val.lon,
              z: val.z
            });
          });
          resolve(elevations);
        },
        onFailure: function onFailure(error) {
          reject(new Error(error.message));
        }
      });
    });
  },
  fetchSlopes: function fetchSlopes(latlngs) {
    var _this3 = this;

    var tiles = {};
    var promises = [];
    var crs = this._map ? this._map.options.crs : this.options.crs || L.CRS.EPSG3857;
    var pixelOrigin = this._map ? this._map.getPixelOrigin() : this.options.pixelOrigin;
    latlngs.forEach(function (coords) {
      var _latLngToTilePixel = latLngToTilePixel(coords, crs, 16, 256, pixelOrigin),
          tile = _latLngToTilePixel.tile,
          tilePixel = _latLngToTilePixel.tilePixel;

      if (!(tile.x in tiles)) tiles[tile.x] = {};
      if (!(tile.y in tiles[tile.x])) tiles[tile.x][tile.y] = [[]];
      var arr = tiles[tile.x][tile.y];
      if (arr[arr.length - 1].length > 50) arr.push([]);
      arr[arr.length - 1].push({
        lat: coords.lat,
        lng: coords.lng,
        x: tilePixel.x,
        y: tilePixel.y
      });
    });
    Object.keys(tiles).forEach(function (x) {
      Object.keys(tiles[x]).forEach(function (y) {
        tiles[x][y].forEach(function (batch) {
          promises.push(_this3._fetchBatchSlope(x, y, batch));
        });
      });
    });
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(resolve, reject) {
        var data, results;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return Promise.all(promises);

              case 3:
                data = _context2.sent;
                results = [];
                data.forEach(function (x) {
                  return results.push.apply(results, (0, _toConsumableArray2.default)(x));
                });
                resolve(results);
                _context2.next = 12;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);
                reject(_context2.t0);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  },
  _fetchBatchSlope: function _fetchBatchSlope(tilex, tiley, coords) {
    var tilematrix = 16;
    var tilerow = tiley;
    var tilecol = tilex;
    var lon = '';
    var lat = '';
    var x = '';
    var y = '';
    var apikey = this._apiKey;
    coords.forEach(function (coord, idx) {
      if (idx > 0) {
        lon += '|';
        lat += '|';
        x += '|';
        y += '|';
      }

      lon += coord.lng.toString();
      lat += coord.lat.toString();
      x += coord.x.toString();
      y += coord.y.toString();
    });
    var url = "slope.php?tilematrix=".concat(tilematrix, "&tilerow=").concat(tilerow, "&tilecol=").concat(tilecol) + "&lon=".concat(lon, "&lat=").concat(lat, "&x=").concat(x, "&y=").concat(y, "&apikey=").concat(apikey);
    return new Promise(function (resolve, reject) {
      corslite(url, function (err, resp) {
        if (!err) {
          try {
            var data = JSON.parse(resp.responseText);

            if (data.results) {
              var slopes = [];
              data.results.forEach(function (val) {
                slopes.push({
                  lat: val.lat,
                  lng: val.lon,
                  slope: val.slope
                });
              });
              resolve(slopes);
            } else {
              reject(new Error("Impossible d'obtenir les données de pentes: résultats invalides"));
            }
          } catch (ex) {
            reject(ex);
          }
        } else {
          try {
            var _data = JSON.parse(err.responseText);

            reject(new Error(_data.error));
          } catch (ex) {
            reject(ex);
          }
        }
      }, false);
    });
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/toConsumableArray":6,"@babel/runtime/regenerator":7,"@mapbox/corslite":8}],13:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

_dereq_('./stats');

var cache = _dereq_('./cache');

var Geoportail = _dereq_('./geoportail');

L.TrackStats = {
  cache: cache,
  Geoportail: Geoportail,
  geoportail: function geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  }
};
module.exports = L.TrackStats;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache":11,"./geoportail":12,"./stats":14}],14:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(_dereq_("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/asyncToGenerator"));

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var cache = _dereq_('./cache');

if (typeof Math.degrees === 'undefined') {
  // Converts from radians to degrees.
  Math.degrees = function degrees(radians) {
    return radians * 180 / Math.PI;
  };
}

function getLatLngsFlatten(polyline) {
  var latlngs = polyline.getLatLngs();

  if (latlngs.length > 0 && Array.isArray(latlngs[0])) {
    var result = [];

    for (var j = 0; j < latlngs.length; j += 1) {
      result = result.concat(latlngs[j]);
    }

    return result;
  }

  return latlngs;
}

function computePathStats(polyline) {
  var latlngs = getLatLngsFlatten(polyline);
  var elevations = latlngs.map(function (coords) {
    return coords.getCachedInfos();
  });

  if (elevations.length === 0) {
    return null;
  }

  var results = {
    distance: 0,
    altMin: elevations[0].z,
    altMax: elevations[0].z,
    heightDiffUp: 0,
    heightDiffDown: 0,
    slopeMin: Number.MAX_VALUE,
    slopeMax: Number.MIN_VALUE,
    slopeTerrainMin: elevations[0].slope,
    slopeTerrainMax: elevations[0].slope,
    elevations: []
  };
  elevations[0].dist = 0;
  elevations[0].slopeOnTrack = 0;
  results.elevations.push(elevations[0]);
  var j = 0;

  for (var i = 1; i < elevations.length; i += 1) {
    var localDistance = L.latLng(elevations[i]).distanceTo(L.latLng(results.elevations[j])); // m

    if (localDistance > 0) {
      results.distance += localDistance / 1000; // km

      j += 1;
      results.elevations[j] = elevations[i];
      results.elevations[j].dist = results.distance;
      results.elevations[j].slopeOnTrack = Math.degrees(Math.atan((Math.round(results.elevations[j].z) - Math.round(results.elevations[j - 1].z)) / localDistance));
      if (results.elevations[j].z < results.altMin) results.altMin = results.elevations[j].z;
      if (results.elevations[j].z > results.altMax) results.altMax = results.elevations[j].z;
      if (results.elevations[j].slopeOnTrack < results.slopeMin) results.slopeMin = results.elevations[j].slopeOnTrack;
      if (results.elevations[j].slopeOnTrack > results.slopeMax) results.slopeMax = results.elevations[j].slopeOnTrack;

      if (results.elevations[j].z < results.elevations[j - 1].z) {
        results.heightDiffDown += Math.round(results.elevations[j - 1].z - results.elevations[j].z);
      } else {
        results.heightDiffUp += Math.round(results.elevations[j].z - results.elevations[j - 1].z);
      }

      if (results.elevations[j].slope < results.slopeTerrainMin) results.slopeTerrainMin = results.elevations[j].slope;
      if (results.elevations[j].slope > results.slopeTerrainMax) results.slopeTerrainMax = results.elevations[j].slope;
    }
  }

  if (results.altMin === undefined) {
    results.heightDiffUp = undefined;
    results.heightDiffDown = undefined;
    results.slopeMax = undefined;
    results.slopeMin = undefined;
  }

  return results;
}

L.Polyline.include({
  _elevations: [],
  _distance: 0,
  _altMin: 0,
  _altMax: 0,
  _slopeMin: 0,
  _slopeMax: 0,
  _heightDiffUp: 0,
  _heightDiffDown: 0,
  _slopeTerrainMin: 0,
  _slopeTerrainMax: 0,
  getElevations: function getElevations() {
    return JSON.parse(JSON.stringify(this._elevations)); // deep copy
  },
  getDistance: function getDistance() {
    return this._distance;
  },
  getAltMin: function getAltMin() {
    return this._altMin;
  },
  getAltMax: function getAltMax() {
    return this._altMax;
  },
  getSlopeMin: function getSlopeMin() {
    return this._slopeMin;
  },
  getSlopeMax: function getSlopeMax() {
    return this._slopeMax;
  },
  getHeightDiffUp: function getHeightDiffUp() {
    return this._heightDiffUp;
  },
  getHeightDiffDown: function getHeightDiffDown() {
    return this._heightDiffDown;
  },
  getSlopeTerrainMin: function getSlopeTerrainMin() {
    return this._slopeTerrainMin;
  },
  getSlopeTerrainMax: function getSlopeTerrainMax() {
    return this._slopeTerrainMax;
  },
  fetchAltitude: function fetchAltitude(fetcher) {
    var latlngs = Array.from(new Set(getLatLngsFlatten(this).filter(function (coords) {
      return !cache.hasZ(coords);
    })));
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(resolve, reject) {
        var elevations;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!(latlngs.length > 0)) {
                  _context.next = 6;
                  break;
                }

                _context.next = 4;
                return fetcher.fetchAltitudes(latlngs);

              case 4:
                elevations = _context.sent;
                elevations.forEach(function (x) {
                  return cache.addZ(x);
                });

              case 6:
                resolve();
                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                reject(_context.t0);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  fetchSlope: function fetchSlope(fetcher) {
    var latlngs = Array.from(new Set(getLatLngsFlatten(this).filter(function (coords) {
      return !cache.hasSlope(coords);
    })));
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(resolve, reject) {
        var slopes;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;

                if (!(latlngs.length > 0)) {
                  _context2.next = 6;
                  break;
                }

                _context2.next = 4;
                return fetcher.fetchSlopes(latlngs);

              case 4:
                slopes = _context2.sent;
                slopes.forEach(function (x) {
                  return cache.addSlope(x);
                });

              case 6:
                resolve();
                _context2.next = 12;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);
                reject(_context2.t0);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  },
  fetchInfos: function fetchInfos(fetcher) {
    var _this = this;

    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref3 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(resolve, reject) {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return _this.fetchAltitude(fetcher);

              case 3:
                _context3.next = 5;
                return _this.fetchSlope(fetcher);

              case 5:
                resolve();
                _context3.next = 11;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](0);
                reject(_context3.t0);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 8]]);
      }));

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());
  },
  computeStats: function computeStats() {
    var results = computePathStats(this);

    if (results === null) {
      return false;
    }

    this._elevations = results.elevations;
    this._distance = results.distance;
    this._altMin = results.altMin;
    this._altMax = results.altMax;
    this._slopeMin = results.slopeMin;
    this._slopeMax = results.slopeMax;
    this._heightDiffUp = results.heightDiffUp;
    this._heightDiffDown = results.heightDiffDown;
    this._slopeTerrainMin = results.slopeTerrainMin;
    this._slopeTerrainMax = results.slopeTerrainMax;
    return true;
  }
});

L.LatLng.prototype.getCachedInfos = function getCachedInfos() {
  return cache.getAll(this);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache":11,"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/regenerator":7}]},{},[13]);
