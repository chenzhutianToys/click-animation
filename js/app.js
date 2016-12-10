webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _vue = __webpack_require__(1);
	
	var _vue2 = _interopRequireDefault(_vue);
	
	var _vueRouter = __webpack_require__(4);
	
	var _vueRouter2 = _interopRequireDefault(_vueRouter);
	
	var _App = __webpack_require__(5);
	
	var _App2 = _interopRequireDefault(_App);
	
	var _NoBallDrop = __webpack_require__(12);
	
	var _NoBallDrop2 = _interopRequireDefault(_NoBallDrop);
	
	var _CongleiBaseline = __webpack_require__(106);
	
	var _CongleiBaseline2 = _interopRequireDefault(_CongleiBaseline);
	
	var _NoForeshadowBaseline = __webpack_require__(111);
	
	var _NoForeshadowBaseline2 = _interopRequireDefault(_NoForeshadowBaseline);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//components here
	_vue2.default.use(_vueRouter2.default);
	
	var router = new _vueRouter2.default({
	    //root:"/~zchenbn/click-animation",
	    root: "",
	    history: true,
	    saveScrollPosition: true
	});
	
	router.map({
	    '/': {
	        component: _NoBallDrop2.default
	    },
	    '/conglei': {
	        component: _CongleiBaseline2.default
	    },
	    '/no-foreshadow': {
	        component: _NoForeshadowBaseline2.default
	    }
	});
	
	router.start(_App2.default, '#app');
	
	// var v = new Vue({
	//     el: 'body',
	//     components: {
	//         ScreenScroll,
	//         NoBallDrop
	//     }
	// });

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * vue-router v0.7.13
	 * (c) 2016 Evan You
	 * Released under the MIT License.
	 */
	(function (global, factory) {
	   true ? module.exports = factory() :
	  typeof define === 'function' && define.amd ? define(factory) :
	  global.VueRouter = factory();
	}(this, function () { 'use strict';
	
	  var babelHelpers = {};
	
	  babelHelpers.classCallCheck = function (instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  };
	  function Target(path, matcher, delegate) {
	    this.path = path;
	    this.matcher = matcher;
	    this.delegate = delegate;
	  }
	
	  Target.prototype = {
	    to: function to(target, callback) {
	      var delegate = this.delegate;
	
	      if (delegate && delegate.willAddRoute) {
	        target = delegate.willAddRoute(this.matcher.target, target);
	      }
	
	      this.matcher.add(this.path, target);
	
	      if (callback) {
	        if (callback.length === 0) {
	          throw new Error("You must have an argument in the function passed to `to`");
	        }
	        this.matcher.addChild(this.path, target, callback, this.delegate);
	      }
	      return this;
	    }
	  };
	
	  function Matcher(target) {
	    this.routes = {};
	    this.children = {};
	    this.target = target;
	  }
	
	  Matcher.prototype = {
	    add: function add(path, handler) {
	      this.routes[path] = handler;
	    },
	
	    addChild: function addChild(path, target, callback, delegate) {
	      var matcher = new Matcher(target);
	      this.children[path] = matcher;
	
	      var match = generateMatch(path, matcher, delegate);
	
	      if (delegate && delegate.contextEntered) {
	        delegate.contextEntered(target, match);
	      }
	
	      callback(match);
	    }
	  };
	
	  function generateMatch(startingPath, matcher, delegate) {
	    return function (path, nestedCallback) {
	      var fullPath = startingPath + path;
	
	      if (nestedCallback) {
	        nestedCallback(generateMatch(fullPath, matcher, delegate));
	      } else {
	        return new Target(startingPath + path, matcher, delegate);
	      }
	    };
	  }
	
	  function addRoute(routeArray, path, handler) {
	    var len = 0;
	    for (var i = 0, l = routeArray.length; i < l; i++) {
	      len += routeArray[i].path.length;
	    }
	
	    path = path.substr(len);
	    var route = { path: path, handler: handler };
	    routeArray.push(route);
	  }
	
	  function eachRoute(baseRoute, matcher, callback, binding) {
	    var routes = matcher.routes;
	
	    for (var path in routes) {
	      if (routes.hasOwnProperty(path)) {
	        var routeArray = baseRoute.slice();
	        addRoute(routeArray, path, routes[path]);
	
	        if (matcher.children[path]) {
	          eachRoute(routeArray, matcher.children[path], callback, binding);
	        } else {
	          callback.call(binding, routeArray);
	        }
	      }
	    }
	  }
	
	  function map (callback, addRouteCallback) {
	    var matcher = new Matcher();
	
	    callback(generateMatch("", matcher, this.delegate));
	
	    eachRoute([], matcher, function (route) {
	      if (addRouteCallback) {
	        addRouteCallback(this, route);
	      } else {
	        this.add(route);
	      }
	    }, this);
	  }
	
	  var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
	
	  var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	
	  var noWarning = false;
	  function warn(msg) {
	    if (!noWarning && typeof console !== 'undefined') {
	      console.error('[vue-router] ' + msg);
	    }
	  }
	
	  function tryDecode(uri, asComponent) {
	    try {
	      return asComponent ? decodeURIComponent(uri) : decodeURI(uri);
	    } catch (e) {
	      warn('malformed URI' + (asComponent ? ' component: ' : ': ') + uri);
	    }
	  }
	
	  function isArray(test) {
	    return Object.prototype.toString.call(test) === "[object Array]";
	  }
	
	  // A Segment represents a segment in the original route description.
	  // Each Segment type provides an `eachChar` and `regex` method.
	  //
	  // The `eachChar` method invokes the callback with one or more character
	  // specifications. A character specification consumes one or more input
	  // characters.
	  //
	  // The `regex` method returns a regex fragment for the segment. If the
	  // segment is a dynamic of star segment, the regex fragment also includes
	  // a capture.
	  //
	  // A character specification contains:
	  //
	  // * `validChars`: a String with a list of all valid characters, or
	  // * `invalidChars`: a String with a list of all invalid characters
	  // * `repeat`: true if the character specification can repeat
	
	  function StaticSegment(string) {
	    this.string = string;
	  }
	  StaticSegment.prototype = {
	    eachChar: function eachChar(callback) {
	      var string = this.string,
	          ch;
	
	      for (var i = 0, l = string.length; i < l; i++) {
	        ch = string.charAt(i);
	        callback({ validChars: ch });
	      }
	    },
	
	    regex: function regex() {
	      return this.string.replace(escapeRegex, '\\$1');
	    },
	
	    generate: function generate() {
	      return this.string;
	    }
	  };
	
	  function DynamicSegment(name) {
	    this.name = name;
	  }
	  DynamicSegment.prototype = {
	    eachChar: function eachChar(callback) {
	      callback({ invalidChars: "/", repeat: true });
	    },
	
	    regex: function regex() {
	      return "([^/]+)";
	    },
	
	    generate: function generate(params) {
	      var val = params[this.name];
	      return val == null ? ":" + this.name : val;
	    }
	  };
	
	  function StarSegment(name) {
	    this.name = name;
	  }
	  StarSegment.prototype = {
	    eachChar: function eachChar(callback) {
	      callback({ invalidChars: "", repeat: true });
	    },
	
	    regex: function regex() {
	      return "(.+)";
	    },
	
	    generate: function generate(params) {
	      var val = params[this.name];
	      return val == null ? ":" + this.name : val;
	    }
	  };
	
	  function EpsilonSegment() {}
	  EpsilonSegment.prototype = {
	    eachChar: function eachChar() {},
	    regex: function regex() {
	      return "";
	    },
	    generate: function generate() {
	      return "";
	    }
	  };
	
	  function parse(route, names, specificity) {
	    // normalize route as not starting with a "/". Recognition will
	    // also normalize.
	    if (route.charAt(0) === "/") {
	      route = route.substr(1);
	    }
	
	    var segments = route.split("/"),
	        results = [];
	
	    // A routes has specificity determined by the order that its different segments
	    // appear in. This system mirrors how the magnitude of numbers written as strings
	    // works.
	    // Consider a number written as: "abc". An example would be "200". Any other number written
	    // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
	    // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
	    // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
	    // leading symbol, "1".
	    // The rule is that symbols to the left carry more weight than symbols to the right
	    // when a number is written out as a string. In the above strings, the leading digit
	    // represents how many 100's are in the number, and it carries more weight than the middle
	    // number which represents how many 10's are in the number.
	    // This system of number magnitude works well for route specificity, too. A route written as
	    // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
	    // `x`, irrespective of the other parts.
	    // Because of this similarity, we assign each type of segment a number value written as a
	    // string. We can find the specificity of compound routes by concatenating these strings
	    // together, from left to right. After we have looped through all of the segments,
	    // we convert the string to a number.
	    specificity.val = '';
	
	    for (var i = 0, l = segments.length; i < l; i++) {
	      var segment = segments[i],
	          match;
	
	      if (match = segment.match(/^:([^\/]+)$/)) {
	        results.push(new DynamicSegment(match[1]));
	        names.push(match[1]);
	        specificity.val += '3';
	      } else if (match = segment.match(/^\*([^\/]+)$/)) {
	        results.push(new StarSegment(match[1]));
	        specificity.val += '2';
	        names.push(match[1]);
	      } else if (segment === "") {
	        results.push(new EpsilonSegment());
	        specificity.val += '1';
	      } else {
	        results.push(new StaticSegment(segment));
	        specificity.val += '4';
	      }
	    }
	
	    specificity.val = +specificity.val;
	
	    return results;
	  }
	
	  // A State has a character specification and (`charSpec`) and a list of possible
	  // subsequent states (`nextStates`).
	  //
	  // If a State is an accepting state, it will also have several additional
	  // properties:
	  //
	  // * `regex`: A regular expression that is used to extract parameters from paths
	  //   that reached this accepting state.
	  // * `handlers`: Information on how to convert the list of captures into calls
	  //   to registered handlers with the specified parameters
	  // * `types`: How many static, dynamic or star segments in this route. Used to
	  //   decide which route to use if multiple registered routes match a path.
	  //
	  // Currently, State is implemented naively by looping over `nextStates` and
	  // comparing a character specification against a character. A more efficient
	  // implementation would use a hash of keys pointing at one or more next states.
	
	  function State(charSpec) {
	    this.charSpec = charSpec;
	    this.nextStates = [];
	  }
	
	  State.prototype = {
	    get: function get(charSpec) {
	      var nextStates = this.nextStates;
	
	      for (var i = 0, l = nextStates.length; i < l; i++) {
	        var child = nextStates[i];
	
	        var isEqual = child.charSpec.validChars === charSpec.validChars;
	        isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;
	
	        if (isEqual) {
	          return child;
	        }
	      }
	    },
	
	    put: function put(charSpec) {
	      var state;
	
	      // If the character specification already exists in a child of the current
	      // state, just return that state.
	      if (state = this.get(charSpec)) {
	        return state;
	      }
	
	      // Make a new state for the character spec
	      state = new State(charSpec);
	
	      // Insert the new state as a child of the current state
	      this.nextStates.push(state);
	
	      // If this character specification repeats, insert the new state as a child
	      // of itself. Note that this will not trigger an infinite loop because each
	      // transition during recognition consumes a character.
	      if (charSpec.repeat) {
	        state.nextStates.push(state);
	      }
	
	      // Return the new state
	      return state;
	    },
	
	    // Find a list of child states matching the next character
	    match: function match(ch) {
	      // DEBUG "Processing `" + ch + "`:"
	      var nextStates = this.nextStates,
	          child,
	          charSpec,
	          chars;
	
	      // DEBUG "  " + debugState(this)
	      var returned = [];
	
	      for (var i = 0, l = nextStates.length; i < l; i++) {
	        child = nextStates[i];
	
	        charSpec = child.charSpec;
	
	        if (typeof (chars = charSpec.validChars) !== 'undefined') {
	          if (chars.indexOf(ch) !== -1) {
	            returned.push(child);
	          }
	        } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
	          if (chars.indexOf(ch) === -1) {
	            returned.push(child);
	          }
	        }
	      }
	
	      return returned;
	    }
	
	    /** IF DEBUG
	    , debug: function() {
	      var charSpec = this.charSpec,
	          debug = "[",
	          chars = charSpec.validChars || charSpec.invalidChars;
	       if (charSpec.invalidChars) { debug += "^"; }
	      debug += chars;
	      debug += "]";
	       if (charSpec.repeat) { debug += "+"; }
	       return debug;
	    }
	    END IF **/
	  };
	
	  /** IF DEBUG
	  function debug(log) {
	    console.log(log);
	  }
	
	  function debugState(state) {
	    return state.nextStates.map(function(n) {
	      if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
	      return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
	    }).join(", ")
	  }
	  END IF **/
	
	  // Sort the routes by specificity
	  function sortSolutions(states) {
	    return states.sort(function (a, b) {
	      return b.specificity.val - a.specificity.val;
	    });
	  }
	
	  function recognizeChar(states, ch) {
	    var nextStates = [];
	
	    for (var i = 0, l = states.length; i < l; i++) {
	      var state = states[i];
	
	      nextStates = nextStates.concat(state.match(ch));
	    }
	
	    return nextStates;
	  }
	
	  var oCreate = Object.create || function (proto) {
	    function F() {}
	    F.prototype = proto;
	    return new F();
	  };
	
	  function RecognizeResults(queryParams) {
	    this.queryParams = queryParams || {};
	  }
	  RecognizeResults.prototype = oCreate({
	    splice: Array.prototype.splice,
	    slice: Array.prototype.slice,
	    push: Array.prototype.push,
	    length: 0,
	    queryParams: null
	  });
	
	  function findHandler(state, path, queryParams) {
	    var handlers = state.handlers,
	        regex = state.regex;
	    var captures = path.match(regex),
	        currentCapture = 1;
	    var result = new RecognizeResults(queryParams);
	
	    for (var i = 0, l = handlers.length; i < l; i++) {
	      var handler = handlers[i],
	          names = handler.names,
	          params = {};
	
	      for (var j = 0, m = names.length; j < m; j++) {
	        params[names[j]] = captures[currentCapture++];
	      }
	
	      result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
	    }
	
	    return result;
	  }
	
	  function addSegment(currentState, segment) {
	    segment.eachChar(function (ch) {
	      var state;
	
	      currentState = currentState.put(ch);
	    });
	
	    return currentState;
	  }
	
	  function decodeQueryParamPart(part) {
	    // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
	    part = part.replace(/\+/gm, '%20');
	    return tryDecode(part, true);
	  }
	
	  // The main interface
	
	  var RouteRecognizer = function RouteRecognizer() {
	    this.rootState = new State();
	    this.names = {};
	  };
	
	  RouteRecognizer.prototype = {
	    add: function add(routes, options) {
	      var currentState = this.rootState,
	          regex = "^",
	          specificity = {},
	          handlers = [],
	          allSegments = [],
	          name;
	
	      var isEmpty = true;
	
	      for (var i = 0, l = routes.length; i < l; i++) {
	        var route = routes[i],
	            names = [];
	
	        var segments = parse(route.path, names, specificity);
	
	        allSegments = allSegments.concat(segments);
	
	        for (var j = 0, m = segments.length; j < m; j++) {
	          var segment = segments[j];
	
	          if (segment instanceof EpsilonSegment) {
	            continue;
	          }
	
	          isEmpty = false;
	
	          // Add a "/" for the new segment
	          currentState = currentState.put({ validChars: "/" });
	          regex += "/";
	
	          // Add a representation of the segment to the NFA and regex
	          currentState = addSegment(currentState, segment);
	          regex += segment.regex();
	        }
	
	        var handler = { handler: route.handler, names: names };
	        handlers.push(handler);
	      }
	
	      if (isEmpty) {
	        currentState = currentState.put({ validChars: "/" });
	        regex += "/";
	      }
	
	      currentState.handlers = handlers;
	      currentState.regex = new RegExp(regex + "$");
	      currentState.specificity = specificity;
	
	      if (name = options && options.as) {
	        this.names[name] = {
	          segments: allSegments,
	          handlers: handlers
	        };
	      }
	    },
	
	    handlersFor: function handlersFor(name) {
	      var route = this.names[name],
	          result = [];
	      if (!route) {
	        throw new Error("There is no route named " + name);
	      }
	
	      for (var i = 0, l = route.handlers.length; i < l; i++) {
	        result.push(route.handlers[i]);
	      }
	
	      return result;
	    },
	
	    hasRoute: function hasRoute(name) {
	      return !!this.names[name];
	    },
	
	    generate: function generate(name, params) {
	      var route = this.names[name],
	          output = "";
	      if (!route) {
	        throw new Error("There is no route named " + name);
	      }
	
	      var segments = route.segments;
	
	      for (var i = 0, l = segments.length; i < l; i++) {
	        var segment = segments[i];
	
	        if (segment instanceof EpsilonSegment) {
	          continue;
	        }
	
	        output += "/";
	        output += segment.generate(params);
	      }
	
	      if (output.charAt(0) !== '/') {
	        output = '/' + output;
	      }
	
	      if (params && params.queryParams) {
	        output += this.generateQueryString(params.queryParams);
	      }
	
	      return output;
	    },
	
	    generateQueryString: function generateQueryString(params) {
	      var pairs = [];
	      var keys = [];
	      for (var key in params) {
	        if (params.hasOwnProperty(key)) {
	          keys.push(key);
	        }
	      }
	      keys.sort();
	      for (var i = 0, len = keys.length; i < len; i++) {
	        key = keys[i];
	        var value = params[key];
	        if (value == null) {
	          continue;
	        }
	        var pair = encodeURIComponent(key);
	        if (isArray(value)) {
	          for (var j = 0, l = value.length; j < l; j++) {
	            var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
	            pairs.push(arrayPair);
	          }
	        } else {
	          pair += "=" + encodeURIComponent(value);
	          pairs.push(pair);
	        }
	      }
	
	      if (pairs.length === 0) {
	        return '';
	      }
	
	      return "?" + pairs.join("&");
	    },
	
	    parseQueryString: function parseQueryString(queryString) {
	      var pairs = queryString.split("&"),
	          queryParams = {};
	      for (var i = 0; i < pairs.length; i++) {
	        var pair = pairs[i].split('='),
	            key = decodeQueryParamPart(pair[0]),
	            keyLength = key.length,
	            isArray = false,
	            value;
	        if (pair.length === 1) {
	          value = 'true';
	        } else {
	          //Handle arrays
	          if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
	            isArray = true;
	            key = key.slice(0, keyLength - 2);
	            if (!queryParams[key]) {
	              queryParams[key] = [];
	            }
	          }
	          value = pair[1] ? decodeQueryParamPart(pair[1]) : '';
	        }
	        if (isArray) {
	          queryParams[key].push(value);
	        } else {
	          queryParams[key] = value;
	        }
	      }
	      return queryParams;
	    },
	
	    recognize: function recognize(path, silent) {
	      noWarning = silent;
	      var states = [this.rootState],
	          pathLen,
	          i,
	          l,
	          queryStart,
	          queryParams = {},
	          isSlashDropped = false;
	
	      queryStart = path.indexOf('?');
	      if (queryStart !== -1) {
	        var queryString = path.substr(queryStart + 1, path.length);
	        path = path.substr(0, queryStart);
	        if (queryString) {
	          queryParams = this.parseQueryString(queryString);
	        }
	      }
	
	      path = tryDecode(path);
	      if (!path) return;
	
	      // DEBUG GROUP path
	
	      if (path.charAt(0) !== "/") {
	        path = "/" + path;
	      }
	
	      pathLen = path.length;
	      if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
	        path = path.substr(0, pathLen - 1);
	        isSlashDropped = true;
	      }
	
	      for (i = 0, l = path.length; i < l; i++) {
	        states = recognizeChar(states, path.charAt(i));
	        if (!states.length) {
	          break;
	        }
	      }
	
	      // END DEBUG GROUP
	
	      var solutions = [];
	      for (i = 0, l = states.length; i < l; i++) {
	        if (states[i].handlers) {
	          solutions.push(states[i]);
	        }
	      }
	
	      states = sortSolutions(solutions);
	
	      var state = solutions[0];
	
	      if (state && state.handlers) {
	        // if a trailing slash was dropped and a star segment is the last segment
	        // specified, put the trailing slash back
	        if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
	          path = path + "/";
	        }
	        return findHandler(state, path, queryParams);
	      }
	    }
	  };
	
	  RouteRecognizer.prototype.map = map;
	
	  var genQuery = RouteRecognizer.prototype.generateQueryString;
	
	  // export default for holding the Vue reference
	  var exports$1 = {};
	  /**
	   * Warn stuff.
	   *
	   * @param {String} msg
	   */
	
	  function warn$1(msg) {
	    /* istanbul ignore next */
	    if (typeof console !== 'undefined') {
	      console.error('[vue-router] ' + msg);
	    }
	  }
	
	  /**
	   * Resolve a relative path.
	   *
	   * @param {String} base
	   * @param {String} relative
	   * @param {Boolean} append
	   * @return {String}
	   */
	
	  function resolvePath(base, relative, append) {
	    var query = base.match(/(\?.*)$/);
	    if (query) {
	      query = query[1];
	      base = base.slice(0, -query.length);
	    }
	    // a query!
	    if (relative.charAt(0) === '?') {
	      return base + relative;
	    }
	    var stack = base.split('/');
	    // remove trailing segment if:
	    // - not appending
	    // - appending to trailing slash (last segment is empty)
	    if (!append || !stack[stack.length - 1]) {
	      stack.pop();
	    }
	    // resolve relative path
	    var segments = relative.replace(/^\//, '').split('/');
	    for (var i = 0; i < segments.length; i++) {
	      var segment = segments[i];
	      if (segment === '.') {
	        continue;
	      } else if (segment === '..') {
	        stack.pop();
	      } else {
	        stack.push(segment);
	      }
	    }
	    // ensure leading slash
	    if (stack[0] !== '') {
	      stack.unshift('');
	    }
	    return stack.join('/');
	  }
	
	  /**
	   * Forgiving check for a promise
	   *
	   * @param {Object} p
	   * @return {Boolean}
	   */
	
	  function isPromise(p) {
	    return p && typeof p.then === 'function';
	  }
	
	  /**
	   * Retrive a route config field from a component instance
	   * OR a component contructor.
	   *
	   * @param {Function|Vue} component
	   * @param {String} name
	   * @return {*}
	   */
	
	  function getRouteConfig(component, name) {
	    var options = component && (component.$options || component.options);
	    return options && options.route && options.route[name];
	  }
	
	  /**
	   * Resolve an async component factory. Have to do a dirty
	   * mock here because of Vue core's internal API depends on
	   * an ID check.
	   *
	   * @param {Object} handler
	   * @param {Function} cb
	   */
	
	  var resolver = undefined;
	
	  function resolveAsyncComponent(handler, cb) {
	    if (!resolver) {
	      resolver = {
	        resolve: exports$1.Vue.prototype._resolveComponent,
	        $options: {
	          components: {
	            _: handler.component
	          }
	        }
	      };
	    } else {
	      resolver.$options.components._ = handler.component;
	    }
	    resolver.resolve('_', function (Component) {
	      handler.component = Component;
	      cb(Component);
	    });
	  }
	
	  /**
	   * Map the dynamic segments in a path to params.
	   *
	   * @param {String} path
	   * @param {Object} params
	   * @param {Object} query
	   */
	
	  function mapParams(path, params, query) {
	    if (params === undefined) params = {};
	
	    path = path.replace(/:([^\/]+)/g, function (_, key) {
	      var val = params[key];
	      /* istanbul ignore if */
	      if (!val) {
	        warn$1('param "' + key + '" not found when generating ' + 'path for "' + path + '" with params ' + JSON.stringify(params));
	      }
	      return val || '';
	    });
	    if (query) {
	      path += genQuery(query);
	    }
	    return path;
	  }
	
	  var hashRE = /#.*$/;
	
	  var HTML5History = (function () {
	    function HTML5History(_ref) {
	      var root = _ref.root;
	      var onChange = _ref.onChange;
	      babelHelpers.classCallCheck(this, HTML5History);
	
	      if (root && root !== '/') {
	        // make sure there's the starting slash
	        if (root.charAt(0) !== '/') {
	          root = '/' + root;
	        }
	        // remove trailing slash
	        this.root = root.replace(/\/$/, '');
	        this.rootRE = new RegExp('^\\' + this.root);
	      } else {
	        this.root = null;
	      }
	      this.onChange = onChange;
	      // check base tag
	      var baseEl = document.querySelector('base');
	      this.base = baseEl && baseEl.getAttribute('href');
	    }
	
	    HTML5History.prototype.start = function start() {
	      var _this = this;
	
	      this.listener = function (e) {
	        var url = location.pathname + location.search;
	        if (_this.root) {
	          url = url.replace(_this.rootRE, '');
	        }
	        _this.onChange(url, e && e.state, location.hash);
	      };
	      window.addEventListener('popstate', this.listener);
	      this.listener();
	    };
	
	    HTML5History.prototype.stop = function stop() {
	      window.removeEventListener('popstate', this.listener);
	    };
	
	    HTML5History.prototype.go = function go(path, replace, append) {
	      var url = this.formatPath(path, append);
	      if (replace) {
	        history.replaceState({}, '', url);
	      } else {
	        // record scroll position by replacing current state
	        history.replaceState({
	          pos: {
	            x: window.pageXOffset,
	            y: window.pageYOffset
	          }
	        }, '', location.href);
	        // then push new state
	        history.pushState({}, '', url);
	      }
	      var hashMatch = path.match(hashRE);
	      var hash = hashMatch && hashMatch[0];
	      path = url
	      // strip hash so it doesn't mess up params
	      .replace(hashRE, '')
	      // remove root before matching
	      .replace(this.rootRE, '');
	      this.onChange(path, null, hash);
	    };
	
	    HTML5History.prototype.formatPath = function formatPath(path, append) {
	      return path.charAt(0) === '/'
	      // absolute path
	      ? this.root ? this.root + '/' + path.replace(/^\//, '') : path : resolvePath(this.base || location.pathname, path, append);
	    };
	
	    return HTML5History;
	  })();
	
	  var HashHistory = (function () {
	    function HashHistory(_ref) {
	      var hashbang = _ref.hashbang;
	      var onChange = _ref.onChange;
	      babelHelpers.classCallCheck(this, HashHistory);
	
	      this.hashbang = hashbang;
	      this.onChange = onChange;
	    }
	
	    HashHistory.prototype.start = function start() {
	      var self = this;
	      this.listener = function () {
	        var path = location.hash;
	        var raw = path.replace(/^#!?/, '');
	        // always
	        if (raw.charAt(0) !== '/') {
	          raw = '/' + raw;
	        }
	        var formattedPath = self.formatPath(raw);
	        if (formattedPath !== path) {
	          location.replace(formattedPath);
	          return;
	        }
	        // determine query
	        // note it's possible to have queries in both the actual URL
	        // and the hash fragment itself.
	        var query = location.search && path.indexOf('?') > -1 ? '&' + location.search.slice(1) : location.search;
	        self.onChange(path.replace(/^#!?/, '') + query);
	      };
	      window.addEventListener('hashchange', this.listener);
	      this.listener();
	    };
	
	    HashHistory.prototype.stop = function stop() {
	      window.removeEventListener('hashchange', this.listener);
	    };
	
	    HashHistory.prototype.go = function go(path, replace, append) {
	      path = this.formatPath(path, append);
	      if (replace) {
	        location.replace(path);
	      } else {
	        location.hash = path;
	      }
	    };
	
	    HashHistory.prototype.formatPath = function formatPath(path, append) {
	      var isAbsoloute = path.charAt(0) === '/';
	      var prefix = '#' + (this.hashbang ? '!' : '');
	      return isAbsoloute ? prefix + path : prefix + resolvePath(location.hash.replace(/^#!?/, ''), path, append);
	    };
	
	    return HashHistory;
	  })();
	
	  var AbstractHistory = (function () {
	    function AbstractHistory(_ref) {
	      var onChange = _ref.onChange;
	      babelHelpers.classCallCheck(this, AbstractHistory);
	
	      this.onChange = onChange;
	      this.currentPath = '/';
	    }
	
	    AbstractHistory.prototype.start = function start() {
	      this.onChange('/');
	    };
	
	    AbstractHistory.prototype.stop = function stop() {
	      // noop
	    };
	
	    AbstractHistory.prototype.go = function go(path, replace, append) {
	      path = this.currentPath = this.formatPath(path, append);
	      this.onChange(path);
	    };
	
	    AbstractHistory.prototype.formatPath = function formatPath(path, append) {
	      return path.charAt(0) === '/' ? path : resolvePath(this.currentPath, path, append);
	    };
	
	    return AbstractHistory;
	  })();
	
	  /**
	   * Determine the reusability of an existing router view.
	   *
	   * @param {Directive} view
	   * @param {Object} handler
	   * @param {Transition} transition
	   */
	
	  function canReuse(view, handler, transition) {
	    var component = view.childVM;
	    if (!component || !handler) {
	      return false;
	    }
	    // important: check view.Component here because it may
	    // have been changed in activate hook
	    if (view.Component !== handler.component) {
	      return false;
	    }
	    var canReuseFn = getRouteConfig(component, 'canReuse');
	    return typeof canReuseFn === 'boolean' ? canReuseFn : canReuseFn ? canReuseFn.call(component, {
	      to: transition.to,
	      from: transition.from
	    }) : true; // defaults to true
	  }
	
	  /**
	   * Check if a component can deactivate.
	   *
	   * @param {Directive} view
	   * @param {Transition} transition
	   * @param {Function} next
	   */
	
	  function canDeactivate(view, transition, next) {
	    var fromComponent = view.childVM;
	    var hook = getRouteConfig(fromComponent, 'canDeactivate');
	    if (!hook) {
	      next();
	    } else {
	      transition.callHook(hook, fromComponent, next, {
	        expectBoolean: true
	      });
	    }
	  }
	
	  /**
	   * Check if a component can activate.
	   *
	   * @param {Object} handler
	   * @param {Transition} transition
	   * @param {Function} next
	   */
	
	  function canActivate(handler, transition, next) {
	    resolveAsyncComponent(handler, function (Component) {
	      // have to check due to async-ness
	      if (transition.aborted) {
	        return;
	      }
	      // determine if this component can be activated
	      var hook = getRouteConfig(Component, 'canActivate');
	      if (!hook) {
	        next();
	      } else {
	        transition.callHook(hook, null, next, {
	          expectBoolean: true
	        });
	      }
	    });
	  }
	
	  /**
	   * Call deactivate hooks for existing router-views.
	   *
	   * @param {Directive} view
	   * @param {Transition} transition
	   * @param {Function} next
	   */
	
	  function deactivate(view, transition, next) {
	    var component = view.childVM;
	    var hook = getRouteConfig(component, 'deactivate');
	    if (!hook) {
	      next();
	    } else {
	      transition.callHooks(hook, component, next);
	    }
	  }
	
	  /**
	   * Activate / switch component for a router-view.
	   *
	   * @param {Directive} view
	   * @param {Transition} transition
	   * @param {Number} depth
	   * @param {Function} [cb]
	   */
	
	  function activate(view, transition, depth, cb, reuse) {
	    var handler = transition.activateQueue[depth];
	    if (!handler) {
	      saveChildView(view);
	      if (view._bound) {
	        view.setComponent(null);
	      }
	      cb && cb();
	      return;
	    }
	
	    var Component = view.Component = handler.component;
	    var activateHook = getRouteConfig(Component, 'activate');
	    var dataHook = getRouteConfig(Component, 'data');
	    var waitForData = getRouteConfig(Component, 'waitForData');
	
	    view.depth = depth;
	    view.activated = false;
	
	    var component = undefined;
	    var loading = !!(dataHook && !waitForData);
	
	    // "reuse" is a flag passed down when the parent view is
	    // either reused via keep-alive or as a child of a kept-alive view.
	    // of course we can only reuse if the current kept-alive instance
	    // is of the correct type.
	    reuse = reuse && view.childVM && view.childVM.constructor === Component;
	
	    if (reuse) {
	      // just reuse
	      component = view.childVM;
	      component.$loadingRouteData = loading;
	    } else {
	      saveChildView(view);
	
	      // unbuild current component. this step also destroys
	      // and removes all nested child views.
	      view.unbuild(true);
	
	      // build the new component. this will also create the
	      // direct child view of the current one. it will register
	      // itself as view.childView.
	      component = view.build({
	        _meta: {
	          $loadingRouteData: loading
	        },
	        created: function created() {
	          this._routerView = view;
	        }
	      });
	
	      // handle keep-alive.
	      // when a kept-alive child vm is restored, we need to
	      // add its cached child views into the router's view list,
	      // and also properly update current view's child view.
	      if (view.keepAlive) {
	        component.$loadingRouteData = loading;
	        var cachedChildView = component._keepAliveRouterView;
	        if (cachedChildView) {
	          view.childView = cachedChildView;
	          component._keepAliveRouterView = null;
	        }
	      }
	    }
	
	    // cleanup the component in case the transition is aborted
	    // before the component is ever inserted.
	    var cleanup = function cleanup() {
	      component.$destroy();
	    };
	
	    // actually insert the component and trigger transition
	    var insert = function insert() {
	      if (reuse) {
	        cb && cb();
	        return;
	      }
	      var router = transition.router;
	      if (router._rendered || router._transitionOnLoad) {
	        view.transition(component);
	      } else {
	        // no transition on first render, manual transition
	        /* istanbul ignore if */
	        if (view.setCurrent) {
	          // 0.12 compat
	          view.setCurrent(component);
	        } else {
	          // 1.0
	          view.childVM = component;
	        }
	        component.$before(view.anchor, null, false);
	      }
	      cb && cb();
	    };
	
	    var afterData = function afterData() {
	      // activate the child view
	      if (view.childView) {
	        activate(view.childView, transition, depth + 1, null, reuse || view.keepAlive);
	      }
	      insert();
	    };
	
	    // called after activation hook is resolved
	    var afterActivate = function afterActivate() {
	      view.activated = true;
	      if (dataHook && waitForData) {
	        // wait until data loaded to insert
	        loadData(component, transition, dataHook, afterData, cleanup);
	      } else {
	        // load data and insert at the same time
	        if (dataHook) {
	          loadData(component, transition, dataHook);
	        }
	        afterData();
	      }
	    };
	
	    if (activateHook) {
	      transition.callHooks(activateHook, component, afterActivate, {
	        cleanup: cleanup,
	        postActivate: true
	      });
	    } else {
	      afterActivate();
	    }
	  }
	
	  /**
	   * Reuse a view, just reload data if necessary.
	   *
	   * @param {Directive} view
	   * @param {Transition} transition
	   */
	
	  function reuse(view, transition) {
	    var component = view.childVM;
	    var dataHook = getRouteConfig(component, 'data');
	    if (dataHook) {
	      loadData(component, transition, dataHook);
	    }
	  }
	
	  /**
	   * Asynchronously load and apply data to component.
	   *
	   * @param {Vue} component
	   * @param {Transition} transition
	   * @param {Function} hook
	   * @param {Function} cb
	   * @param {Function} cleanup
	   */
	
	  function loadData(component, transition, hook, cb, cleanup) {
	    component.$loadingRouteData = true;
	    transition.callHooks(hook, component, function () {
	      component.$loadingRouteData = false;
	      component.$emit('route-data-loaded', component);
	      cb && cb();
	    }, {
	      cleanup: cleanup,
	      postActivate: true,
	      processData: function processData(data) {
	        // handle promise sugar syntax
	        var promises = [];
	        if (isPlainObject(data)) {
	          Object.keys(data).forEach(function (key) {
	            var val = data[key];
	            if (isPromise(val)) {
	              promises.push(val.then(function (resolvedVal) {
	                component.$set(key, resolvedVal);
	              }));
	            } else {
	              component.$set(key, val);
	            }
	          });
	        }
	        if (promises.length) {
	          return promises[0].constructor.all(promises);
	        }
	      }
	    });
	  }
	
	  /**
	   * Save the child view for a kept-alive view so that
	   * we can restore it when it is switched back to.
	   *
	   * @param {Directive} view
	   */
	
	  function saveChildView(view) {
	    if (view.keepAlive && view.childVM && view.childView) {
	      view.childVM._keepAliveRouterView = view.childView;
	    }
	    view.childView = null;
	  }
	
	  /**
	   * Check plain object.
	   *
	   * @param {*} val
	   */
	
	  function isPlainObject(val) {
	    return Object.prototype.toString.call(val) === '[object Object]';
	  }
	
	  /**
	   * A RouteTransition object manages the pipeline of a
	   * router-view switching process. This is also the object
	   * passed into user route hooks.
	   *
	   * @param {Router} router
	   * @param {Route} to
	   * @param {Route} from
	   */
	
	  var RouteTransition = (function () {
	    function RouteTransition(router, to, from) {
	      babelHelpers.classCallCheck(this, RouteTransition);
	
	      this.router = router;
	      this.to = to;
	      this.from = from;
	      this.next = null;
	      this.aborted = false;
	      this.done = false;
	    }
	
	    /**
	     * Abort current transition and return to previous location.
	     */
	
	    RouteTransition.prototype.abort = function abort() {
	      if (!this.aborted) {
	        this.aborted = true;
	        // if the root path throws an error during validation
	        // on initial load, it gets caught in an infinite loop.
	        var abortingOnLoad = !this.from.path && this.to.path === '/';
	        if (!abortingOnLoad) {
	          this.router.replace(this.from.path || '/');
	        }
	      }
	    };
	
	    /**
	     * Abort current transition and redirect to a new location.
	     *
	     * @param {String} path
	     */
	
	    RouteTransition.prototype.redirect = function redirect(path) {
	      if (!this.aborted) {
	        this.aborted = true;
	        if (typeof path === 'string') {
	          path = mapParams(path, this.to.params, this.to.query);
	        } else {
	          path.params = path.params || this.to.params;
	          path.query = path.query || this.to.query;
	        }
	        this.router.replace(path);
	      }
	    };
	
	    /**
	     * A router view transition's pipeline can be described as
	     * follows, assuming we are transitioning from an existing
	     * <router-view> chain [Component A, Component B] to a new
	     * chain [Component A, Component C]:
	     *
	     *  A    A
	     *  | => |
	     *  B    C
	     *
	     * 1. Reusablity phase:
	     *   -> canReuse(A, A)
	     *   -> canReuse(B, C)
	     *   -> determine new queues:
	     *      - deactivation: [B]
	     *      - activation: [C]
	     *
	     * 2. Validation phase:
	     *   -> canDeactivate(B)
	     *   -> canActivate(C)
	     *
	     * 3. Activation phase:
	     *   -> deactivate(B)
	     *   -> activate(C)
	     *
	     * Each of these steps can be asynchronous, and any
	     * step can potentially abort the transition.
	     *
	     * @param {Function} cb
	     */
	
	    RouteTransition.prototype.start = function start(cb) {
	      var transition = this;
	
	      // determine the queue of views to deactivate
	      var deactivateQueue = [];
	      var view = this.router._rootView;
	      while (view) {
	        deactivateQueue.unshift(view);
	        view = view.childView;
	      }
	      var reverseDeactivateQueue = deactivateQueue.slice().reverse();
	
	      // determine the queue of route handlers to activate
	      var activateQueue = this.activateQueue = toArray(this.to.matched).map(function (match) {
	        return match.handler;
	      });
	
	      // 1. Reusability phase
	      var i = undefined,
	          reuseQueue = undefined;
	      for (i = 0; i < reverseDeactivateQueue.length; i++) {
	        if (!canReuse(reverseDeactivateQueue[i], activateQueue[i], transition)) {
	          break;
	        }
	      }
	      if (i > 0) {
	        reuseQueue = reverseDeactivateQueue.slice(0, i);
	        deactivateQueue = reverseDeactivateQueue.slice(i).reverse();
	        activateQueue = activateQueue.slice(i);
	      }
	
	      // 2. Validation phase
	      transition.runQueue(deactivateQueue, canDeactivate, function () {
	        transition.runQueue(activateQueue, canActivate, function () {
	          transition.runQueue(deactivateQueue, deactivate, function () {
	            // 3. Activation phase
	
	            // Update router current route
	            transition.router._onTransitionValidated(transition);
	
	            // trigger reuse for all reused views
	            reuseQueue && reuseQueue.forEach(function (view) {
	              return reuse(view, transition);
	            });
	
	            // the root of the chain that needs to be replaced
	            // is the top-most non-reusable view.
	            if (deactivateQueue.length) {
	              var _view = deactivateQueue[deactivateQueue.length - 1];
	              var depth = reuseQueue ? reuseQueue.length : 0;
	              activate(_view, transition, depth, cb);
	            } else {
	              cb();
	            }
	          });
	        });
	      });
	    };
	
	    /**
	     * Asynchronously and sequentially apply a function to a
	     * queue.
	     *
	     * @param {Array} queue
	     * @param {Function} fn
	     * @param {Function} cb
	     */
	
	    RouteTransition.prototype.runQueue = function runQueue(queue, fn, cb) {
	      var transition = this;
	      step(0);
	      function step(index) {
	        if (index >= queue.length) {
	          cb();
	        } else {
	          fn(queue[index], transition, function () {
	            step(index + 1);
	          });
	        }
	      }
	    };
	
	    /**
	     * Call a user provided route transition hook and handle
	     * the response (e.g. if the user returns a promise).
	     *
	     * If the user neither expects an argument nor returns a
	     * promise, the hook is assumed to be synchronous.
	     *
	     * @param {Function} hook
	     * @param {*} [context]
	     * @param {Function} [cb]
	     * @param {Object} [options]
	     *                 - {Boolean} expectBoolean
	     *                 - {Boolean} postActive
	     *                 - {Function} processData
	     *                 - {Function} cleanup
	     */
	
	    RouteTransition.prototype.callHook = function callHook(hook, context, cb) {
	      var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	
	      var _ref$expectBoolean = _ref.expectBoolean;
	      var expectBoolean = _ref$expectBoolean === undefined ? false : _ref$expectBoolean;
	      var _ref$postActivate = _ref.postActivate;
	      var postActivate = _ref$postActivate === undefined ? false : _ref$postActivate;
	      var processData = _ref.processData;
	      var cleanup = _ref.cleanup;
	
	      var transition = this;
	      var nextCalled = false;
	
	      // abort the transition
	      var abort = function abort() {
	        cleanup && cleanup();
	        transition.abort();
	      };
	
	      // handle errors
	      var onError = function onError(err) {
	        postActivate ? next() : abort();
	        if (err && !transition.router._suppress) {
	          warn$1('Uncaught error during transition: ');
	          throw err instanceof Error ? err : new Error(err);
	        }
	      };
	
	      // since promise swallows errors, we have to
	      // throw it in the next tick...
	      var onPromiseError = function onPromiseError(err) {
	        try {
	          onError(err);
	        } catch (e) {
	          setTimeout(function () {
	            throw e;
	          }, 0);
	        }
	      };
	
	      // advance the transition to the next step
	      var next = function next() {
	        if (nextCalled) {
	          warn$1('transition.next() should be called only once.');
	          return;
	        }
	        nextCalled = true;
	        if (transition.aborted) {
	          cleanup && cleanup();
	          return;
	        }
	        cb && cb();
	      };
	
	      var nextWithBoolean = function nextWithBoolean(res) {
	        if (typeof res === 'boolean') {
	          res ? next() : abort();
	        } else if (isPromise(res)) {
	          res.then(function (ok) {
	            ok ? next() : abort();
	          }, onPromiseError);
	        } else if (!hook.length) {
	          next();
	        }
	      };
	
	      var nextWithData = function nextWithData(data) {
	        var res = undefined;
	        try {
	          res = processData(data);
	        } catch (err) {
	          return onError(err);
	        }
	        if (isPromise(res)) {
	          res.then(next, onPromiseError);
	        } else {
	          next();
	        }
	      };
	
	      // expose a clone of the transition object, so that each
	      // hook gets a clean copy and prevent the user from
	      // messing with the internals.
	      var exposed = {
	        to: transition.to,
	        from: transition.from,
	        abort: abort,
	        next: processData ? nextWithData : next,
	        redirect: function redirect() {
	          transition.redirect.apply(transition, arguments);
	        }
	      };
	
	      // actually call the hook
	      var res = undefined;
	      try {
	        res = hook.call(context, exposed);
	      } catch (err) {
	        return onError(err);
	      }
	
	      if (expectBoolean) {
	        // boolean hooks
	        nextWithBoolean(res);
	      } else if (isPromise(res)) {
	        // promise
	        if (processData) {
	          res.then(nextWithData, onPromiseError);
	        } else {
	          res.then(next, onPromiseError);
	        }
	      } else if (processData && isPlainOjbect(res)) {
	        // data promise sugar
	        nextWithData(res);
	      } else if (!hook.length) {
	        next();
	      }
	    };
	
	    /**
	     * Call a single hook or an array of async hooks in series.
	     *
	     * @param {Array} hooks
	     * @param {*} context
	     * @param {Function} cb
	     * @param {Object} [options]
	     */
	
	    RouteTransition.prototype.callHooks = function callHooks(hooks, context, cb, options) {
	      var _this = this;
	
	      if (Array.isArray(hooks)) {
	        this.runQueue(hooks, function (hook, _, next) {
	          if (!_this.aborted) {
	            _this.callHook(hook, context, next, options);
	          }
	        }, cb);
	      } else {
	        this.callHook(hooks, context, cb, options);
	      }
	    };
	
	    return RouteTransition;
	  })();
	
	  function isPlainOjbect(val) {
	    return Object.prototype.toString.call(val) === '[object Object]';
	  }
	
	  function toArray(val) {
	    return val ? Array.prototype.slice.call(val) : [];
	  }
	
	  var internalKeysRE = /^(component|subRoutes|fullPath)$/;
	
	  /**
	   * Route Context Object
	   *
	   * @param {String} path
	   * @param {Router} router
	   */
	
	  var Route = function Route(path, router) {
	    var _this = this;
	
	    babelHelpers.classCallCheck(this, Route);
	
	    var matched = router._recognizer.recognize(path);
	    if (matched) {
	      // copy all custom fields from route configs
	      [].forEach.call(matched, function (match) {
	        for (var key in match.handler) {
	          if (!internalKeysRE.test(key)) {
	            _this[key] = match.handler[key];
	          }
	        }
	      });
	      // set query and params
	      this.query = matched.queryParams;
	      this.params = [].reduce.call(matched, function (prev, cur) {
	        if (cur.params) {
	          for (var key in cur.params) {
	            prev[key] = cur.params[key];
	          }
	        }
	        return prev;
	      }, {});
	    }
	    // expose path and router
	    this.path = path;
	    // for internal use
	    this.matched = matched || router._notFoundHandler;
	    // internal reference to router
	    Object.defineProperty(this, 'router', {
	      enumerable: false,
	      value: router
	    });
	    // Important: freeze self to prevent observation
	    Object.freeze(this);
	  };
	
	  function applyOverride (Vue) {
	    var _Vue$util = Vue.util;
	    var extend = _Vue$util.extend;
	    var isArray = _Vue$util.isArray;
	    var defineReactive = _Vue$util.defineReactive;
	
	    // override Vue's init and destroy process to keep track of router instances
	    var init = Vue.prototype._init;
	    Vue.prototype._init = function (options) {
	      options = options || {};
	      var root = options._parent || options.parent || this;
	      var router = root.$router;
	      var route = root.$route;
	      if (router) {
	        // expose router
	        this.$router = router;
	        router._children.push(this);
	        /* istanbul ignore if */
	        if (this._defineMeta) {
	          // 0.12
	          this._defineMeta('$route', route);
	        } else {
	          // 1.0
	          defineReactive(this, '$route', route);
	        }
	      }
	      init.call(this, options);
	    };
	
	    var destroy = Vue.prototype._destroy;
	    Vue.prototype._destroy = function () {
	      if (!this._isBeingDestroyed && this.$router) {
	        this.$router._children.$remove(this);
	      }
	      destroy.apply(this, arguments);
	    };
	
	    // 1.0 only: enable route mixins
	    var strats = Vue.config.optionMergeStrategies;
	    var hooksToMergeRE = /^(data|activate|deactivate)$/;
	
	    if (strats) {
	      strats.route = function (parentVal, childVal) {
	        if (!childVal) return parentVal;
	        if (!parentVal) return childVal;
	        var ret = {};
	        extend(ret, parentVal);
	        for (var key in childVal) {
	          var a = ret[key];
	          var b = childVal[key];
	          // for data, activate and deactivate, we need to merge them into
	          // arrays similar to lifecycle hooks.
	          if (a && hooksToMergeRE.test(key)) {
	            ret[key] = (isArray(a) ? a : [a]).concat(b);
	          } else {
	            ret[key] = b;
	          }
	        }
	        return ret;
	      };
	    }
	  }
	
	  function View (Vue) {
	
	    var _ = Vue.util;
	    var componentDef =
	    // 0.12
	    Vue.directive('_component') ||
	    // 1.0
	    Vue.internalDirectives.component;
	    // <router-view> extends the internal component directive
	    var viewDef = _.extend({}, componentDef);
	
	    // with some overrides
	    _.extend(viewDef, {
	
	      _isRouterView: true,
	
	      bind: function bind() {
	        var route = this.vm.$route;
	        /* istanbul ignore if */
	        if (!route) {
	          warn$1('<router-view> can only be used inside a ' + 'router-enabled app.');
	          return;
	        }
	        // force dynamic directive so v-component doesn't
	        // attempt to build right now
	        this._isDynamicLiteral = true;
	        // finally, init by delegating to v-component
	        componentDef.bind.call(this);
	
	        // locate the parent view
	        var parentView = undefined;
	        var parent = this.vm;
	        while (parent) {
	          if (parent._routerView) {
	            parentView = parent._routerView;
	            break;
	          }
	          parent = parent.$parent;
	        }
	        if (parentView) {
	          // register self as a child of the parent view,
	          // instead of activating now. This is so that the
	          // child's activate hook is called after the
	          // parent's has resolved.
	          this.parentView = parentView;
	          parentView.childView = this;
	        } else {
	          // this is the root view!
	          var router = route.router;
	          router._rootView = this;
	        }
	
	        // handle late-rendered view
	        // two possibilities:
	        // 1. root view rendered after transition has been
	        //    validated;
	        // 2. child view rendered after parent view has been
	        //    activated.
	        var transition = route.router._currentTransition;
	        if (!parentView && transition.done || parentView && parentView.activated) {
	          var depth = parentView ? parentView.depth + 1 : 0;
	          activate(this, transition, depth);
	        }
	      },
	
	      unbind: function unbind() {
	        if (this.parentView) {
	          this.parentView.childView = null;
	        }
	        componentDef.unbind.call(this);
	      }
	    });
	
	    Vue.elementDirective('router-view', viewDef);
	  }
	
	  var trailingSlashRE = /\/$/;
	  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
	  var queryStringRE = /\?.*$/;
	
	  // install v-link, which provides navigation support for
	  // HTML5 history mode
	  function Link (Vue) {
	    var _Vue$util = Vue.util;
	    var _bind = _Vue$util.bind;
	    var isObject = _Vue$util.isObject;
	    var addClass = _Vue$util.addClass;
	    var removeClass = _Vue$util.removeClass;
	
	    var onPriority = Vue.directive('on').priority;
	    var LINK_UPDATE = '__vue-router-link-update__';
	
	    var activeId = 0;
	
	    Vue.directive('link-active', {
	      priority: 9999,
	      bind: function bind() {
	        var _this = this;
	
	        var id = String(activeId++);
	        // collect v-links contained within this element.
	        // we need do this here before the parent-child relationship
	        // gets messed up by terminal directives (if, for, components)
	        var childLinks = this.el.querySelectorAll('[v-link]');
	        for (var i = 0, l = childLinks.length; i < l; i++) {
	          var link = childLinks[i];
	          var existingId = link.getAttribute(LINK_UPDATE);
	          var value = existingId ? existingId + ',' + id : id;
	          // leave a mark on the link element which can be persisted
	          // through fragment clones.
	          link.setAttribute(LINK_UPDATE, value);
	        }
	        this.vm.$on(LINK_UPDATE, this.cb = function (link, path) {
	          if (link.activeIds.indexOf(id) > -1) {
	            link.updateClasses(path, _this.el);
	          }
	        });
	      },
	      unbind: function unbind() {
	        this.vm.$off(LINK_UPDATE, this.cb);
	      }
	    });
	
	    Vue.directive('link', {
	      priority: onPriority - 2,
	
	      bind: function bind() {
	        var vm = this.vm;
	        /* istanbul ignore if */
	        if (!vm.$route) {
	          warn$1('v-link can only be used inside a router-enabled app.');
	          return;
	        }
	        this.router = vm.$route.router;
	        // update things when the route changes
	        this.unwatch = vm.$watch('$route', _bind(this.onRouteUpdate, this));
	        // check v-link-active ids
	        var activeIds = this.el.getAttribute(LINK_UPDATE);
	        if (activeIds) {
	          this.el.removeAttribute(LINK_UPDATE);
	          this.activeIds = activeIds.split(',');
	        }
	        // no need to handle click if link expects to be opened
	        // in a new window/tab.
	        /* istanbul ignore if */
	        if (this.el.tagName === 'A' && this.el.getAttribute('target') === '_blank') {
	          return;
	        }
	        // handle click
	        this.handler = _bind(this.onClick, this);
	        this.el.addEventListener('click', this.handler);
	      },
	
	      update: function update(target) {
	        this.target = target;
	        if (isObject(target)) {
	          this.append = target.append;
	          this.exact = target.exact;
	          this.prevActiveClass = this.activeClass;
	          this.activeClass = target.activeClass;
	        }
	        this.onRouteUpdate(this.vm.$route);
	      },
	
	      onClick: function onClick(e) {
	        // don't redirect with control keys
	        /* istanbul ignore if */
	        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
	        // don't redirect when preventDefault called
	        /* istanbul ignore if */
	        if (e.defaultPrevented) return;
	        // don't redirect on right click
	        /* istanbul ignore if */
	        if (e.button !== 0) return;
	
	        var target = this.target;
	        if (target) {
	          // v-link with expression, just go
	          e.preventDefault();
	          this.router.go(target);
	        } else {
	          // no expression, delegate for an <a> inside
	          var el = e.target;
	          while (el.tagName !== 'A' && el !== this.el) {
	            el = el.parentNode;
	          }
	          if (el.tagName === 'A' && sameOrigin(el)) {
	            e.preventDefault();
	            var path = el.pathname;
	            if (this.router.history.root) {
	              path = path.replace(this.router.history.rootRE, '');
	            }
	            this.router.go({
	              path: path,
	              replace: target && target.replace,
	              append: target && target.append
	            });
	          }
	        }
	      },
	
	      onRouteUpdate: function onRouteUpdate(route) {
	        // router.stringifyPath is dependent on current route
	        // and needs to be called again whenver route changes.
	        var newPath = this.router.stringifyPath(this.target);
	        if (this.path !== newPath) {
	          this.path = newPath;
	          this.updateActiveMatch();
	          this.updateHref();
	        }
	        if (this.activeIds) {
	          this.vm.$emit(LINK_UPDATE, this, route.path);
	        } else {
	          this.updateClasses(route.path, this.el);
	        }
	      },
	
	      updateActiveMatch: function updateActiveMatch() {
	        this.activeRE = this.path && !this.exact ? new RegExp('^' + this.path.replace(/\/$/, '').replace(queryStringRE, '').replace(regexEscapeRE, '\\$&') + '(\\/|$)') : null;
	      },
	
	      updateHref: function updateHref() {
	        if (this.el.tagName !== 'A') {
	          return;
	        }
	        var path = this.path;
	        var router = this.router;
	        var isAbsolute = path.charAt(0) === '/';
	        // do not format non-hash relative paths
	        var href = path && (router.mode === 'hash' || isAbsolute) ? router.history.formatPath(path, this.append) : path;
	        if (href) {
	          this.el.href = href;
	        } else {
	          this.el.removeAttribute('href');
	        }
	      },
	
	      updateClasses: function updateClasses(path, el) {
	        var activeClass = this.activeClass || this.router._linkActiveClass;
	        // clear old class
	        if (this.prevActiveClass && this.prevActiveClass !== activeClass) {
	          toggleClasses(el, this.prevActiveClass, removeClass);
	        }
	        // remove query string before matching
	        var dest = this.path.replace(queryStringRE, '');
	        path = path.replace(queryStringRE, '');
	        // add new class
	        if (this.exact) {
	          if (dest === path ||
	          // also allow additional trailing slash
	          dest.charAt(dest.length - 1) !== '/' && dest === path.replace(trailingSlashRE, '')) {
	            toggleClasses(el, activeClass, addClass);
	          } else {
	            toggleClasses(el, activeClass, removeClass);
	          }
	        } else {
	          if (this.activeRE && this.activeRE.test(path)) {
	            toggleClasses(el, activeClass, addClass);
	          } else {
	            toggleClasses(el, activeClass, removeClass);
	          }
	        }
	      },
	
	      unbind: function unbind() {
	        this.el.removeEventListener('click', this.handler);
	        this.unwatch && this.unwatch();
	      }
	    });
	
	    function sameOrigin(link) {
	      return link.protocol === location.protocol && link.hostname === location.hostname && link.port === location.port;
	    }
	
	    // this function is copied from v-bind:class implementation until
	    // we properly expose it...
	    function toggleClasses(el, key, fn) {
	      key = key.trim();
	      if (key.indexOf(' ') === -1) {
	        fn(el, key);
	        return;
	      }
	      var keys = key.split(/\s+/);
	      for (var i = 0, l = keys.length; i < l; i++) {
	        fn(el, keys[i]);
	      }
	    }
	  }
	
	  var historyBackends = {
	    abstract: AbstractHistory,
	    hash: HashHistory,
	    html5: HTML5History
	  };
	
	  // late bind during install
	  var Vue = undefined;
	
	  /**
	   * Router constructor
	   *
	   * @param {Object} [options]
	   */
	
	  var Router = (function () {
	    function Router() {
	      var _this = this;
	
	      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	      var _ref$hashbang = _ref.hashbang;
	      var hashbang = _ref$hashbang === undefined ? true : _ref$hashbang;
	      var _ref$abstract = _ref.abstract;
	      var abstract = _ref$abstract === undefined ? false : _ref$abstract;
	      var _ref$history = _ref.history;
	      var history = _ref$history === undefined ? false : _ref$history;
	      var _ref$saveScrollPosition = _ref.saveScrollPosition;
	      var saveScrollPosition = _ref$saveScrollPosition === undefined ? false : _ref$saveScrollPosition;
	      var _ref$transitionOnLoad = _ref.transitionOnLoad;
	      var transitionOnLoad = _ref$transitionOnLoad === undefined ? false : _ref$transitionOnLoad;
	      var _ref$suppressTransitionError = _ref.suppressTransitionError;
	      var suppressTransitionError = _ref$suppressTransitionError === undefined ? false : _ref$suppressTransitionError;
	      var _ref$root = _ref.root;
	      var root = _ref$root === undefined ? null : _ref$root;
	      var _ref$linkActiveClass = _ref.linkActiveClass;
	      var linkActiveClass = _ref$linkActiveClass === undefined ? 'v-link-active' : _ref$linkActiveClass;
	      babelHelpers.classCallCheck(this, Router);
	
	      /* istanbul ignore if */
	      if (!Router.installed) {
	        throw new Error('Please install the Router with Vue.use() before ' + 'creating an instance.');
	      }
	
	      // Vue instances
	      this.app = null;
	      this._children = [];
	
	      // route recognizer
	      this._recognizer = new RouteRecognizer();
	      this._guardRecognizer = new RouteRecognizer();
	
	      // state
	      this._started = false;
	      this._startCb = null;
	      this._currentRoute = {};
	      this._currentTransition = null;
	      this._previousTransition = null;
	      this._notFoundHandler = null;
	      this._notFoundRedirect = null;
	      this._beforeEachHooks = [];
	      this._afterEachHooks = [];
	
	      // trigger transition on initial render?
	      this._rendered = false;
	      this._transitionOnLoad = transitionOnLoad;
	
	      // history mode
	      this._root = root;
	      this._abstract = abstract;
	      this._hashbang = hashbang;
	
	      // check if HTML5 history is available
	      var hasPushState = typeof window !== 'undefined' && window.history && window.history.pushState;
	      this._history = history && hasPushState;
	      this._historyFallback = history && !hasPushState;
	
	      // create history object
	      var inBrowser = Vue.util.inBrowser;
	      this.mode = !inBrowser || this._abstract ? 'abstract' : this._history ? 'html5' : 'hash';
	
	      var History = historyBackends[this.mode];
	      this.history = new History({
	        root: root,
	        hashbang: this._hashbang,
	        onChange: function onChange(path, state, anchor) {
	          _this._match(path, state, anchor);
	        }
	      });
	
	      // other options
	      this._saveScrollPosition = saveScrollPosition;
	      this._linkActiveClass = linkActiveClass;
	      this._suppress = suppressTransitionError;
	    }
	
	    /**
	     * Allow directly passing components to a route
	     * definition.
	     *
	     * @param {String} path
	     * @param {Object} handler
	     */
	
	    // API ===================================================
	
	    /**
	    * Register a map of top-level paths.
	    *
	    * @param {Object} map
	    */
	
	    Router.prototype.map = function map(_map) {
	      for (var route in _map) {
	        this.on(route, _map[route]);
	      }
	      return this;
	    };
	
	    /**
	     * Register a single root-level path
	     *
	     * @param {String} rootPath
	     * @param {Object} handler
	     *                 - {String} component
	     *                 - {Object} [subRoutes]
	     *                 - {Boolean} [forceRefresh]
	     *                 - {Function} [before]
	     *                 - {Function} [after]
	     */
	
	    Router.prototype.on = function on(rootPath, handler) {
	      if (rootPath === '*') {
	        this._notFound(handler);
	      } else {
	        this._addRoute(rootPath, handler, []);
	      }
	      return this;
	    };
	
	    /**
	     * Set redirects.
	     *
	     * @param {Object} map
	     */
	
	    Router.prototype.redirect = function redirect(map) {
	      for (var path in map) {
	        this._addRedirect(path, map[path]);
	      }
	      return this;
	    };
	
	    /**
	     * Set aliases.
	     *
	     * @param {Object} map
	     */
	
	    Router.prototype.alias = function alias(map) {
	      for (var path in map) {
	        this._addAlias(path, map[path]);
	      }
	      return this;
	    };
	
	    /**
	     * Set global before hook.
	     *
	     * @param {Function} fn
	     */
	
	    Router.prototype.beforeEach = function beforeEach(fn) {
	      this._beforeEachHooks.push(fn);
	      return this;
	    };
	
	    /**
	     * Set global after hook.
	     *
	     * @param {Function} fn
	     */
	
	    Router.prototype.afterEach = function afterEach(fn) {
	      this._afterEachHooks.push(fn);
	      return this;
	    };
	
	    /**
	     * Navigate to a given path.
	     * The path can be an object describing a named path in
	     * the format of { name: '...', params: {}, query: {}}
	     * The path is assumed to be already decoded, and will
	     * be resolved against root (if provided)
	     *
	     * @param {String|Object} path
	     * @param {Boolean} [replace]
	     */
	
	    Router.prototype.go = function go(path) {
	      var replace = false;
	      var append = false;
	      if (Vue.util.isObject(path)) {
	        replace = path.replace;
	        append = path.append;
	      }
	      path = this.stringifyPath(path);
	      if (path) {
	        this.history.go(path, replace, append);
	      }
	    };
	
	    /**
	     * Short hand for replacing current path
	     *
	     * @param {String} path
	     */
	
	    Router.prototype.replace = function replace(path) {
	      if (typeof path === 'string') {
	        path = { path: path };
	      }
	      path.replace = true;
	      this.go(path);
	    };
	
	    /**
	     * Start the router.
	     *
	     * @param {VueConstructor} App
	     * @param {String|Element} container
	     * @param {Function} [cb]
	     */
	
	    Router.prototype.start = function start(App, container, cb) {
	      /* istanbul ignore if */
	      if (this._started) {
	        warn$1('already started.');
	        return;
	      }
	      this._started = true;
	      this._startCb = cb;
	      if (!this.app) {
	        /* istanbul ignore if */
	        if (!App || !container) {
	          throw new Error('Must start vue-router with a component and a ' + 'root container.');
	        }
	        /* istanbul ignore if */
	        if (App instanceof Vue) {
	          throw new Error('Must start vue-router with a component, not a ' + 'Vue instance.');
	        }
	        this._appContainer = container;
	        var Ctor = this._appConstructor = typeof App === 'function' ? App : Vue.extend(App);
	        // give it a name for better debugging
	        Ctor.options.name = Ctor.options.name || 'RouterApp';
	      }
	
	      // handle history fallback in browsers that do not
	      // support HTML5 history API
	      if (this._historyFallback) {
	        var _location = window.location;
	        var _history = new HTML5History({ root: this._root });
	        var path = _history.root ? _location.pathname.replace(_history.rootRE, '') : _location.pathname;
	        if (path && path !== '/') {
	          _location.assign((_history.root || '') + '/' + this.history.formatPath(path) + _location.search);
	          return;
	        }
	      }
	
	      this.history.start();
	    };
	
	    /**
	     * Stop listening to route changes.
	     */
	
	    Router.prototype.stop = function stop() {
	      this.history.stop();
	      this._started = false;
	    };
	
	    /**
	     * Normalize named route object / string paths into
	     * a string.
	     *
	     * @param {Object|String|Number} path
	     * @return {String}
	     */
	
	    Router.prototype.stringifyPath = function stringifyPath(path) {
	      var generatedPath = '';
	      if (path && typeof path === 'object') {
	        if (path.name) {
	          var extend = Vue.util.extend;
	          var currentParams = this._currentTransition && this._currentTransition.to.params;
	          var targetParams = path.params || {};
	          var params = currentParams ? extend(extend({}, currentParams), targetParams) : targetParams;
	          generatedPath = encodeURI(this._recognizer.generate(path.name, params));
	        } else if (path.path) {
	          generatedPath = encodeURI(path.path);
	        }
	        if (path.query) {
	          // note: the generated query string is pre-URL-encoded by the recognizer
	          var query = this._recognizer.generateQueryString(path.query);
	          if (generatedPath.indexOf('?') > -1) {
	            generatedPath += '&' + query.slice(1);
	          } else {
	            generatedPath += query;
	          }
	        }
	      } else {
	        generatedPath = encodeURI(path ? path + '' : '');
	      }
	      return generatedPath;
	    };
	
	    // Internal methods ======================================
	
	    /**
	    * Add a route containing a list of segments to the internal
	    * route recognizer. Will be called recursively to add all
	    * possible sub-routes.
	    *
	    * @param {String} path
	    * @param {Object} handler
	    * @param {Array} segments
	    */
	
	    Router.prototype._addRoute = function _addRoute(path, handler, segments) {
	      guardComponent(path, handler);
	      handler.path = path;
	      handler.fullPath = (segments.reduce(function (path, segment) {
	        return path + segment.path;
	      }, '') + path).replace('//', '/');
	      segments.push({
	        path: path,
	        handler: handler
	      });
	      this._recognizer.add(segments, {
	        as: handler.name
	      });
	      // add sub routes
	      if (handler.subRoutes) {
	        for (var subPath in handler.subRoutes) {
	          // recursively walk all sub routes
	          this._addRoute(subPath, handler.subRoutes[subPath],
	          // pass a copy in recursion to avoid mutating
	          // across branches
	          segments.slice());
	        }
	      }
	    };
	
	    /**
	     * Set the notFound route handler.
	     *
	     * @param {Object} handler
	     */
	
	    Router.prototype._notFound = function _notFound(handler) {
	      guardComponent('*', handler);
	      this._notFoundHandler = [{ handler: handler }];
	    };
	
	    /**
	     * Add a redirect record.
	     *
	     * @param {String} path
	     * @param {String} redirectPath
	     */
	
	    Router.prototype._addRedirect = function _addRedirect(path, redirectPath) {
	      if (path === '*') {
	        this._notFoundRedirect = redirectPath;
	      } else {
	        this._addGuard(path, redirectPath, this.replace);
	      }
	    };
	
	    /**
	     * Add an alias record.
	     *
	     * @param {String} path
	     * @param {String} aliasPath
	     */
	
	    Router.prototype._addAlias = function _addAlias(path, aliasPath) {
	      this._addGuard(path, aliasPath, this._match);
	    };
	
	    /**
	     * Add a path guard.
	     *
	     * @param {String} path
	     * @param {String} mappedPath
	     * @param {Function} handler
	     */
	
	    Router.prototype._addGuard = function _addGuard(path, mappedPath, _handler) {
	      var _this2 = this;
	
	      this._guardRecognizer.add([{
	        path: path,
	        handler: function handler(match, query) {
	          var realPath = mapParams(mappedPath, match.params, query);
	          _handler.call(_this2, realPath);
	        }
	      }]);
	    };
	
	    /**
	     * Check if a path matches any redirect records.
	     *
	     * @param {String} path
	     * @return {Boolean} - if true, will skip normal match.
	     */
	
	    Router.prototype._checkGuard = function _checkGuard(path) {
	      var matched = this._guardRecognizer.recognize(path, true);
	      if (matched) {
	        matched[0].handler(matched[0], matched.queryParams);
	        return true;
	      } else if (this._notFoundRedirect) {
	        matched = this._recognizer.recognize(path);
	        if (!matched) {
	          this.replace(this._notFoundRedirect);
	          return true;
	        }
	      }
	    };
	
	    /**
	     * Match a URL path and set the route context on vm,
	     * triggering view updates.
	     *
	     * @param {String} path
	     * @param {Object} [state]
	     * @param {String} [anchor]
	     */
	
	    Router.prototype._match = function _match(path, state, anchor) {
	      var _this3 = this;
	
	      if (this._checkGuard(path)) {
	        return;
	      }
	
	      var currentRoute = this._currentRoute;
	      var currentTransition = this._currentTransition;
	
	      if (currentTransition) {
	        if (currentTransition.to.path === path) {
	          // do nothing if we have an active transition going to the same path
	          return;
	        } else if (currentRoute.path === path) {
	          // We are going to the same path, but we also have an ongoing but
	          // not-yet-validated transition. Abort that transition and reset to
	          // prev transition.
	          currentTransition.aborted = true;
	          this._currentTransition = this._prevTransition;
	          return;
	        } else {
	          // going to a totally different path. abort ongoing transition.
	          currentTransition.aborted = true;
	        }
	      }
	
	      // construct new route and transition context
	      var route = new Route(path, this);
	      var transition = new RouteTransition(this, route, currentRoute);
	
	      // current transition is updated right now.
	      // however, current route will only be updated after the transition has
	      // been validated.
	      this._prevTransition = currentTransition;
	      this._currentTransition = transition;
	
	      if (!this.app) {
	        (function () {
	          // initial render
	          var router = _this3;
	          _this3.app = new _this3._appConstructor({
	            el: _this3._appContainer,
	            created: function created() {
	              this.$router = router;
	            },
	            _meta: {
	              $route: route
	            }
	          });
	        })();
	      }
	
	      // check global before hook
	      var beforeHooks = this._beforeEachHooks;
	      var startTransition = function startTransition() {
	        transition.start(function () {
	          _this3._postTransition(route, state, anchor);
	        });
	      };
	
	      if (beforeHooks.length) {
	        transition.runQueue(beforeHooks, function (hook, _, next) {
	          if (transition === _this3._currentTransition) {
	            transition.callHook(hook, null, next, {
	              expectBoolean: true
	            });
	          }
	        }, startTransition);
	      } else {
	        startTransition();
	      }
	
	      if (!this._rendered && this._startCb) {
	        this._startCb.call(null);
	      }
	
	      // HACK:
	      // set rendered to true after the transition start, so
	      // that components that are acitvated synchronously know
	      // whether it is the initial render.
	      this._rendered = true;
	    };
	
	    /**
	     * Set current to the new transition.
	     * This is called by the transition object when the
	     * validation of a route has succeeded.
	     *
	     * @param {Transition} transition
	     */
	
	    Router.prototype._onTransitionValidated = function _onTransitionValidated(transition) {
	      // set current route
	      var route = this._currentRoute = transition.to;
	      // update route context for all children
	      if (this.app.$route !== route) {
	        this.app.$route = route;
	        this._children.forEach(function (child) {
	          child.$route = route;
	        });
	      }
	      // call global after hook
	      if (this._afterEachHooks.length) {
	        this._afterEachHooks.forEach(function (hook) {
	          return hook.call(null, {
	            to: transition.to,
	            from: transition.from
	          });
	        });
	      }
	      this._currentTransition.done = true;
	    };
	
	    /**
	     * Handle stuff after the transition.
	     *
	     * @param {Route} route
	     * @param {Object} [state]
	     * @param {String} [anchor]
	     */
	
	    Router.prototype._postTransition = function _postTransition(route, state, anchor) {
	      // handle scroll positions
	      // saved scroll positions take priority
	      // then we check if the path has an anchor
	      var pos = state && state.pos;
	      if (pos && this._saveScrollPosition) {
	        Vue.nextTick(function () {
	          window.scrollTo(pos.x, pos.y);
	        });
	      } else if (anchor) {
	        Vue.nextTick(function () {
	          var el = document.getElementById(anchor.slice(1));
	          if (el) {
	            window.scrollTo(window.scrollX, el.offsetTop);
	          }
	        });
	      }
	    };
	
	    return Router;
	  })();
	
	  function guardComponent(path, handler) {
	    var comp = handler.component;
	    if (Vue.util.isPlainObject(comp)) {
	      comp = handler.component = Vue.extend(comp);
	    }
	    /* istanbul ignore if */
	    if (typeof comp !== 'function') {
	      handler.component = null;
	      warn$1('invalid component for route "' + path + '".');
	    }
	  }
	
	  /* Installation */
	
	  Router.installed = false;
	
	  /**
	   * Installation interface.
	   * Install the necessary directives.
	   */
	
	  Router.install = function (externalVue) {
	    /* istanbul ignore if */
	    if (Router.installed) {
	      warn$1('already installed.');
	      return;
	    }
	    Vue = externalVue;
	    applyOverride(Vue);
	    View(Vue);
	    Link(Vue);
	    exports$1.Vue = Vue;
	    Router.installed = true;
	  };
	
	  // auto install
	  /* istanbul ignore if */
	  if (typeof window !== 'undefined' && window.Vue) {
	    window.Vue.use(Router);
	  }
	
	  return Router;
	
	}));

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	var __vue_styles__ = {}
	__webpack_require__(6)
	__webpack_require__(10)
	__vue_script__ = __webpack_require__(11)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\components\\App\\App.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(105)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	var __vue_options__ = typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports
	if (__vue_template__) {
	__vue_options__.template = __vue_template__
	}
	if (!__vue_options__.computed) __vue_options__.computed = {}
	Object.keys(__vue_styles__).forEach(function (key) {
	var module = __vue_styles__[key]
	__vue_options__.computed[key] = function () { return module }
	})


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(7);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(9)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../node_modules/sass-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./App.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../node_modules/sass-loader/index.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./App.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(8)();
	// imports
	
	
	// module
	exports.push([module.id, "/**\n * Copyright 2015 Google Inc. All Rights Reserved.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n/* ==========  Color Palettes  ========== */\n/* colors.scss */\nbody {\n  background: #ebeff2;\n  font-family: \"Roboto\", \"Helvetica\", \"Arial\", sans-serif; }\n\ntext {\n  text-anchor: middle; }\n\n.pause {\n  fill: #FFC107 !important; }\n\n.play {\n  fill: #80CBC4 !important; }\n\n.seeked {\n  fill: #03A9F4 !important; }\n\n.error {\n  fill: #607D8B !important; }\n\n.ratechange {\n  fill: #00BCD4 !important; }\n\n.stalled {\n  fill: #EF5350 !important; }\n", ""]);
	
	// exports


/***/ },
/* 8 */,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if (media) {
			styleElement.setAttribute("media", media);
		}
	
		if (sourceMap) {
			// https://developer.chrome.com/devtools/docs/javascript-debugging
			// this makes source maps inside style tags work properly in Chrome
			css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _NoBallDrop = __webpack_require__(12);
	
	var _NoBallDrop2 = _interopRequireDefault(_NoBallDrop);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//const ROOTPATH = "/~zchenbn/click-animation/";
	var ROOTPATH = "./";
	exports.default = {
	    ready: function ready() {
	        var _this = this;
	
	        d3.json(this.rawDataPath, function (err, data) {
	            if (err) throw err;
	            _this.rawData = data;
	            d3.json(_this.rawStackDataPath, function (err1, stackData) {
	                if (err1) throw err1;
	                _this.rawStackData = stackData;
	                _this.videoIds = _this.$refs.clickAnimationComponent.setRawdata(data, stackData);
	            });
	        });
	    },
	
	    components: {
	        NoBallDrop: _NoBallDrop2.default
	    },
	    rawData: null,
	    rawStackData: null,
	    data: function data() {
	        return {
	            rawDataPath: ROOTPATH + "data/animation_All17.json_clean",
	            rawStackDataPath: ROOTPATH + "data/animation_All17.json_clean_stack",
	            vLinkIndex: "/",
	            vLinkCongleiPath: "/conglei",
	            vLinkNoForeshadow: "/no-foreshadow",
	
	            videoIds: [],
	            selectedVideo: null,
	
	            zoomScaleMax: 8,
	            zoomScaleList: [1, 2, 4, 8, 16],
	            isAcceleration: true
	        };
	    },
	
	    methods: {
	        getData: function getData() {
	            if (this.rawData && this.rawStackData) {
	                this.videoIds = this.$refs.clickAnimationComponent.setRawdata(this.rawData, this.rawStackData);
	                if (this.selectedVideo) {
	                    this.$refs.clickAnimationComponent.SelectVideo(this.selectedVideo);
	                }
	            }
	        },
	        SelectVideo: function SelectVideo() {
	            this.$refs.clickAnimationComponent.SelectVideo(this.selectedVideo);
	        },
	        SelectSpeed: function SelectSpeed() {
	            this.$refs.clickAnimationComponent.SelectSpeed(this.zoomScaleMax);
	        },
	        ChangeAcceleration: function ChangeAcceleration() {
	            this.$refs.clickAnimationComponent.ChangeAcceleration(this.isAcceleration);
	        },
	        Pause: function Pause() {
	            this.$refs.clickAnimationComponent.Pause();
	        },
	        Resume: function Resume() {
	            this.$refs.clickAnimationComponent.Resume();
	        }
	    }
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	var __vue_styles__ = {}
	__webpack_require__(13)
	__webpack_require__(14)
	__vue_script__ = __webpack_require__(15)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\components\\NoBallDrop\\NoBallDrop.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(104)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	var __vue_options__ = typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports
	if (__vue_template__) {
	__vue_options__.template = __vue_template__
	}
	if (!__vue_options__.computed) __vue_options__.computed = {}
	Object.keys(__vue_styles__).forEach(function (key) {
	var module = __vue_styles__[key]
	__vue_options__.computed[key] = function () { return module }
	})


/***/ },
/* 13 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 14 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _keys = __webpack_require__(16);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _d3 = __webpack_require__(51);
	
	var _d4 = _interopRequireDefault(_d3);
	
	var _materialDesignLite = __webpack_require__(52);
	
	var _materialDesignLite2 = _interopRequireDefault(_materialDesignLite);
	
	__webpack_require__(53);
	
	var _BubbleFloat = __webpack_require__(56);
	
	var _BubbleFloat2 = _interopRequireDefault(_BubbleFloat);
	
	var _TimeLine = __webpack_require__(98);
	
	var _TimeLine2 = _interopRequireDefault(_TimeLine);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// components here
	exports.default = {
	    components: {
	        BubbleFloat: _BubbleFloat2.default
	    },
	    ready: function ready() {
	        this.InitVariables();
	        console.log("ready no-ball-drop");
	        if (!this.clickData) {
	            this.$root.getData();
	        }
	    },
	
	
	    // Complex data here
	    //d3 element
	    doc: null,
	    svg: null,
	    contextTimeLineG: null,
	    //xAxis: null,
	    timelineChartData: null,
	    timelineChartLineGen: null,
	    animation: null,
	    digitalClock: null,
	
	    //d3 drawing helper
	    focusXscale: null,
	    contextXscale: null,
	    contextBarChartYscale: null,
	    arcGen: null,
	    brush: null,
	    dateFormat: null,
	    timeFormat: null,
	
	    data: function data() {
	        return {
	            clickData: null,
	
	            padding: { top: 0, right: 20, bottom: 30, left: 20 },
	            width: null,
	            height: null,
	            center: null,
	            titleHeight: null,
	            viewInnerWidth: null,
	            viewInnerHeight: null,
	            contextTimeLineHeight: null,
	            contextTimeLineY: null,
	            stackBarChartHeight: 300,
	            focusRegionWidth: 200,
	            focusRegionScale: 20,
	            focusMoveRange: 10,
	
	            //control panel
	            zoomScaleMax: 8,
	            focusTimeLineViewScale: 1,
	            focusDataScale: 1,
	            isAcceleration: true,
	            accelerateMode: "domain",
	
	            selectedVideo: "",
	
	            // durations:[5000,1500,2500,5000],
	            baseDuration: 1000,
	            currentDuration: 1000,
	
	            // timeIntervals: [
	            //     { name: "Second", ms: 1000 },           //0
	            //     { name: "Minute", ms: 60 * 1000 },      //1
	            //     { name: "Hour", ms: 60 * 60 * 1000 },   //2
	            //     { name: "Day", ms: 24 * 60 * 60 * 1000 }//3
	            // ],
	            timeInterval: { name: "Hour", ms: 60 * 60 * 1000 }, // hour
	
	            is2D: false,
	
	            //data to draw
	            xDomainMin: null,
	            xDomainMax: null
	        };
	    },
	
	    methods: {
	        setRawdata: function setRawdata(data, stackData) {
	            this.clickData = {};
	            var time2edInterval = this.zoomScaleMax * this.timeInterval.ms;
	            for (var i = 0, len = data.length; i < len; ++i) {
	                if (data[i].currentTime === 0) continue;
	                data[i].date = new Date(data[i].ts);
	
	                var videoId = data[i].videoId;
	                if (!this.clickData[videoId]) this.clickData[videoId] = {};
	                var videoData = this.clickData[videoId];
	
	                if (!videoData.clickDataGroupByTimeArray) videoData.clickDataGroupByTimeArray = {};
	                if (!videoData.clickDataGroupByTimeDict) videoData.clickDataGroupByTimeDict = {};
	                if (!videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale]) videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale] = [];
	                if (!videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale]) videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale] = {};
	                if (!videoData.clickDataGroupByTimeArray[this.zoomScaleMax]) videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
	                if (!videoData.clickDataGroupByTimeDict[this.zoomScaleMax]) videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
	
	                var index = Math.floor(data[i].ts / this.timeInterval.ms);
	                if (!videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index]) videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index] = [];
	                videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index].push(data[i]);
	
	                index = Math.floor(data[i].ts / time2edInterval);
	                if (!videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index]) videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index] = [];
	                videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index].push(data[i]);
	            }
	
	            var videoIds = (0, _keys2.default)(this.clickData);
	            for (var _i = 0, _len = videoIds.length; _i < _len; ++_i) {
	                var _videoData = this.clickData[videoIds[_i]];
	                var timeKeys = (0, _keys2.default)(_videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale]);
	                for (var j = 0, lenj = timeKeys.length; j < lenj; ++j) {
	                    _videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale][j] = {
	                        ts: +timeKeys[j] * this.timeInterval.ms,
	                        value: _videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][timeKeys[j]]
	                    };
	                }
	
	                timeKeys = (0, _keys2.default)(_videoData.clickDataGroupByTimeDict[this.zoomScaleMax]);
	                for (var _j = 0, _lenj = timeKeys.length; _j < _lenj; ++_j) {
	                    _videoData.clickDataGroupByTimeArray[this.zoomScaleMax][_j] = {
	                        ts: +timeKeys[_j] * time2edInterval,
	                        value: _videoData.clickDataGroupByTimeDict[this.zoomScaleMax][timeKeys[_j]]
	                    };
	                }
	            }
	
	            this.$refs.bubbleFloatComponent.setBarHeight(this.stackBarChartHeight).setIs2D(this.is2D).setTimeInterval(30).videosData(stackData);
	
	            return videoIds;
	        },
	        processData: function processData(tempL1A) {
	            if (tempL1A.statics) return;
	            var extent = _d4.default.extent(tempL1A, function (d) {
	                return d.value.length;
	            });
	            var max = extent[1];
	            var min = extent[0];
	            var mean = _d4.default.mean(tempL1A, function (d) {
	                return d.value.length;
	            });
	            var median = _d4.default.median(tempL1A, function (d) {
	                return d.value.length;
	            });
	            var deviation = _d4.default.deviation(tempL1A, function (d) {
	                return d.value.length;
	            });
	            tempL1A.statics = {
	                extent: extent,
	                max: max,
	                min: min,
	                mean: mean,
	                median: median,
	                deviation: deviation
	            };
	        },
	        calOutLier: function calOutLier(tempL1A) {
	            if (tempL1A.outliers) return;
	            if (!tempL1A.statics) this.processData(tempL1A);
	            var statics = tempL1A.statics;
	            var mean = statics.mean;
	            var deviation = statics.deviation;
	            var sigmaCount = 2;
	            var upperBound = mean + sigmaCount * deviation;
	            var lowerBound = mean - sigmaCount * deviation;
	            var outliers = [];
	            for (var i = 0, len = tempL1A.length, value; i < len; ++i) {
	                value = tempL1A[i].value.length;
	                if (value > upperBound || value < lowerBound) {
	                    tempL1A[i].isOutlier = true;
	                    outliers.push(tempL1A[i]);
	                }
	            }
	            tempL1A.outliers = outliers;
	            for (var _i2 = 0, _len2 = tempL1A.length; _i2 < _len2;) {
	                var bar = tempL1A[_i2];
	                if (bar.isOutlier) {
	                    var j = _i2 - 5;
	                    while (++j < _i2 + 5) {
	                        if (tempL1A[j]) {
	                            if (tempL1A[j].siso) {
	                                var t = j + 1;
	                                while (tempL1A[--t].siso) {
	                                    tempL1A[t].siso = 0;
	                                }
	                            } else {
	                                tempL1A[j].siso = j - _i2;
	                            }
	                        }
	                    }
	                    _i2 = _i2 + 5;
	                } else {
	                    ++_i2;
	                }
	            }
	
	            var timeInterval = this.$refs.bubbleFloatComponent.getTimeInterval();
	            var outliersStatics = [];
	            var videoLength = this.$refs.bubbleFloatComponent.getVideoLength(this.selectedVideo);
	            for (var _i3 = 0, _len3 = outliers.length; _i3 < _len3; ++_i3) {
	                var outlier = outliers[_i3];
	                var newValues = [{}, {}, {}];
	                for (var _j2 = 0, lenj = outlier.value.length; _j2 < lenj; ++_j2) {
	                    var click = outlier.value[_j2];
	                    var newIndex = click.currentTime / videoLength;
	
	                    if (newIndex < 1 / 3) {
	                        newIndex = 0;
	                    } else if (newIndex < 2 / 3) {
	                        newIndex = 1;
	                    } else {
	                        newIndex = 2;
	                    }
	
	                    if (click.type in newValues[newIndex]) {
	                        newValues[newIndex][click.type]++;
	                    } else {
	                        newValues[newIndex][click.type] = 0;
	                    }
	                }
	
	                var _loop = function _loop(_j3, _lenj2) {
	                    var tTypes = newValues[_j3];
	                    //let baseValue = 0;
	                    var maxType = void 0;
	                    var maxValue = -1;
	                    (0, _keys2.default)(tTypes).forEach(function (d) {
	                        if (tTypes[d] > maxValue) {
	                            maxType = { type: d };
	                            maxValue = tTypes[d];
	                        }
	                    });
	                    if (maxType) maxType.ts = outlier.ts;
	                    newValues[_j3] = maxType;
	                };
	
	                for (var _j3 = 0, _lenj2 = newValues.length; _j3 < _lenj2; ++_j3) {
	                    _loop(_j3, _lenj2);
	                }
	                outliersStatics.push({
	                    ts: outlier.ts,
	                    indicatorData: newValues
	                });
	            }
	            tempL1A.outliersStatics = outliersStatics;
	        },
	        SelectVideo: function SelectVideo(selectedVideo) {
	            this.selectedVideo = selectedVideo;
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray[1];
	            var tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
	            if (!tempL2A) {
	                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
	                var tempL2D = videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
	                var time2edInterval = this.timeInterval.ms * this.zoomScaleMax;
	                for (var i = 0, len = tempL1A.length; i < len; ++i) {
	                    var clicks = tempL1A[i].value;
	                    for (var j = 0, lenj = clicks.length; j < lenj; ++j) {
	                        var click = clicks[j];
	                        var index = Math.floor(click.ts / time2edInterval);
	                        if (!tempL2D[index]) tempL2D[index] = [];
	                        tempL2D[index].push(click);
	                    }
	                }
	
	                var timeKeys = (0, _keys2.default)(tempL2D);
	                for (var _i4 = 0, _len4 = timeKeys.length; _i4 < _len4; ++_i4) {
	                    tempL2A[_i4] = {
	                        ts: +timeKeys[_i4] * time2edInterval,
	                        value: tempL2D[timeKeys[_i4]]
	                    };
	                }
	            }
	            this.calOutLier(tempL1A);
	            this.calOutLier(tempL2A);
	
	            //set up domain of each scale
	            this.contextBarChartYscale.domain(tempL1A.statics.extent);
	            this.focusXscale.domain(_d4.default.extent(tempL1A, function (d) {
	                return +d.ts;
	            }));
	            this.contextXscale.domain(this.focusXscale.domain());
	            this.xDomainMin = this.focusXscale.domain()[0];
	            this.xDomainMax = this.focusXscale.domain()[1];
	            setTimeout(this.InitView, 20);
	        },
	        SelectSpeed: function SelectSpeed(zoomScaleMax) {
	            this.zoomScaleMax = zoomScaleMax;
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray[1];
	            var tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
	            if (!tempL2A) {
	                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
	                var tempL2D = videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
	                var time2edInterval = this.timeInterval.ms * this.zoomScaleMax;
	                for (var i = 0, len = tempL1A.length; i < len; ++i) {
	                    var clicks = tempL1A[i].value;
	                    for (var j = 0, lenj = clicks.length; j < lenj; ++j) {
	                        var click = clicks[j];
	                        var index = Math.floor(click.ts / time2edInterval);
	                        if (!tempL2D[index]) tempL2D[index] = [];
	                        tempL2D[index].push(click);
	                    }
	                }
	
	                var timeKeys = (0, _keys2.default)(tempL2D);
	                for (var _i5 = 0, _len5 = timeKeys.length; _i5 < _len5; ++_i5) {
	                    tempL2A[_i5] = {
	                        ts: +timeKeys[_i5] * time2edInterval,
	                        value: tempL2D[timeKeys[_i5]]
	                    };
	                }
	            }
	            this.calOutLier(tempL1A);
	            this.calOutLier(tempL2A);
	
	            this.InitView();
	        },
	        ChangeAcceleration: function ChangeAcceleration(isAcceleration) {
	            this.isAcceleration = isAcceleration;
	            if (!this.isAcceleration) {
	                this.focusTimeLineViewScale = 1;
	            }
	        },
	        InitVariables: function InitVariables() {
	            this.doc = _d4.default.select(this.$el);
	            this.titleHeight = this.doc.select(".mdl-card__title").node().clientHeight;
	            this.width = this.doc.node().clientWidth;
	            this.viewInnerWidth = this.width;
	            this.height = this.doc.node().clientHeight - this.titleHeight;
	            this.contextTimeLineHeight = this.height * 0.10;
	            this.viewInnerHeight = this.height * 0.15;
	            this.svg = this.doc.select("svg.screen-scroll-svg").attr("height", this.viewInnerHeight);
	            this.svg.append("rect").attr({
	                "class": "svg-background",
	                "x": 0,
	                "y": 0,
	                "width": this.width,
	                "height": this.viewInnerHeight
	            });
	            this.center = [this.viewInnerWidth * 0.5, this.viewInnerHeight * 0.5];
	
	            this.contextTimeLineY = 0;
	
	            // Scales
	            this.contextXscale = _d4.default.time.scale();
	
	            this.contextBarChartYscale = _d4.default.scale.linear().range([0, this.contextTimeLineHeight]);
	
	            this.focusXscale = _d4.default.time.scale();
	            this.arcGen = _d4.default.svg.arc().innerRadius(0).outerRadius(200).startAngle(0).endAngle(2 * Math.PI);
	            this.timelineChartLineGen = _d4.default.svg.line().interpolate("monotone").tension(0.8).x(function (d) {
	                return d.x;
	            }).y(function (d) {
	                return d.y;
	            });
	            this.dateFormat = _d4.default.time.format("%b %d");
	            this.timeFormat = _d4.default.time.format("%H:%M");
	
	            this.brush = _d4.default.svg.brush().x(this.contextXscale);
	        },
	        drawDigitalClock: function drawDigitalClock(chart) {
	            this.digitalClock = chart.append("g").attr("class", "clock-group").attr("transform", "translate(" + [this.center[0], this.center[1]] + ")");
	            this.digitalClock.append("line").attr({
	                "x1": -150,
	                "y1": 20,
	                "y2": 20,
	                "x2": 150
	            });
	            this.digitalClock.append("text").attr({
	                "class": "date"
	            }).text("TEST");
	            this.digitalClock.append("text").attr({
	                "class": "time",
	                "y": 85
	            }).text("TEST");
	        },
	        drawFisheyeContextTimeLine: function drawFisheyeContextTimeLine(tempL1A) {
	            var _this = this;
	
	            var focusRegionWidth = this.focusRegionWidth;
	            var scaleSize = this.focusRegionScale;
	
	            this.contextXscale.range([this.center[0] + 0.5 * focusRegionWidth, this.width - this.padding.right]);
	            var oneBarRange = this.contextXscale(this.contextXscale.domain()[0].getTime() + this.timeInterval.ms) - this.contextXscale(this.contextXscale.domain()[0].getTime());
	            this.focusMoveRange = 1 * oneBarRange;
	            this.contextXscale.range([this.contextXscale.range()[0] + this.focusMoveRange, this.contextXscale.range()[1] + this.focusMoveRange]);
	            this.contextTimeLineG = this.svg.append("g").attr("class", "time-line-context-group").attr("transform", "translate(" + [0, 0] + ")");
	
	            // timeline verlocity distributtion
	            var lineChartData = _d4.default.range(this.contextXscale.range()[1] - this.contextXscale.range()[0]).map(function (d, i) {
	                return { ox: d + _this.contextXscale.range()[0], x: d + _this.contextXscale.range()[0], y: 0 };
	            });
	            // see whether is outlier
	            for (var i = 0, len = tempL1A.outliers.length; i < len; ++i) {
	                var d = tempL1A.outliers[i];
	                var index = Math.floor(this.contextXscale(d.ts) - this.contextXscale.range()[0]);
	                if (lineChartData[index] && d.isOutlier) {
	                    lineChartData[index].isOutlier = true;
	                }
	            }
	
	            // filter non-outlier
	            lineChartData = lineChartData.filter(function (d, i) {
	                if (d.isOutlier) return true;
	                if (!(i & 3)) return true;
	                return false;
	            });
	            // set Y 
	            for (var _i6 = 0, _len6 = lineChartData.length; _i6 < _len6;) {
	                var _d = lineChartData[_i6];
	                if (_d.isOutlier) {
	                    var j = _i6 - 3;
	                    while (++j < _i6 + 4) {
	                        if (lineChartData[j]) {
	                            lineChartData[j].y = this.contextBarChartYscale.range()[1] * 0.5;
	                        }
	                    }
	                    _i6 = _i6 + 4;
	                } else {
	                    if (_i6 & 1) {
	                        _d.y = 0;
	                    } else {
	                        _d.y = this.contextTimeLineHeight - this.padding.bottom;
	                    }
	                    ++_i6;
	                }
	            }
	            this.timelineChartData = lineChartData;
	            //interpolate("basis")
	            this.contextTimeLineG.append("g").attr("class", "time-line-chart").attr("transform", "translate(0," + (this.viewInnerHeight - this.padding.bottom - this.contextTimeLineHeight + 5) + ")").datum(lineChartData).append("path").attr("d", this.timelineChartLineGen);
	
	            // Context TimeLine barChart
	            this.contextTimeLineG.append("g").attr("class", "bar-chart-group").selectAll(".bar-chart").data(tempL1A, function (d) {
	                return d.ts;
	            }).enter().append("rect").attr({
	                "class": function _class(d) {
	                    return typeof d.siso === "number" ? "bar-chart siso" : "bar-chart";
	                },
	                "x": function x(d) {
	                    return _this.contextXscale(d.ts) - 0.5;
	                },
	                "y": function y(d) {
	                    return _this.viewInnerHeight - _this.padding.bottom - _this.contextBarChartYscale(d.value.length);
	                },
	                "height": function height(d) {
	                    return _this.contextBarChartYscale(d.value.length);
	                },
	                "width": 1
	            });
	
	            // Context TimeLine here
	            this.contextTimeLineG.append("g").attr("class", "brush").append("rect").attr({
	                "x": this.center[0] - (focusRegionWidth + scaleSize) * 0.5,
	                "width": focusRegionWidth,
	                "y": this.viewInnerHeight - this.contextTimeLineHeight - this.padding.bottom,
	                "height": this.contextTimeLineHeight
	            });
	
	            // Context TimeLine indicator
	            var indicatorG = this.contextTimeLineG.append("g").attr("class", "indicator-group").selectAll(".indicator").data(tempL1A.outliersStatics, function (d) {
	                return d.ts;
	            }).enter().append("g").attr({
	                "class": "indicator",
	                "transform": function transform(d) {
	                    return "translate(" + [_this.contextXscale(d.ts), _this.viewInnerHeight - _this.padding.bottom + 2] + ")";
	                }
	            });
	
	            indicatorG.append("rect").attr({
	                "x": -8,
	                "width": 16,
	                "height": 9
	            });
	
	            indicatorG.selectAll("circle").data(function (d) {
	                return d.indicatorData;
	            }).enter().append("circle").attr({
	                "class": function _class(d) {
	                    return d ? d.type : "zero_";
	                },
	                "r": 2,
	                "cy": 4.5,
	                "cx": function cx(d, i) {
	                    return i * 5 - 5;
	                }
	            });
	
	            this.contextTimeLineG.select(".indicator-group").append("line").attr({
	                "class": "move-indicator",
	                "x1": this.center[0],
	                "x2": this.center[0],
	                "y1": this.viewInnerHeight - this.contextTimeLineHeight - this.padding.bottom,
	                "y2": this.viewInnerHeight - this.padding.bottom
	            }).style({
	                "stroke": "red",
	                "stroke-width": "1px",
	                "stroke-opacity": 0.5
	            });
	            // context legend 
	            this.contextTimeLineG.append("g").attr("class", "legend-group").selectAll("text").data([0, 1, 2, 3, 4]).enter().append("text").attr({
	                "x": function x(d, i) {
	                    var tempD = _this.contextXscale.domain()[0].getTime() + (_this.contextXscale.domain()[1].getTime() - _this.contextXscale.domain()[0].getTime()) * i * 0.25;return _this.contextXscale(tempD) - 7;
	                },
	                "y": this.viewInnerHeight - this.padding.bottom + 10
	            }).text(function (d, i) {
	                var tempD = _this.contextXscale.domain()[0].getTime() + (_this.contextXscale.domain()[1].getTime() - _this.contextXscale.domain()[0].getTime()) * i * 0.25;return _this.dateFormat(new Date(tempD));
	            });
	        },
	        InitView: function InitView() {
	            var timeLinePosition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	            console.log("init view");
	            this.animation && this.animation.interrupt();
	            //clear
	            this.focusTimeLineViewScale = 1;
	            this.focusDataScale = 1;
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray[1],
	                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
	            this.calOutLier(tempL1A);
	            this.calOutLier(tempL2A);
	
	            for (var i = 0, len = tempL1A.length; i < len; ++i) {
	                tempL1A[i].firstDrop = true;
	            }
	            for (var _i7 = 0, _len7 = tempL2A.length; _i7 < _len7; ++_i7) {
	                tempL2A[_i7].firstDrop = true;
	            }
	
	            switch (timeLinePosition) {
	                case "middle":
	                    {
	                        this.contextTimeLineY = this.center[1] * 0.9;
	                        this.$refs.bubbleFloatComponent.setPosition(0, this.padding.bottom + 10).setSize([this.viewInnerWidth, this.height * 0.8]);
	                        break;
	                    }
	                case "down":
	                    {
	                        this.contextTimeLineY = this.height * 0.8;
	                        this.$refs.bubbleFloatComponent.setPosition(0, 30).setSize([this.viewInnerWidth, this.height * 0.7]);
	                        break;
	                    }
	                default:
	                    {
	                        this.contextTimeLineY = this.padding.top;
	                        this.$refs.bubbleFloatComponent.setPosition(0, this.viewInnerHeight + this.titleHeight).setSize([this.viewInnerWidth, this.height - this.viewInnerHeight]);
	                    }
	            }
	
	            this.zoomInView = [this.center[0], this.halfTimeLineHeight, this.viewInnerWidth];
	            this.zoomOutView = [this.center[0], this.timeLineHeight, this.viewInnerWidth * 2];
	            //modify the domain of xScale for focus view
	            this.focusXscale.range([this.padding.left, this.width - this.padding.right]).domain([_d4.default.time.hour.offset(this.xDomainMin, -5), _d4.default.time.hour.offset(this.xDomainMin, 5)]);
	
	            // clear the svg
	            this.contextTimeLineG && this.contextTimeLineG.selectAll("*").remove();
	            this.svg.select("defs").selectAll("*").remove();
	
	            this.drawFisheyeContextTimeLine(tempL1A);
	
	            this.zoomIn = false;
	            this.focusTimeLineViewScale = 1;
	
	            var syncDelay = 0.3;
	            this.$refs.bubbleFloatComponent.drawStackChart(timeLinePosition, this.selectedVideo).start();
	
	            this.animation = _d4.default.select("svg.screen-scroll-svg");
	            this.AnimationFisheyeTick(this.baseDuration);
	        },
	        AnimationUpdateDigitalClock: function AnimationUpdateDigitalClock(date) {
	            if (!this.digitalClock) return;
	            if (typeof date === "number" || typeof date === "string") date = new Date(date);
	            this.digitalClock.select("text.date").text(this.dateFormat(date));
	            this.digitalClock.select("text.time").text(this.timeFormat(date));
	        },
	        AnimationFisheyeTick: function AnimationFisheyeTick(duration) {
	            var _this2 = this;
	
	            var ease = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "linear";
	
	            var stop = false;
	            this.animation.transition().duration(duration).ease(ease).each("interrupt", function () {
	                console.log("interrupt");
	                _this2.contextTimeLineG.selectAll(".bar-chart").interrupt().transition();
	                _this2.contextTimeLineG.select(".time-line-chart").interrupt().transition();
	                _this2.contextTimeLineG.selectAll("circle.indicator").interrupt().transition();
	                _this2.contextTimeLineG.interrupt().transition();
	                _this2.contextTimeLineG.select(".legend-group").selectAll("text").interrupt().transition();
	                stop = true;
	            }).each(function () {
	                // update the domains
	                var self = _this2;
	                var focusRegionWidth = _this2.focusRegionWidth;
	                var contextXscale = _this2.contextXscale;
	                var fisheyeScaleSize = _this2.focusRegionScale;
	                var barWidth = focusRegionWidth * 0.5 / fisheyeScaleSize;
	                var centerX = _this2.center[0];
	
	                var startLine = _this2.center[0] + 0.5 * focusRegionWidth;
	                var endLine = startLine - focusRegionWidth / fisheyeScaleSize;
	                var lastRange = _this2.contextXscale.range();
	                var moveRangeWidth = _this2.focusMoveRange;
	                var currentRange = [lastRange[0] - moveRangeWidth, lastRange[1] - moveRangeWidth];
	
	                // reach the end
	                if (currentRange[1] <= endLine) {
	                    _this2.animation.interrupt();
	                    _this2.$refs.bubbleFloatComponent.canBeFinished(true);
	                    return;
	                }
	
	                _this2.contextTimeLineG.selectAll(".bar-chart").transition().tween("x", function (d) {
	                    var interpolateRange = _d4.default.interpolateNumber(0, moveRangeWidth);
	                    var sX = contextXscale(d.ts) - 0.5;
	                    return function (t) {
	                        var tempX = sX - interpolateRange(t);
	                        if (tempX < startLine) {
	                            if (tempX > endLine) {
	                                tempX = startLine - (0.5 + startLine - tempX) * fisheyeScaleSize;
	                                _d4.default.select(this).attr("width", barWidth).attr("x", tempX);
	
	                                if (tempX < centerX && d.firstDrop) {
	                                    d.firstDrop = false;
	                                    self.$refs.bubbleFloatComponent.inputClicks(d.value, d).drawClicks();
	                                }
	                            } else {
	                                tempX = tempX - 0.5 * fisheyeScaleSize - (1 - 1 / fisheyeScaleSize) * focusRegionWidth;
	                                _d4.default.select(this).attr("width", 1).attr("x", tempX);
	                            }
	                        } else {
	                            _d4.default.select(this).attr("width", 1).attr("x", tempX);
	                        }
	                    };
	                });
	
	                _this2.contextTimeLineG.select(".time-line-chart").select("path").transition().attrTween("d", function (d, i, a) {
	                    var interpolateRange = _d4.default.interpolateNumber(0, moveRangeWidth);
	                    var lastOffset = 0;
	                    return function (t) {
	                        var offset = interpolateRange(t);
	                        for (var _i8 = 0; _i8 < _this2.timelineChartData.length; ++_i8) {
	                            var _d2 = _this2.timelineChartData[_i8];
	                            _d2.ox -= offset - lastOffset;
	                            if (_d2.ox < startLine) {
	                                if (_d2.ox > endLine) {
	                                    _d2.x = startLine - (startLine - _d2.ox) * fisheyeScaleSize;
	                                } else {
	                                    _d2.x = _d2.ox - 0.5 * fisheyeScaleSize - (1 - 1 / fisheyeScaleSize) * focusRegionWidth;
	                                }
	                            } else {
	                                _d2.x = _d2.ox;
	                            }
	                        }
	                        lastOffset = offset;
	                        return _this2.timelineChartLineGen(_this2.timelineChartData);
	                    };
	                });
	
	                _this2.contextTimeLineG.transition().tween("centerTime", function () {
	                    var interpolateRange = _d4.default.interpolateNumber(0, moveRangeWidth);
	                    return function (t) {
	                        var offset = interpolateRange(t);
	                        var tempX = startLine - (startLine - _this2.center[0]) / fisheyeScaleSize;
	                        _this2.AnimationUpdateDigitalClock(_this2.contextXscale.invert(tempX + offset));
	                        _this2.$refs.bubbleFloatComponent.AnimationUpdateDigitalClock(_this2.contextXscale.invert(tempX + offset));
	                    };
	                });
	
	                // TODO the x-coordinate is not correct
	                var sY = _this2.viewInnerHeight - _this2.padding.bottom + 2;
	                _this2.contextTimeLineG.select("g.indicator-group").selectAll(".indicator").transition().tween("cx", function (d) {
	                    var interpolateRange = _d4.default.interpolateNumber(0, moveRangeWidth);
	                    var sX = contextXscale(d.ts);
	
	                    return function (t) {
	                        var tempX = sX - interpolateRange(t);
	                        if (tempX < startLine) {
	                            if (tempX > endLine) {
	                                _d4.default.select(this).attr("transform", "translate(" + [startLine - (0.875 + startLine - tempX) * fisheyeScaleSize, sY] + ")");
	                            } else {
	                                _d4.default.select(this).attr("transform", "translate(" + [tempX - 0.5 * fisheyeScaleSize - (1 - 1 / fisheyeScaleSize) * focusRegionWidth, sY] + ")");
	                            }
	                        } else {
	                            _d4.default.select(this).attr("transform", "translate(" + [tempX, sY] + ")");
	                        }
	                    };
	                });
	
	                _this2.contextTimeLineG.select(".legend-group").selectAll("text").transition().tween("x", function (d, i) {
	                    var interpolateRange = _d4.default.interpolateNumber(0, moveRangeWidth);
	                    var sX = contextXscale.domain()[0].getTime() + (contextXscale.domain()[1].getTime() - contextXscale.domain()[0].getTime()) * i * 0.25;
	                    sX = _this2.contextXscale(sX);
	                    return function (t) {
	                        var tempX = sX - interpolateRange(t);
	                        if (tempX < startLine) {
	                            if (tempX > endLine) {
	                                _d4.default.select(this).attr("x", startLine - (0.25 + startLine - tempX) * fisheyeScaleSize);
	                            } else {
	                                _d4.default.select(this).attr("x", tempX - (1 - 1 / fisheyeScaleSize) * focusRegionWidth);
	                            }
	                        } else {
	                            _d4.default.select(this).attr("x", tempX);
	                        }
	                    };
	                });
	
	                _this2.contextXscale.range(currentRange);
	
	                var tempL1A = _this2.clickData[_this2.selectedVideo].clickDataGroupByTimeArray[_this2.focusTimeLineViewScale];
	                _this2.zoomIn = false;
	                for (var i = 0, len = tempL1A.outliers.length; i < len; ++i) {
	                    var tempX = _this2.contextXscale(tempL1A.outliers[i].ts); //- moveRangeWidth;
	                    if (tempX <= startLine && tempX > endLine) {
	                        _this2.zoomIn = true;
	                    }
	                }
	            }).transition().duration(10).each("end", function () {
	                if (!stop && _this2.focusXscale.domain()[1] < _this2.xDomainMax) {
	                    if (_this2.isAcceleration && !_this2.zoomIn) {
	                        switch (_this2.accelerateMode) {
	                            case "domain":
	                                {
	                                    _this2.focusTimeLineViewScale = _this2.zoomScaleMax;
	                                    _this2.AccelerateByDomain(_this2.zoomScaleMax);
	                                    _this2.$refs.bubbleFloatComponent.accelerateBallsDropping(_this2.zoomScaleMax);
	                                    break;
	                                }
	                            case "screen":
	                                {
	                                    _this2.zoomIn = true;
	                                    _this2.focusDataScale = _this2.focusTimeLineViewScale = _this2.zoomScaleMax;
	                                    _this2.zoomOutView = [_this2.zoomInView[0] + _this2.viewInnerWidth * 0.5, _this2.timeLineHeight, _this2.viewInnerWidth * _this2.focusTimeLineViewScale];
	                                    _this2.AccelerateByScreen(duration, _this2.zoomInView, _this2.zoomOutView);
	                                    break;
	                                }
	                        }
	                    } else if (_this2.isAcceleration && _this2.zoomIn) {
	                        switch (_this2.accelerateMode) {
	                            case "domain":
	                                {
	                                    _this2.focusTimeLineViewScale = 1;
	                                    _this2.AccelerateByDomain(1);
	                                    _this2.$refs.bubbleFloatComponent.accelerateBallsDropping(1);
	                                    break;
	                                }
	                            case "screen":
	                                {
	                                    _this2.zoomIn = false;
	                                    _this2.focusDataScale = _this2.focusTimeLineViewScale = 1;
	                                    _this2.zoomInView = [_this2.zoomOutView[0] + _this2.viewInnerWidth * 0.5, _this2.timeLineHeight * 0.5, _this2.viewInnerWidth * _this2.focusTimeLineViewScale];
	                                    _this2.AccelerateByScreen(duration, _this2.zoomOutView, _this2.zoomInView);
	                                    break;
	                                }
	                        }
	                    } else {
	                        _this2.AnimationFisheyeTick(duration);
	                    }
	                }
	            });
	        },
	        Pause: function Pause() {
	            console.log("pause");
	            this.animation.interrupt();
	            this.$refs.bubbleFloatComponent.pause();
	        },
	        Resume: function Resume() {
	            this.AnimationFisheyeTick(this.baseDuration);
	            this.$refs.bubbleFloatComponent.resume();
	        },
	        AccelerateByDomain: function AccelerateByDomain(scale) {
	            var targetDuration = this.baseDuration / scale;
	            var sourceDuration = this.baseDuration / (scale != 1 ? 1 : this.zoomScaleMax);
	            var offset = (targetDuration - sourceDuration) * 0.2;
	            if (this.currentDuration != targetDuration) this.currentDuration += offset;
	            this.AnimationFisheyeTick(this.currentDuration);
	        },
	        AccelerateByScreen: function AccelerateByScreen(duration, start, end) {
	            console.log("accelerate by screen");
	            this.animation.interrupt();
	            this.selectVideoDisabled = true;
	            var originalFocusXscale = this.focusXscale.copy();
	            var halfScreen = end[2] * 0.5;
	            this.focusXscale.domain([end[0] - halfScreen, end[0] + halfScreen].map(originalFocusXscale.invert));
	            this.selectVideoDisabled = false;
	            this.AnimationTick(duration);
	        }
	    }
	};
	
	// self lib here

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(17), __esModule: true };

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(18);
	module.exports = __webpack_require__(38).Object.keys;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(19)
	  , $keys    = __webpack_require__(21);
	
	__webpack_require__(36)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(20);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(22)
	  , enumBugKeys = __webpack_require__(35);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(23)
	  , toIObject    = __webpack_require__(24)
	  , arrayIndexOf = __webpack_require__(27)(false)
	  , IE_PROTO     = __webpack_require__(31)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(25)
	  , defined = __webpack_require__(20);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(26);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(24)
	  , toLength  = __webpack_require__(28)
	  , toIndex   = __webpack_require__(30);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(29)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(29)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(32)('keys')
	  , uid    = __webpack_require__(34);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(33)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 34 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(37)
	  , core    = __webpack_require__(38)
	  , fails   = __webpack_require__(47);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(33)
	  , core      = __webpack_require__(38)
	  , ctx       = __webpack_require__(39)
	  , hide      = __webpack_require__(41)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 38 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(40);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(42)
	  , createDesc = __webpack_require__(50);
	module.exports = __webpack_require__(46) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(43)
	  , IE8_DOM_DEFINE = __webpack_require__(45)
	  , toPrimitive    = __webpack_require__(49)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(46) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(44);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(46) && !__webpack_require__(47)(function(){
	  return Object.defineProperty(__webpack_require__(48)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(47)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(44)
	  , document = __webpack_require__(33).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(44);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	var __vue_styles__ = {}
	__webpack_require__(57)
	__vue_script__ = __webpack_require__(58)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\components\\BubbleFloat\\BubbleFloat.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(97)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	var __vue_options__ = typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports
	if (__vue_template__) {
	__vue_options__.template = __vue_template__
	}
	if (!__vue_options__.computed) __vue_options__.computed = {}
	Object.keys(__vue_styles__).forEach(function (key) {
	var module = __vue_styles__[key]
	__vue_options__.computed[key] = function () { return module }
	})


/***/ },
/* 57 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof2 = __webpack_require__(59);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _keys = __webpack_require__(16);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _d = __webpack_require__(51);
	
	var _d2 = _interopRequireDefault(_d);
	
	var _MoveEngine = __webpack_require__(96);
	
	var _MoveEngine2 = _interopRequireDefault(_MoveEngine);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	    ready: function ready() {
	        this.InitVariables();
	    },
	
	
	    doc: null,
	    timeFormat: null,
	    stackLayout: null,
	    singleYScale: null,
	    singleXScale: null,
	    frontGroundStackbar: null,
	    timeLineAxis: null,
	    moveLayout: null,
	    moveLayout2: null,
	    videosData: {},
	    nodesToAdd: [],
	    nodesToAdd2: [],
	    xAxisGen: null,
	    yAxisGen: null,
	    xAxis: null,
	    yAxis: null,
	    xAxisTimeFormat: null,
	    areaGen: null,
	    frontGroundAreaGen: null,
	    borderLineGen: null,
	    digitalClock: null,
	    digitalTimeFormat: null,
	    digitalDateFormat: null,
	    digitalClockHourScale: null,
	    digitalClockMinuteScale: null,
	    digitalClockRadius: null,
	    digitalClockHourHandLength: null,
	    digitalClockMinuteHandLength: null,
	    digitalClockHandData: null,
	
	    boundarys: {},
	    boundarysUpOrDown: {},
	
	    data: function data() {
	        return {
	            padding: { top: 0, left: 100, bottom: 50, right: 50 },
	            chartWidth: 500,
	            chartHeight: 400,
	            barHeight: 400,
	            timeInterval: 60,
	            stackBarWidth: 30,
	            stackBarMaxY: -Infinity,
	            stackBarMaxIndex: 1,
	            is2D: false,
	            isFragmentChart: false,
	            gDirection: 1,
	            gMagnitude: 1.8,
	
	            chartTemplate: null,
	            layersName: [1, 2, 3],
	            clickColor: {
	                "pause": "#FFC107",
	                "play": "#80CBC4",
	                "seeked": "#03A9F4",
	                "error": "#607D8B",
	                "ratechange": "#00BCD4",
	                "stalled": "#EF5350"
	            },
	            orderMapping: {
	                "stalled": 0,
	                "ratechange": 1,
	                "play": 2,
	                "seeked": 3,
	                "pause": 4
	            },
	            clickBallSplitThreshold: 20,
	            //Count for test
	            count2: 0,
	            count20: 0,
	            timer: 0,
	            sumTime: 0
	        };
	    },
	
	    methods: {
	        InitVariables: function InitVariables() {
	            var _this = this;
	
	            var self = this;
	            this.doc = _d2.default.select(this.$el);
	            this.timeLineTimeFormat = _d2.default.time.format("%b %d %H:%M");
	            this.xAxisTimeFormat = _d2.default.time.format("%M:%S");
	            this.stackLayout = _d2.default.layout.stack().offset("zero").values(function (d) {
	                return d.values;
	            }).x(function (d) {
	                return d.x;
	            }).y(function (d) {
	                return d.y;
	            });
	
	            this.singleXScale = _d2.default.scale.linear().range([this.padding.left, this.chartWidth - this.padding.right]);
	            this.singleYScale = _d2.default.scale.linear().range([this.chartHeight - this.padding.bottom, this.chartHeight - this.barHeight]);
	
	            this.chartTemplate = '<svg class="bubble-float-svg" width=' + this.chartWidth + ' height=' + this.chartHeight + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom) + '></canvas>';
	            this.nodesToAdd = [];
	
	            this.xAxisGen = _d2.default.svg.axis().scale(this.singleXScale).tickSize(6, 0).orient("bottom");
	
	            this.yAxisGen = _d2.default.svg.axis().scale(this.singleYScale).ticks(4).tickSize(6, 0).orient("left");
	
	            this.areaGen = _d2.default.svg.area().interpolate("basis").x(function (d) {
	                return _this.singleXScale(d.x);
	            }).y0(function (d) {
	                return _this.singleYScale(d.y0);
	            }).y1(function (d) {
	                return _this.singleYScale(d.y + d.y0);
	            });
	            this.frontGroundAreaGen = _d2.default.svg.area().interpolate("basis").x(function (d) {
	                return _this.singleXScale(d.x);
	            }).y0(function (d) {
	                return _this.singleYScale(d.y0);
	            }).y1(function (d) {
	                return _this.singleYScale(d.y0 + d.clickNum);
	            });
	            this.borderLineGen = _d2.default.svg.line().x(function (d) {
	                return _this.singleXScale(d.x);
	            }).y(function (d) {
	                return _this.singleYScale(d.y0);
	            }).interpolate("basis");
	
	            this.digitalDateFormat = _d2.default.time.format("%b %d");
	            this.digitalTimeFormat = _d2.default.time.format("%H:%M");
	        },
	        setTimeInterval: function setTimeInterval(t) {
	            if (!t) return;
	            this.timeInterval = t;
	            if (this.videosData) {
	                var keys = (0, _keys2.default)(this.videosData);
	                for (var i = 0, len = keys.length; i < len; ++i) {
	                    this.videosData[keys[i]].hasAggregate = false;
	                }
	            }
	
	            return this;
	        },
	        setPosition: function setPosition(left, top) {
	            _d2.default.select(this.$el).style({
	                "top": top + "px",
	                "left": left + "px"
	            });
	
	            return this;
	        },
	        setSize: function setSize(s) {
	            if (Array.isArray(s)) {
	                this.chartWidth = s[0];
	                this.chartHeight = s[1];
	                this.chartTemplate = '<svg class="bubble-float-svg" width=' + this.chartWidth + ' height=' + this.chartHeight + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom) + '></canvas>';
	                this.singleXScale.range([this.padding.left, this.chartWidth - this.padding.right]);
	                this.singleYScale.range([this.chartHeight - this.padding.bottom, this.chartHeight - this.barHeight]);
	                this.xAxisGen.scale(this.singleXScale);
	                this.yAxisGen.scale(this.singleYScale);
	            }
	
	            return this;
	        },
	        setBarHeight: function setBarHeight(h) {
	            if (typeof h === "number") {
	                this.barHeight = h;
	                this.singleYScale.range([this.chartHeight - this.padding.bottom, this.chartHeight - h]);
	            }
	            return this;
	        },
	        setPadding: function setPadding(p) {
	            if ((typeof p === 'undefined' ? 'undefined' : (0, _typeof3.default)(p)) === "object") {
	                this.padding = p;
	            }
	            return this;
	        },
	        setIs2D: function setIs2D(t) {
	            if (typeof t === "boolean") {
	                this.is2D = t;
	            }
	            return this;
	        },
	        setFragmentpadding: function setFragmentpadding(p) {
	            if (typeof p === "number") {
	                this.fragmentPadding = p;
	            }
	            return this;
	        },
	        videosData: function videosData(data) {
	
	            var stackGraphIds = (0, _keys2.default)(data);
	            var stackGraphs = stackGraphIds.map(function (d) {
	                return data[d];
	            });
	            this.layersName = stackGraphs[0].layers.filter(function (d) {
	                return d.name != "error";
	            }).map(function (d) {
	                return d.name;
	            });
	            this.videosData = data;
	            return this;
	        },
	        getTimeInterval: function getTimeInterval() {
	            return this.timeInterval;
	        },
	        getVideoLength: function getVideoLength(videoId) {
	            var data = this.videosData[videoId];
	            return data.layers[0].values.length;
	        },
	        processData: function processData(data) {
	            if (!data) return;
	            // aggregate the clicks by time
	            if (!data.hasAggregate) {
	                for (var i = 0, len = data.layers.length; i < len; ++i) {
	                    var layer = data.layers[i];
	                    var oldValues = layer.values,
	                        newValues = [];
	                    for (var j = 0, lenj = Math.ceil(oldValues.length / this.timeInterval); j < lenj; ++j) {
	                        newValues.push({ x: j, y: 0 });
	                    }
	
	                    for (var _j = 1, _lenj = oldValues.length; _j < _lenj; ++_j) {
	                        var newIndex = Math.floor(_j / this.timeInterval);
	                        newValues[newIndex].y += oldValues[_j].y;
	                    }
	                    layer.values = newValues;
	                    layer._original_values = oldValues;
	                }
	                data.maxTime = Math.floor(data.maxTime / this.timeInterval);
	
	                var maxY = -Infinity;
	                // calculate the max Y
	                for (var _i = 0, _len = data.layers[0].values.length; _i < _len; ++_i) {
	                    var tempSum = 0;
	                    for (var _j2 = 0, _lenj2 = data.layers.length; _j2 < _lenj2; ++_j2) {
	                        tempSum += data.layers[_j2].values[_i].y;
	                    }
	                    if (tempSum > maxY) maxY = tempSum;
	                }
	                data.maxSumValues = maxY;
	                this.stackBarMaxY = maxY;
	                this.stackBarMaxIndex = data.maxTime;
	                data.hasAggregate = true;
	            }
	
	            // sort the order;
	
	            var sortedlayers = [];
	            this.layersName = [];
	            for (var _i2 = 0, _len2 = data.layers.length, d; _i2 < _len2; ++_i2) {
	                d = data.layers[_i2];
	                sortedlayers[this.orderMapping[d.name]] = d;
	                this.layersName[this.orderMapping[d.name]] = d.name;
	            }
	            data.layers = sortedlayers;
	            this.layersName = this.layersName.reverse();
	            //update scale
	            this.singleXScale.domain([0, data.maxTime]);
	            this.singleYScale.domain([0, data.maxSumValues]);
	            //update axis-gen
	            this.xAxisGen.scale(this.singleXScale);
	            this.yAxisGen.scale(this.singleYScale);
	        },
	        calBoundarys: function calBoundarys(chart) {
	            // init boundary
	            var boundary = {},
	                tPath = void 0,
	                tPathLength = void 0,
	                roundDist = void 0,
	                isLowerChart = void 0,
	                tempPlainLayerData = [],
	                len = 0;
	            //if (this.isFragmentChart) this.layersName.unshift("zero_");
	            for (var i = 0, _len3 = this.layersName.length; i < _len3; ++i) {
	                var layerName = this.layersName[i];
	                tPath = chart.select("g.layer-border." + layerName);
	                isLowerChart = tPath.select(function () {
	                    return this.parentNode;
	                }).classed("lower-chart");
	                tPath = tPath.select("path").node();
	                tPathLength = Math.floor(tPath.getTotalLength());
	                boundary[layerName] = { pathLength: tPathLength, isLowerChart: isLowerChart, values: [] };
	                roundDist = [];
	
	                for (var j = 0, point, index, dist; j < tPathLength; ++j) {
	                    point = tPath.getPointAtLength(j);
	                    index = Math.round(point.x);
	                    dist = Math.abs(point.x - index);
	                    if (roundDist[index]) {
	                        if (dist < roundDist[index]) {
	                            roundDist[index] = dist;
	                            boundary[layerName]['values'][index] = point.y;
	                        }
	                    } else {
	                        roundDist[index] = dist;
	                        boundary[layerName]['values'][index] = point.y;
	                    }
	                }
	            }
	            this.boundarys = boundary;
	        },
	        drawFregmentStackBarChart: function drawFregmentStackBarChart(videoId) {
	            var _this2 = this;
	
	            this.isFragmentChart = true;
	            this.boundarysUpOrDown = {};
	            this.clean();
	            this.processData(this.videosData[videoId]);
	
	            this.singleYScale.range([(this.chartHeight - this.padding.bottom) * 0.5, this.chartHeight - this.barHeight * 0.5]);
	            this.chartTemplate = '<svg class="bubble-float-svg" width=' + this.chartWidth + ' height=' + (this.chartHeight + this.fragmentPadding) + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom + this.fragmentPadding) + '></canvas>';
	
	            var chart = this.doc.append("div").attr({
	                "id": videoId,
	                "class": "bubble-float-chart"
	            }).html(this.chartTemplate).select("svg");
	
	            var maxIndex = this.singleXScale.domain()[1];
	            this.stackBarWidth = this.chartWidth / maxIndex;
	            this.xAxisGen.ticks(maxIndex);
	
	            // stack data 
	            var data = this.stackLayout(this.videosData[videoId].layers.filter(function (d, i) {
	                return i >= 3;
	            }));
	            var data2 = this.stackLayout(this.videosData[videoId].layers.filter(function (d, i) {
	                return i < 3;
	            }));
	
	            // append stackBar
	            chart.append("g").attr("class", "back-ground upper-chart").selectAll("g.layer").data(data).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this2.areaGen(d.values);
	            });
	
	            chart.append("g").attr("class", "back-ground lower-chart").attr("transform", "translate(0," + (this.fragmentPadding + this.chartHeight * 0.5) + ")").selectAll("g.layer").data(data2).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this2.areaGen(d.values);
	            });
	
	            var tempUppest = data[data.length - 1].values.map(function (d) {
	                return { x: d.x, y0: d.y + d.y0 };
	            });
	            this.layersName.unshift("zero_");
	            chart.select("g.back-ground.upper-chart").selectAll("g.layer-border").data(data.concat([{ name: "zero_", values: tempUppest }])).enter().append("g").attr("class", function (d) {
	                return "layer-border " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this2.borderLineGen(d.values);
	            });
	
	            this.borderLineGen.y(function (d) {
	                return _this2.fragmentPadding + _this2.chartHeight * 0.5 + _this2.singleYScale(d.y0);
	            });
	            chart.select("g.back-ground.lower-chart").selectAll("g.layer-border").data(data2).enter().append("g").attr("class", function (d) {
	                return "layer-border " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this2.borderLineGen(d.values);
	            });
	
	            this.calBoundarys(chart);
	
	            for (var i = 0, len = data.length; i < len; ++i) {
	                for (var j = 0, lenj = data[i].values.length; j < lenj; ++j) {
	                    data[i].values[j].clickNum = 0;
	                }
	                this.boundarysUpOrDown[data[i].name] = this.chartHeight * 0.5;
	            }
	            for (var _i3 = 0, _len4 = data2.length; _i3 < _len4; ++_i3) {
	                for (var _j3 = 0, _lenj3 = data2[_i3].values.length; _j3 < _lenj3; ++_j3) {
	                    data2[_i3].values[_j3].clickNum = 0;
	                }
	                this.boundarysUpOrDown[data2[_i3].name] = this.chartHeight * 0.5 + this.fragmentPadding;
	            }
	
	            this.frontGroundStackbar = chart.append("g").attr("class", "front-ground");
	            this.frontGroundStackbar.selectAll("g.layer upper-chart").data(data).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this2.frontGroundAreaGen(d.values);
	            });
	            this.frontGroundStackbar.selectAll("g.layer lower-chart").data(data2).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("transform", "translate(0," + (this.fragmentPadding + this.chartHeight * 0.5) + ")").attr("d", function (d) {
	                return _this2.frontGroundAreaGen(d.values);
	            });
	
	            this.drawLegends(chart, chart);
	            this.resetMoveLayout(chart);
	
	            return this;
	        },
	        drawStackAreaChart: function drawStackAreaChart(videoId) {
	            var _this3 = this;
	
	            this.isFragmentChart = false;
	            this.clean();
	            this.processData(this.videosData[videoId]);
	
	            var chart = this.doc.append("div").attr({
	                "id": videoId,
	                "class": "bubble-float-chart"
	            }).html(this.chartTemplate).select("svg");
	
	            var maxIndex = this.singleXScale.domain()[1];
	            this.stackBarWidth = this.chartWidth / maxIndex;
	            this.xAxisGen.ticks(maxIndex);
	
	            // stack data 
	            var data = this.stackLayout(this.videosData[videoId].layers);
	            // append stackBar
	            chart.append("g").attr("class", "back-ground upper-chart").selectAll("g.layer").data(data).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this3.areaGen(d.values);
	            });
	
	            var tempUppest = data[data.length - 1].values.map(function (d) {
	                return { x: d.x, y0: d.y + d.y0 };
	            });
	            this.layersName.unshift("zero_");
	            chart.select("g.back-ground.upper-chart").selectAll("g.layer-border").data(data.concat([{ name: "zero_", values: tempUppest }])).enter().append("g").attr("class", function (d) {
	                return "layer-border " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this3.borderLineGen(d.values);
	            });
	
	            this.calBoundarys(chart);
	
	            for (var i = 0, len = data.length; i < len; ++i) {
	                for (var j = 0, lenj = data[i].values.length; j < lenj; ++j) {
	                    data[i].values[j].clickNum = 0;
	                }
	            }
	
	            this.frontGroundStackbar = chart.append("g").attr("class", "front-ground");
	            this.frontGroundStackbar.selectAll("g.layer upper-chart").data(data).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this3.frontGroundAreaGen(d.values);
	            });
	
	            this.drawLegends(chart);
	            this.resetMoveLayout(chart);
	            return this;
	        },
	        drawNoStackChart: function drawNoStackChart(videoId) {
	            this.isFragmentChart = false;
	            this.clean();
	            this.processData(this.videosData[videoId]);
	            this.layersName.unshift("zero_");
	            var chart = this.doc.append("div").attr({
	                "id": videoId,
	                "class": "bubble-float-chart"
	            }).html(this.chartTemplate).select("svg");
	
	            this.drawLegends(chart);
	            this.resetMoveLayout(chart);
	            return this;
	        },
	        drawStackChart: function drawStackChart(position, videoId) {
	            switch (position) {
	                case "middle":
	                    {
	                        this.drawFregmentStackBarChart(videoId);
	                        break;
	                    }
	                case "down":
	                    {
	                        this.gDirection = -1;
	                        this.drawStackAreaChart(videoId);
	                        break;
	                    }
	                default:
	                    {
	                        this.gDirection = 1;
	                        this.drawStackAreaChart(videoId);
	                    }
	            }
	            return this;
	        },
	        drawLegends: function drawLegends(chart, chart2) {
	            var _this4 = this;
	
	            this.xAxis = chart.select("g.back-ground.upper-chart").append("g").attr({
	                "class": "x axis",
	                "transform": "translate(" + [-this.stackBarWidth * 0.5, this.chartHeight - this.padding.bottom] + ")"
	            }).call(this.xAxisGen);
	            this.xAxis.selectAll(".tick text").text(function (d, i) {
	                if (i & 1) return _this4.xAxisTimeFormat(new Date(_this4.timeInterval * d * 1000));
	            });
	            this.xAxis.append("text").attr({
	                "class": "caption",
	                "x": this.chartWidth * 0.5,
	                "y": this.padding.bottom - 5
	            }).text("Video Progress");
	
	            this.yAxis = chart.select("g.back-ground.upper-chart").append("g").attr({
	                "class": "y axis",
	                "transform": "translate(" + [this.padding.left, 0] + ")"
	            }).call(this.yAxisGen);
	
	            this.yAxis.append("text").attr({
	                "class": "caption vertical-caption",
	                "x": -this.chartHeight + this.barHeight * 0.5 + this.padding.bottom,
	                "y": -45
	            }).text("Number of Clicks");
	
	            if (chart2) {
	                this.xAxis.attr("transform", "translate(" + [-this.stackBarWidth * 0.5, (this.chartHeight - this.padding.bottom) * 0.5] + ")");
	
	                chart2.select("g.back-ground.lower-chart").append("g").attr({
	                    "class": "x axis",
	                    "transform": "translate(" + [-this.stackBarWidth * 0.5, (this.chartHeight - this.padding.bottom) * 0.5] + ")"
	                }).call(this.xAxisGen);
	
	                chart2.select("g.back-ground.lower-chart").append("g").attr("class", "y axis").call(this.yAxisGen);
	            }
	
	            var legends = chart.append("g").attr({
	                "class": "legend",
	                "transform": "translate(" + [this.chartWidth - this.padding.left, 10] + ")"
	            }).selectAll("g.legend-rect").data(this.layersName.filter(function (d, i) {
	                return i;
	            })).enter().append("g").attr("class", function (d) {
	                return "legend-rect " + d;
	            });
	
	            legends.append("rect").attr({
	                "y": function y(d, i) {
	                    return i * 25;
	                },
	                "height": 20,
	                "width": 20
	            });
	
	            legends.append("text").attr({
	                "y": function y(d, i) {
	                    return i * 25 + 15;
	                },
	                "x": -5
	            }).style({
	                "text-anchor": "end"
	            }).text(function (d) {
	                return d;
	            });
	
	            this.timeLineAxis = chart.append("g").attr("class", "timeline axis").attr("transform", "translate(" + [this.chartWidth * 0.5, this.chartHeight - this.barHeight - 10] + ")").style("opacity", 1e-6);
	            this.timeLineAxis.append("line").attr({ "x1": -50, "x2": 50, "y1": -20, "y2": -20 });
	            this.timeLineAxis.append("text");
	
	            //draw digital clock
	            this.drawDigitalClock(chart);
	        },
	        drawDigitalClock: function drawDigitalClock(chart) {
	            this.digitalClock = chart.append("g").attr("class", "clock-group").attr("transform", "translate(" + [this.chartWidth * 0.5, 60] + ")");
	            // this.digitalClock
	            //     .append("line")
	            //     .attr({
	            //         "x1": - 150,
	            //         "y1": 80,
	            //         "y2": 80,
	            //         "x2": 150
	            //     });
	            // this.digitalClock
	            //     .append("text")
	            //     .attr({
	            //         "class": "date",
	            //         "y":150
	            //     })
	            //     .text("TEST");
	            this.digitalClock.append("line").attr({
	                "x1": -150,
	                "y1": 20,
	                "y2": 20,
	                "x2": 150
	            });
	            this.digitalClock.append("text").attr({
	                "class": "date"
	            }).text("TEST");
	            this.digitalClock.append("text").attr({
	                "class": "time",
	                "y": 85
	            }).text("TEST");
	
	            // this.digitalClockHourScale = d3.scale.linear()
	            //     .range([0, 330])
	            //     .domain([0, 11]);
	
	            // this.digitalClockMinuteScale = d3.scale.linear()
	            //     .range([0, 354])
	            //     .domain([0, 59]);
	
	            // this.digitalClockRadius = 60;
	            // this.digitalClockHourHandLength = 2 * this.digitalClockRadius / 3;
	            // this.digitalClockHandData = [
	            //     {
	            //         type: 'hour',
	            //         value: 0,
	            //         length: - this.digitalClockHourHandLength,
	            //         scale: this.digitalClockHourScale
	            //     }
	            // ];
	            // let circleClock = this.digitalClock.append("g").attr("class", "analog-clock").attr("transform", "translate(0," + 10 + ")");
	            // circleClock
	            //     .append("circle")
	            //     .attr("class", "clockface")
	            //     .attr("r", this.digitalClockRadius);
	            // circleClock.selectAll(".clockhand")
	            //     .data(this.digitalClockHandData).enter()
	            //     .append('line')
	            //     .attr('class', function(d) {
	            //         return d.type + '-hand clockhand';
	            //     })
	            //     .attr('x1', 0)
	            //     .attr('y1', function(d) {
	            //         return d.balance ? d.balance : 0;
	            //     })
	            //     .attr('x2', 0)
	            //     .attr('y2', function(d) {
	            //         return d.length;
	            //     })
	            //     .attr('transform', function(d) {
	            //         return 'rotate(' + d.scale(d.value) + ')';
	            //     });
	            // circleClock
	            //     .append("circle")
	            //     .attr("class", "centerdot")
	            //     .attr("r", 2);
	        },
	        AnimationUpdateDigitalClock: function AnimationUpdateDigitalClock(date) {
	            if (!this.digitalClock) return;
	            if (typeof date === "number" || typeof date === "string") date = new Date(date);
	            //this.digitalClock.select("text.date").text(this.digitalDateFormat(date)+" "+this.digitalTimeFormat(date));
	            this.digitalClock.select("text.date").text(this.digitalDateFormat(date));
	            this.digitalClock.select("text.time").text(this.digitalTimeFormat(date));
	
	            // this.digitalClockHandData[0].value = (date.getHours() % 12) + date.getMinutes() / 60;
	            // this.digitalClock.select("g.analog-clock").selectAll("line").data(this.digitalClockHandData)
	            //     .transition()
	            //     .attr('transform', function(d) {
	            //         return 'rotate(' + d.scale(d.value) + ')';
	            //     });
	        },
	        resetMoveLayout: function resetMoveLayout() {
	            var _this5 = this;
	
	            var context = this.doc.select("canvas").node().getContext("2d");
	            var tickFunc = function tickFunc(e) {
	                var TWOPI = 2 * Math.PI;
	                var gy = e.gy;
	                var balls = e.balls,
	                    i = -1,
	                    ball = void 0,
	                    n = balls.length;
	                var bounds = e.bounds;
	                context.clearRect(bounds[0][0], bounds[0][1], bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]);
	                var tickTsData = {};
	                var minBall = { dist: -Infinity, barTs: 0 };
	                while (++i < n) {
	                    ball = balls[i];
	                    if (ball.fixed) continue;
	                    context.beginPath();
	                    context.fillStyle = ball.color;
	                    context.arc(ball.x, ball.y, ball.r, 0, TWOPI);
	                    context.fill();
	
	                    //if (gy == this.gMagnitude) {
	                    if (ball.y < _this5.chartHeight - _this5.barHeight) {
	                        if (ball.y > _this5.chartHeight - _this5.barHeight - 20) {
	                            if (ball.y > minBall.dist) {
	                                minBall.dist = ball.y;
	                                minBall.barTs = ball.barTs;
	                            }
	                        }
	                    }
	                    //}
	                }
	                // if (minBall.barTs === 0) {
	                //     this.timeLineAxis.transition().style("opacity", 1e-6);
	                // } else {
	                //     this.timeLineAxis.transition().style("opacity", 1).select("text").text(this.timeLineTimeFormat(new Date(+minBall.barTs)));
	                // }
	
	
	                // let len = Object.keys(tickTsData).length;
	                // let ticks = this.timeLineAxis.selectAll(".tick").data(Object.keys(tickTsData), function(d){ return d;});
	                // ticks.enter().append("g").attr("class","tick").append("text").text((d)=>{ return this.timeLineTimeFormat(new Date(+d));});
	                // ticks.attr("transform", function(d){ return "translate(0,"+tickTsData[d]+")";});
	                // ticks.exit().remove();
	            };
	            var sedFunc = function sedFunc(e) {
	                var firstPassNodes = e.firstPassNodes;
	                if (_this5.frontGroundStackbar) {
	                    for (var i = 0, len = firstPassNodes.length, node, frontData; i < len; ++i) {
	                        node = firstPassNodes[i];
	                        frontData = _this5.frontGroundStackbar.select("g.layer." + node.boundary).data()[0].values;
	                        frontData[node.xIndex].clickNum += node.clickNum;
	                    }
	
	                    for (var _i4 = 0, _len5 = e.sedLayers.length; _i4 < _len5; ++_i4) {
	                        _this5.frontGroundStackbar.select("g.layer." + e.sedLayers[_i4]).select("path").transition().attr("d", function (d) {
	                            return _this5.frontGroundAreaGen(d.values);
	                        });
	                    }
	                }
	            };
	
	            var endFunc = function endFunc(e) {
	                _this5.frontGroundAreaGen.y1(function (d) {
	                    return _this5.singleYScale(d.y0 + d.y);
	                });
	
	                _this5.frontGroundStackbar.selectAll("g.layer").select("path").transition().attr("d", function (d) {
	                    return _this5.frontGroundAreaGen(d.values);
	                });
	            };
	
	            if (this.isFragmentChart) {
	                this.moveLayout = (0, _MoveEngine2.default)([]).friction(4).gravity([0, -this.gDirection * Infinity, this.gMagnitude]).bounds([[this.padding.left, 0], [this.chartWidth - this.padding.right, this.fragmentPadding + (this.chartHeight - this.padding.bottom) * 0.5]]).boundary(this.boundarys).on('tick', tickFunc).on('sed', sedFunc).on('end', endFunc);
	                this.moveLayout2 = (0, _MoveEngine2.default)([]).friction(4).gravity([0, this.gDirection * Infinity, this.gMagnitude]).bounds([[this.padding.left, this.fragmentPadding + (this.chartHeight - this.padding.bottom) * 0.5], [this.chartWidth - this.padding.right, this.fragmentPadding + this.chartHeight - this.padding.bottom]]).boundary(this.boundarys).on('tick', tickFunc).on('sed', sedFunc).on('end', endFunc);
	            } else {
	                this.moveLayout = (0, _MoveEngine2.default)([]).friction(4).gravity([0, this.gDirection * Infinity, 0]).bounds([[this.padding.left, 0], [this.chartWidth - this.padding.right, this.chartHeight - this.padding.bottom]]).boundary(this.boundarys)
	                //.isAABBBoundary(true)
	                .on('tick', tickFunc).on('sed', sedFunc).on('end', endFunc);
	            }
	        },
	        accelerateBallsDropping: function accelerateBallsDropping(m) {
	            if (this.moveLayout && typeof m === "number") {
	                this.moveLayout.gravity([0, this.gDirection * Infinity, m * this.gMagnitude]);
	            }
	        },
	        bubbleInitYPositionGen: function bubbleInitYPositionGen() {
	            var _this6 = this;
	
	            if (this.is2D) {
	                var _ret = function () {
	                    var layersName = (0, _keys2.default)(_this6.boundarys);
	                    if (_this6.isFragmentChart) {
	                        return {
	                            v: function v(ball) {
	                                var layer = ball.boundary;
	                                var lastLayerIndex = layersName[layersName.indexOf(layer) - 1];
	                                var localUperBoundary = _this6.boundarys[lastLayerIndex];
	                                var upperY = void 0;
	                                if (localUperBoundary && localUperBoundary.isLowerChart === _this6.boundarys[layer].isLowerChart) {
	                                    upperY = localUperBoundary.values[Math.round(ball.x)] + ball.r;
	                                } else {
	                                    upperY = _this6.boundarys[layer].values[Math.round(ball.x)] - 60;
	                                }
	                                return upperY;
	                            }
	                        };
	                    } else {
	                        return {
	                            v: function v(ball) {
	                                var layer = ball.boundary;
	                                var lastLayerIndex = layersName[layersName.indexOf(layer) - 1];
	                                var localUperBoundary = _this6.boundarys[lastLayerIndex] && _this6.boundarys[lastLayerIndex].values;
	                                var upperY = localUperBoundary ? localUperBoundary[Math.round(ball.x)] + ball.r : _this6.boundarys[layer].values[Math.round(ball.x)] - 60;
	
	                                return upperY;
	                            }
	                        };
	                    }
	                }();
	
	                if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
	            } else {
	                if (this.isFragmentChart) {
	                    return function (ball) {
	                        return _this6.boundarysUpOrDown[ball.boundary] + 5 + Math.random() * 20;
	                    };
	                } else {
	                    return function () {
	                        return _this6.gDirection > 0 ? 50 + Math.random() * 20 : (_this6.height - _this6.padding.bottom) * 0.9;
	                    };
	                }
	            }
	        },
	        inputClicks: function inputClicks(clicksData, d) {
	            var ballsToAdd = {};
	            var maxClicks = 1;
	            for (var i = 0, len = clicksData.length; i < len; ++i) {
	                var click = clicksData[i];
	                var xIndex = Math.floor(click.currentTime / this.timeInterval);
	
	                var boundaryIndex = click.type + "-" + xIndex;
	                if (boundaryIndex in ballsToAdd) {
	                    ++ballsToAdd[boundaryIndex].clickNum;
	                    if (ballsToAdd[boundaryIndex].clickNum > maxClicks) maxClicks = ballsToAdd[boundaryIndex].clickNum;
	                } else {
	                    var xPos = this.singleXScale(xIndex);
	                    xPos = xPos + (xIndex >= this.stackBarMaxIndex ? -this.stackBarWidth : this.stackBarWidth * Math.random());
	                    ballsToAdd[boundaryIndex] = {
	                        'boundary': click.type,
	                        "xIndex": xIndex,
	                        'barTs': d.ts,
	                        'x': xPos,
	                        'clickNum': 1,
	                        'color': this.clickColor[click.type]
	                    };
	                }
	            }
	
	            var yGen = this.bubbleInitYPositionGen();
	            var ballsKeys = (0, _keys2.default)(ballsToAdd);
	            var balls = [],
	                balls2 = [];
	            for (var _i5 = 0, _len6 = ballsKeys.length, ballCandidate; _i5 < _len6; ++_i5) {
	                ballCandidate = ballsToAdd[ballsKeys[_i5]];
	                ballCandidate.r = 0.8 * ballCandidate.clickNum; // / maxClicks;
	                ballCandidate.y = yGen(ballCandidate);
	                ballCandidate.py = ballCandidate.y - 2;
	                var tempBallCandidates = [],
	                    rThreshold = this.getOffsetBetweenUpAndDown(ballCandidate);
	                if (ballCandidate.r > rThreshold) {
	                    // if need to split
	                    var totalR = ballCandidate.r;
	                    while (totalR - rThreshold > 0) {
	                        tempBallCandidates.push({
	                            'boundary': ballCandidate.boundary,
	                            "xIndex": ballCandidate.xIndex,
	                            'x': ballCandidate.x,
	                            'y': ballCandidate.y,
	                            'py': ballCandidate.py,
	                            'barTs': ballCandidate.barTs,
	                            'r': rThreshold,
	                            'clickNum': 0, // no need to cal the clickNum of split balls
	                            'color': ballCandidate.color
	                        });
	                        totalR -= rThreshold;
	                    }
	                    tempBallCandidates.push({
	                        'boundary': ballCandidate.boundary,
	                        "xIndex": ballCandidate.xIndex,
	                        'x': ballCandidate.x,
	                        'y': ballCandidate.y,
	                        'py': ballCandidate.py,
	                        'barTs': ballCandidate.barTs,
	                        'r': totalR,
	                        'clickNum': ballCandidate.clickNum, // no need to cal the clickNum of split balls
	                        'color': ballCandidate.color
	                    });
	                } else {
	                    // no need to split
	                    tempBallCandidates.push(ballCandidate);
	                }
	
	                if (this.isFragmentChart) {
	                    // if fragment chart, push the balls to differrnt movelayout
	                    for (var j = 0, lenj = tempBallCandidates.length; j < lenj; ++j) {
	                        var ball = tempBallCandidates[j];
	                        if (this.boundarysUpOrDown[ball.boundary] <= this.chartHeight * 0.5) {
	                            balls.push(ball);
	                        } else {
	                            balls2.push(ball);
	                        }
	                    }
	                } else {
	                    for (var _j4 = 0, _lenj4 = tempBallCandidates.length; _j4 < _lenj4; ++_j4) {
	                        balls.push(tempBallCandidates[_j4]);
	                    }
	                }
	            }
	            this.nodesToAdd = balls;
	            if (this.isFragmentChart) {
	                this.nodesToAdd2 = balls2;
	            }
	            return this;
	        },
	        getOffsetBetweenUpAndDown: function getOffsetBetweenUpAndDown(ball) {
	            if (!this.boundarys) return this.clickBallSplitThreshold;
	            var boundaryKeys = (0, _keys2.default)(this.boundarys);
	            var lastBoundaryKey = boundaryKeys[boundaryKeys.indexOf(ball.boundary) - 1];
	            var uperBoundary = this.boundarys[lastBoundaryKey] && this.boundarys[lastBoundaryKey].values;
	            if (!uperBoundary) return this.clickBallSplitThreshold;
	
	            var lowerBoundary = this.boundarys[ball.boundary].values;
	            var upperY = uperBoundary[Math.round(ball.x)];
	            var lowerY = lowerBoundary[Math.round(ball.x)];
	            var offset = lowerY - upperY;
	            return Math.min(offset * 0.5, this.clickBallSplitThreshold);
	        },
	        testMoveLayout: function testMoveLayout(node) {
	            this.moveLayout.addNode(node);
	        },
	        drawClicks: function drawClicks() {
	            if (this.moveLayout && this.nodesToAdd.length) {
	
	                this.moveLayout.addNodes(this.nodesToAdd);
	                this.nodesToAdd = undefined;
	                if (this.isFragmentChart) {
	                    this.moveLayout2.addNodes(this.nodesToAdd2);
	                    this.nodesToAdd2 = undefined;
	                }
	            }
	
	            return this;
	        },
	        canBeFinished: function canBeFinished(t) {
	            if (typeof t === "boolean") {
	                this.moveLayout.canBeFinished(t);
	            }
	            return this;
	        },
	        finish: function finish() {
	            console.log("finish");
	            this.moveLayout.finish();
	        },
	        clean: function clean() {
	            var _this7 = this;
	
	            this.chartTemplate = '<svg class="bubble-float-svg" width=' + this.chartWidth + ' height=' + this.chartHeight + '></svg><canvas class="bubble-float-canvas" width=' + this.chartWidth + ' height=' + (this.chartHeight - this.padding.bottom) + '></canvas>';
	            this.singleYScale.range([this.chartHeight - this.padding.bottom, this.chartHeight - this.barHeight]);
	            this.borderLineGen.y(function (d) {
	                return _this7.singleYScale(d.y0);
	            });
	            this.frontGroundAreaGen.y1(function (d) {
	                return _this7.singleYScale(d.y0 + d.clickNum);
	            });
	            this.nodesToAdd = this.nodesToAdd2 = undefined;
	            this.doc.select("div").remove();
	            this.moveLayout && this.moveLayout.remove();
	            this.moveLayout2 && this.moveLayout2.remove();
	            this.moveLayout2 = undefined;
	        },
	        start: function start() {
	            this.moveLayout && this.moveLayout.start();
	            if (this.isFragmentChart) {
	                this.moveLayout2 && this.moveLayout2.start();
	            }
	        },
	        pause: function pause() {
	            this.moveLayout && this.moveLayout.pause();
	        },
	        resume: function resume() {
	            this.moveLayout && this.moveLayout.resume();
	        }
	    }
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _iterator = __webpack_require__(60);
	
	var _iterator2 = _interopRequireDefault(_iterator);
	
	var _symbol = __webpack_require__(80);
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(61), __esModule: true };

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(62);
	__webpack_require__(75);
	module.exports = __webpack_require__(79).f('iterator');

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(63)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(64)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(29)
	  , defined   = __webpack_require__(20);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(65)
	  , $export        = __webpack_require__(37)
	  , redefine       = __webpack_require__(66)
	  , hide           = __webpack_require__(41)
	  , has            = __webpack_require__(23)
	  , Iterators      = __webpack_require__(67)
	  , $iterCreate    = __webpack_require__(68)
	  , setToStringTag = __webpack_require__(72)
	  , getPrototypeOf = __webpack_require__(74)
	  , ITERATOR       = __webpack_require__(73)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(41);

/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(69)
	  , descriptor     = __webpack_require__(50)
	  , setToStringTag = __webpack_require__(72)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(41)(IteratorPrototype, __webpack_require__(73)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(43)
	  , dPs         = __webpack_require__(70)
	  , enumBugKeys = __webpack_require__(35)
	  , IE_PROTO    = __webpack_require__(31)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(48)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(71).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};
	
	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(42)
	  , anObject = __webpack_require__(43)
	  , getKeys  = __webpack_require__(21);
	
	module.exports = __webpack_require__(46) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(33).document && document.documentElement;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(42).f
	  , has = __webpack_require__(23)
	  , TAG = __webpack_require__(73)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(32)('wks')
	  , uid        = __webpack_require__(34)
	  , Symbol     = __webpack_require__(33).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(23)
	  , toObject    = __webpack_require__(19)
	  , IE_PROTO    = __webpack_require__(31)('IE_PROTO')
	  , ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(76);
	var global        = __webpack_require__(33)
	  , hide          = __webpack_require__(41)
	  , Iterators     = __webpack_require__(67)
	  , TO_STRING_TAG = __webpack_require__(73)('toStringTag');
	
	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(77)
	  , step             = __webpack_require__(78)
	  , Iterators        = __webpack_require__(67)
	  , toIObject        = __webpack_require__(24);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(64)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(73);

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(81), __esModule: true };

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(82);
	__webpack_require__(93);
	__webpack_require__(94);
	__webpack_require__(95);
	module.exports = __webpack_require__(38).Symbol;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(33)
	  , has            = __webpack_require__(23)
	  , DESCRIPTORS    = __webpack_require__(46)
	  , $export        = __webpack_require__(37)
	  , redefine       = __webpack_require__(66)
	  , META           = __webpack_require__(83).KEY
	  , $fails         = __webpack_require__(47)
	  , shared         = __webpack_require__(32)
	  , setToStringTag = __webpack_require__(72)
	  , uid            = __webpack_require__(34)
	  , wks            = __webpack_require__(73)
	  , wksExt         = __webpack_require__(79)
	  , wksDefine      = __webpack_require__(84)
	  , keyOf          = __webpack_require__(85)
	  , enumKeys       = __webpack_require__(86)
	  , isArray        = __webpack_require__(89)
	  , anObject       = __webpack_require__(43)
	  , toIObject      = __webpack_require__(24)
	  , toPrimitive    = __webpack_require__(49)
	  , createDesc     = __webpack_require__(50)
	  , _create        = __webpack_require__(69)
	  , gOPNExt        = __webpack_require__(90)
	  , $GOPD          = __webpack_require__(92)
	  , $DP            = __webpack_require__(42)
	  , $keys          = __webpack_require__(21)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;
	
	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};
	
	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};
	
	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};
	
	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });
	
	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(91).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(88).f  = $propertyIsEnumerable;
	  __webpack_require__(87).f = $getOwnPropertySymbols;
	
	  if(DESCRIPTORS && !__webpack_require__(65)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	
	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});
	
	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);
	
	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);
	
	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});
	
	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});
	
	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(41)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(34)('meta')
	  , isObject = __webpack_require__(44)
	  , has      = __webpack_require__(23)
	  , setDesc  = __webpack_require__(42).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(47)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(33)
	  , core           = __webpack_require__(38)
	  , LIBRARY        = __webpack_require__(65)
	  , wksExt         = __webpack_require__(79)
	  , defineProperty = __webpack_require__(42).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(21)
	  , toIObject = __webpack_require__(24);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(21)
	  , gOPS    = __webpack_require__(87)
	  , pIE     = __webpack_require__(88);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 87 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 88 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(26);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(24)
	  , gOPN      = __webpack_require__(91).f
	  , toString  = {}.toString;
	
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};
	
	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(22)
	  , hiddenKeys = __webpack_require__(35).concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(88)
	  , createDesc     = __webpack_require__(50)
	  , toIObject      = __webpack_require__(24)
	  , toPrimitive    = __webpack_require__(49)
	  , has            = __webpack_require__(23)
	  , IE8_DOM_DEFINE = __webpack_require__(45)
	  , gOPD           = Object.getOwnPropertyDescriptor;
	
	exports.f = __webpack_require__(46) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 93 */
/***/ function(module, exports) {



/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(84)('asyncIterator');

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(84)('observable');

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof2 = __webpack_require__(59);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _keys = __webpack_require__(16);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	exports.default = function (data) {
	    var move = {},
	        uIdGen = -1,
	        nodes = data,
	        rToShrink = 2,
	        bounds = [[0, 0], [600, 800]],
	        boundary = null,
	        isAABBBoundary = false,
	        isBoundaryGroup = false,
	        boundaryGroupKeys = [],
	        worldWidth = void 0,
	        worldHeight = void 0,
	        timeFrame = 0.05,
	        //s
	    stepNumPerFrame = 2,
	        timeScale = 10,
	        isDirectionGravity = null,
	        gravity = null,
	        friction = null,
	        canBeFinished = false,
	        firstPassNodes = [],
	        eventHandler = {
	        'tick': function tick() {},
	        'sed': function sed() {},
	        'end': function end() {}
	    },
	        raf = void 0,
	        hack = {};
	    function multiVec2(x1, y1, x2, y2) {
	        return x1 * x2 + y1 * y2;
	    }
	
	    function subVec2(x1, y1, x2, y2) {
	        return { x: x2 - x1, y: y2 - y1 };
	    }
	
	    function absVec2(x, y) {
	        return x * x + y * y;
	    }
	
	    function doSomething(node, node2, preserveImpulse) {
	        var x = node2.x - node.x;
	        var l = x * x;
	        var r = node.r + node2.r;
	        r *= r;
	        if (l > r) return;
	
	        var y = node2.y - node.y;
	        l += y * y;
	
	        if (l <= r) {
	            var d = Math.sqrt(l);
	            r = node.r + node2.r;
	
	            if (preserveImpulse) {
	                var v1x = node.x - node.px;
	                var v1y = node.y - node.py;
	                var v2x = node2.x - node2.px;
	                var v2y = node2.y - node2.py;
	            }
	
	            var penetration = d != 0 ? d - r : node.r; //d != 0 ? (d - r) : node.r;
	            var slop = penetration / d - 0.01;
	            slop = slop < 0 ? slop : 0;
	            var penetrationFactor = slop * 0.5 * 0.2; //20 percent;
	            var cx = penetrationFactor * x;
	            var cy = penetrationFactor * y;
	
	            //Need to update Collision Cells here
	            node.x = node.active ? node.x + cx : node.x;
	            node.y = node.active ? node.y + cy : node.y + cy;
	            node2.x = node2.active ? node2.x - cx : node2.x;
	            node2.y = node2.active ? node2.y - cy : node2.y - cy;
	
	            if (preserveImpulse) {
	
	                // Calculate relative velocity in terms of the normal direction
	                var velAlongNormal = x * (v2x - v1x) + y * (v2y - v1y);
	
	                if (velAlongNormal < 0) {
	                    //maybe greater than 0                         
	                    // Calculate restitution
	                    var jj = (1 + (node.restitution + node2.restitution) * 0.5) * velAlongNormal * 0.5 / l;
	                    v1x += jj * x;
	                    v1y += jj * y;
	                    v2x -= jj * x;
	                    v2y -= jj * y;
	
	                    node.px = node.active ? node.x - v1x : node.x;
	                    node.py = node.active ? node.y - v1y : node.y - v1y;
	                    node2.px = node2.active ? node2.x - v2x : node2.x;
	                    node2.py = node2.active ? node2.y - v2y : node2.y - v2y;
	                } //whether is true collide
	            } //whether is preserveImpulse
	        } // whether two ball is engae
	    }
	
	    function ResolveCollide(preserveImpulse) {
	        var node1 = void 0,
	            node2 = void 0;
	        for (var i = 0, len = nodes.length; i < len; ++i) {
	            node1 = nodes[i];
	            if (node1.fixed) continue;
	            for (var j = i + 1; j < len; ++j) {
	                node2 = nodes[j];
	                if (node1 !== node2 && node2.boundary === node1.boundary) {
	                    doSomething(node1, node2, preserveImpulse);
	                }
	            } //for-loop of node2
	        } //for-loop of node1
	    }
	
	    function AABBBorder_collide(node) {
	        if (node.fixed) return;
	        //Detect collision of world        
	        var radius = node.r,
	            x = node.x,
	            y = node.y,
	            isFirstPass = node.firstPass;
	
	        //detect boundary
	        var localBoundary = isBoundaryGroup && boundary[node.boundary].values;
	
	        if (x < bounds[0][0] + radius) {
	            node.x = bounds[0][0] + radius;
	        } else if (x > bounds[1][0] - radius) {
	            node.x = bounds[1][0] - radius;
	        } else if (x < localBoundary[0][0] + radius) {
	            node.x = localBoundary[0][0] + radius;
	        } else if (x > localBoundary[1][0] - radius) {
	            node.x = localBoundary[1][0] - radius;
	        }
	
	        if (y < bounds[0][1] + radius) {
	            node.y = bounds[0][1] + radius;
	        } else if (y > bounds[1][1] - radius) {
	            node.y = bounds[1][1] - radius;
	        } else if (isDirectionGravity.y >= 0) {
	            if (y > localBoundary[1][1] - radius) {
	                node.y = localBoundary[1][1] - radius;
	            } else if (y < localBoundary[0][1] + radius && isFirstPass) {
	                node.y = localBoundary[0][1] + radius;
	            } else if (y > localBoundary[0][1] + radius && !isFirstPass) {
	                node.firstPass = true;
	            }
	        } else if (isDirectionGravity.y < 0) {
	            if (y < localBoundary[0][1] + radius) {
	                node.y = localBoundary[0][1] + radius;
	            } else if (y > localBoundary[1][1] - radius && isFirstPass) {
	                node.y = localBoundary[1][1] - radius;
	            } else if (y < localBoundary[1][1] - radius && !isFirstPass) {
	                node.firstPass = true;
	            }
	        }
	    }
	
	    function AABBBorder_collide_preserve_impulse(node) {
	        if (node.fixed) return;
	        var radius = node.r,
	            x = node.x,
	            y = node.y;
	        var restitution = node.restitution;
	        var vx = (node.px - node.x) * restitution,
	            vy = (node.py - node.y) * restitution,
	            isFirstPass = node.firstPass;
	
	        //detect boundary
	        var localBoundary = isBoundaryGroup && boundary[node.boundary].values;
	
	        if (x < bounds[0][0] + radius) {
	            node.x = bounds[0][0] + radius;
	            node.px = node.active ? node.x - vx : node.x;
	        } else if (x > bounds[1][0] - radius) {
	            node.x = bounds[1][0] - radius;
	            node.px = node.active ? node.x - vx : node.x;
	        } else if (x < localBoundary[0][0] + radius) {
	            node.x = localBoundary[0][0] + radius;
	            node.px = node.active ? node.x - vx : node.x;
	        } else if (x > localBoundary[1][0] - radius) {
	            node.x = localBoundary[1][0] - radius;
	            node.px = node.active ? node.x - vx : node.x;
	        }
	
	        if (y < bounds[0][1] + radius) {
	            node.y = bounds[0][1] + radius;
	            node.py = node.active ? node.y - vy : node.y;
	        } else if (y > bounds[1][1] - radius) {
	            node.y = bounds[1][1] - radius;
	            node.py = node.active ? node.y - vy : node.y;
	        } else if (isDirectionGravity.y >= 0) {
	            if (y > localBoundary[1][1] - radius) {
	                node.y = localBoundary[1][1] - radius;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y < localBoundary[0][1] + radius && isFirstPass) {
	                node.y = localBoundary[0][1] + radius;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y > localBoundary[0][1] + radius && !isFirstPass) {
	                node.firstPass = true;
	            }
	        } else if (isDirectionGravity.y < 0) {
	            if (y < localBoundary[0][1] + radius) {
	                node.y = localBoundary[0][1] + radius;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y > localBoundary[1][1] - radius && isFirstPass) {
	                node.y = localBoundary[1][1] - radius;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y < localBoundary[1][1] - radius && !isFirstPass) {
	                node.firstPass = true;
	            }
	        }
	    }
	
	    function Border_collide(node) {
	        if (node.fixed) return;
	        //Detect collision of world        
	        var radius = node.r,
	            x = node.x,
	            y = node.y,
	            isFirstPass = node.firstPass,
	            trriglePassEvent = false;
	        ;
	
	        //detect boundary
	
	        var boundaryKeys = isBoundaryGroup && (0, _keys2.default)(boundary);
	        var lastBoundaryKey = isBoundaryGroup && boundaryKeys[boundaryKeys.indexOf(node.boundary) - 1];
	        var localUperBoundary = isBoundaryGroup && boundary[lastBoundaryKey] && boundary[lastBoundaryKey].values;
	        var localLowerBoundary = isBoundaryGroup && boundary[node.boundary].values;
	        var upperY = localUperBoundary ? localUperBoundary[Math.round(node.x)] + radius : bounds[0][1];
	        var lowerY = localLowerBoundary ? localLowerBoundary[Math.round(node.x)] - radius : bounds[1][1];
	        if (!isBoundaryGroup) upperY = bounds[1][1] * 0.85;
	
	        if (x < bounds[0][0] + radius) {
	            node.x = bounds[0][0] + radius;
	        } else if (x > bounds[1][0] - radius) {
	            node.x = bounds[1][0] - radius;
	        }
	
	        if (y < bounds[0][1] + radius) {
	            node.y = bounds[0][1] + radius;
	        } else if (y > bounds[1][1] - radius) {
	            node.y = bounds[1][1] - radius;
	        } else if (isDirectionGravity.y >= 0) {
	            if (y > lowerY) {
	                node.y = lowerY;
	            } else if (y < upperY && isFirstPass) {
	                node.y = upperY;
	                node.py = node.y - radius;
	            } else if (y + radius > upperY - radius && !isFirstPass) {
	                node.firstPass = true;
	                trriglePassEvent = true;
	            }
	        } else if (isDirectionGravity.y < 0) {
	            if (y < upperY) {
	                node.y = upperY;
	            } else if (y > lowerY && isFirstPass) {
	                node.y = lowerY;
	                node.py = node.y + radius;
	            } else if (y - radius < lowerY + radius && !isFirstPass) {
	                node.firstPass = true;
	                trriglePassEvent = true;
	            }
	        }
	
	        return trriglePassEvent;
	    }
	
	    function Border_collide_preserve_impulse(node) {
	        if (node.fixed) return;
	        var radius = node.r,
	            x = node.x,
	            y = node.y;
	        var restitution = node.restitution;
	        var vx = (node.px - node.x) * restitution,
	            vy = (node.py - node.y) * restitution,
	            isFirstPass = node.firstPass,
	            trriglePassEvent = false;
	
	        //detect boundary
	        var boundaryKeys = isBoundaryGroup && (0, _keys2.default)(boundary);
	        var lastBoundaryKey = isBoundaryGroup && boundaryKeys[boundaryKeys.indexOf(node.boundary) - 1];
	        var localUperBoundary = isBoundaryGroup && boundary[lastBoundaryKey] && boundary[lastBoundaryKey].values;
	        var localLowerBoundary = isBoundaryGroup && boundary[node.boundary].values;
	        var upperY = localUperBoundary ? localUperBoundary[Math.round(node.x)] + radius : bounds[0][1];
	        var lowerY = localLowerBoundary ? localLowerBoundary[Math.round(node.x)] - radius : bounds[1][1];
	        if (!isBoundaryGroup) upperY = bounds[1][1] * 0.85;
	
	        if (x < bounds[0][0] + radius) {
	            node.x = bounds[0][0] + radius;
	            node.px = node.active ? node.x - vx : node.x;
	        } else if (x > bounds[1][0] - radius) {
	            node.x = bounds[1][0] - radius;
	            node.px = node.active ? node.x - vx : node.x;
	        }
	
	        if (y < bounds[0][1] + radius) {
	            node.y = bounds[0][1] + radius;
	            node.py = node.active ? node.y - vy : node.y;
	        } else if (y > bounds[1][1] - radius) {
	            node.y = bounds[1][1] - radius;
	            node.py = node.active ? node.y - vy : node.y;
	        } else if (isDirectionGravity.y >= 0) {
	            if (y > lowerY) {
	                node.y = lowerY;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y < upperY && isFirstPass) {
	                node.y = upperY;
	                node.py = node.y - radius;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y + radius > upperY - radius && !isFirstPass) {
	                node.firstPass = true;
	                trriglePassEvent = true;
	            }
	        } else if (isDirectionGravity.y < 0) {
	            if (y < upperY) {
	                node.y = upperY;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y > lowerY && isFirstPass) {
	                node.y = lowerY;
	                node.py = node.y + radius;
	                node.px = node.active ? node.x - vx : node.x;
	            } else if (y - radius < lowerY + radius && !isFirstPass) {
	                node.firstPass = true;
	                trriglePassEvent = true;
	            }
	        }
	
	        return trriglePassEvent;
	    }
	
	    move.start = function () {
	        worldWidth = bounds[1][0] - bounds[0][0];
	        worldHeight = bounds[1][1] - bounds[0][1];
	        firstPassNodes = [];
	        canBeFinished = false;
	        //init envoriment
	        if (!friction) friction = { x: 0.1, y: 0.1 };
	        if (!gravity) {
	            gravity = { x: 0, y: Infinity, magnitude: 9.8 };
	            isDirectionGravity = {
	                x: 0,
	                y: 9.8
	            };
	        }
	
	        var nodesNum = nodes.length,
	            i = -1,
	            node = void 0,
	
	        //this is hack-code
	        gDirection = isDirectionGravity.y < 0 ? 0.1 : 0.8;
	
	        while (++i < nodesNum) {
	            node = nodes[i];
	            if (!node.iid) node.iid = ++uIdGen;
	            if (!node.r) node.r = 10;
	            if (!node.x) node.x = Math.random() * worldWidth * 0.9 + node.r;
	            if (!node.y) node.y = worldHeight * gDirection + node.r;
	            if (!node.px) node.px = node.x + 0.0;
	            if (!node.py) node.py = node.y;
	            if (!node.restitution) node.restitution = 0.1;
	            if (!node.boundary) node.boundary = 0;
	            if (!node.timeToShrink) node.timeToShrink = 3; //ms
	            if (!node.firstPass) node.firstPass = false;
	
	            //for sedimentation
	            if (!('active' in node)) node.active = true;
	            if (!('fixed' in node)) node.fixed = false;
	        }
	
	        //hack CONST letriable
	        hack.timeFrameDeltaSquare = timeFrame * timeFrame * timeScale * timeScale / (stepNumPerFrame * stepNumPerFrame);
	        //stop it if has already been started
	        if (raf) clearInterval(raf);
	        //start the layout
	        raf = setInterval(move.tick.bind(this), timeFrame * 1000);
	    };
	
	    move.addNode = function (node) {
	        worldWidth = bounds[1][0] - bounds[0][0];
	        worldHeight = bounds[1][1] - bounds[0][1];
	        //this is hack-code
	        var gDirection = isDirectionGravity.y > 0 ? 0.1 : 0.8;
	
	        if (!node.iid) node.iid = ++uIdGen;
	        if (!node.r) node.r = 10;
	        if (!node.x) node.x = Math.random() * worldWidth * 0.9 + node.r;
	        if (!node.y) node.y = worldHeight * gDirection + node.r;
	        if (!node.px) node.px = node.x + 0.0;
	        if (!node.py) node.py = node.y;
	        if (!node.restitution) node.restitution = 0.1;
	        if (!node.boundary) node.boundary = 0;
	        if (!node.timeToShrink) node.timeToShrink = 3; //ms
	        if (!node.firstPass) node.firstPass = false;
	
	        //for sedimentation
	        if (!('active' in node)) node.active = true;
	        if (!('fixed' in node)) node.fixed = false;
	
	        //Push to nodes
	        nodes.push(node);
	        //stop it if has already been started
	        if (raf) clearInterval(raf);
	        //start the layout
	        raf = setInterval(move.tick.bind(this), timeFrame * 1000);
	    };
	
	    // hack for vis
	    move.addNodes = function (data) {
	        var once = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	
	        worldWidth = bounds[1][0] - bounds[0][0];
	        worldHeight = bounds[1][1] - bounds[0][1];
	        //this is hack-code
	        var gDirection = isDirectionGravity.y > 0 ? 0.1 : 0.8;
	
	        var nodesNum = data.length,
	            i = -1,
	            node = void 0;
	        while (++i < nodesNum) {
	            node = data[i];
	            if (!node.iid) node.iid = ++uIdGen;
	            if (!node.r) node.r = 10;
	            if (!node.x) node.x = worldWidth * 0.5;
	            if (!node.y) node.y = worldHeight * gDirection + node.r;
	            if (!node.px) node.px = node.x + 0.0;
	            if (!node.py) node.py = node.y;
	            if (!node.restitution) node.restitution = 0.1;
	            if (!node.boundary) node.boundary = 0;
	            if (!node.timeToShrink) node.timeToShrink = 3; //ms
	            if (!node.firstPass) node.firstPass = false;
	
	            //for sedimentation
	            if (!('active' in node)) node.active = true;
	            if (!('fixed' in node)) node.fixed = false;
	
	            //Push to nodes
	            nodes.push(node);
	        }
	
	        //stop it if has already been started
	        if (raf) clearInterval(raf);
	        if (once) {
	            setTimeout(move.tick.bind(this), timeFrame * 1000);
	        } else {
	            //start the layout
	            move.tick.call(this);
	            raf = setInterval(move.tick.bind(this), timeFrame * 1000);
	        }
	    };
	
	    move.pause = function () {
	        if (raf) clearInterval(raf);
	    };
	    move.resume = function () {
	        if (raf) clearInterval(raf);
	        move.tick.call(this);
	        raf = setInterval(move.tick.bind(this), timeFrame * 1000);
	    };
	
	    move.tick = function () {
	        //let start = Date.now();
	        var nodesNum = nodes.length,
	            i = -1,
	            a = void 0,
	            //accelerate
	        gravityAngle = void 0,
	            gx = void 0,
	            gy = void 0,
	            node = void 0,
	            tx = void 0,
	            ty = void 0,
	            timeFrameDeltaSquare = hack.timeFrameDeltaSquare;
	
	        for (var j = 0; j < stepNumPerFrame; ++j) {
	            //Verlet
	            i = -1;
	            while (++i < nodesNum) {
	                node = nodes[i];
	                if (node && !node.fixed) {
	                    //Accumulate Forces
	                    if (isDirectionGravity) {
	                        gx = isDirectionGravity.x;
	                        gy = isDirectionGravity.y;
	                    } else {
	                        gravityAngle = Math.atan2(gravity.y - node.y, gravity.x - node.x);
	                        gx = gravity.magnitude * Math.cos(gravityAngle);
	                        gy = gravity.magnitude * Math.sin(gravityAngle);
	                    }
	
	                    a = { x: gx + friction.x * (node.px - node.x), y: gy + friction.y * (node.py - node.y) };
	
	                    //accelerate
	                    node.x += a.x * timeFrameDeltaSquare;
	                    node.y += a.y * timeFrameDeltaSquare;
	                }
	            }
	
	            //collide here
	            ResolveCollide(false);
	
	            i = -1;
	            while (++i < nodesNum) {
	                node = nodes[i];
	                if (node && !node.fixed) {
	                    //border_collide here
	                    if (isAABBBoundary ? AABBBorder_collide(node) : Border_collide(node)) {
	                        firstPassNodes.push(node);
	                        node.r *= 0.8;
	                    }
	
	                    //inertia
	                    tx = node.x * 2 - node.px;
	                    node.px = node.x;
	                    node.x = tx;
	
	                    ty = node.y * 2 - node.py;
	                    node.py = node.y;
	                    node.y = ty;
	                }
	            }
	
	            //collide here again with preserve impulse
	            ResolveCollide(true);
	
	            //SatisfyConstraints
	            i = -1;
	            while (++i < nodesNum) {
	                node = nodes[i];
	                if (node.fixed) continue;
	
	                if (isAABBBoundary ? AABBBorder_collide_preserve_impulse(node) : Border_collide_preserve_impulse(node)) {
	                    firstPassNodes.push(node);
	                    node.r *= 0.8;
	                }
	            }
	        }
	
	        i = nodesNum;
	        var isSeded = false;
	        var sedLayers = {};
	        var fixedCount = 0;
	        var unFixedNodes = [];
	        while (--i >= 0) {
	            node = nodes[i];
	            if (!node.fixed && node.firstPass) {
	                //delete !node.active here
	                node.timeToShrink -= timeFrame;
	                if (node.timeToShrink < 0) {
	                    node.timeToShrink = 1.5; //s
	                    node.r *= 0.7;
	                    if (node.r < rToShrink) {
	                        isSeded = true;
	                        if (!(node.boundary in sedLayers)) {
	                            sedLayers[node.boundary] = true;
	                        }
	                        node.fixed = true;
	                    }
	                    node.active = true;
	                }
	            }
	
	            if (node.fixed) {
	                ++fixedCount;
	            } else {
	                unFixedNodes.push(node);
	            }
	        }
	
	        if (isSeded) {
	            eventHandler['sed'].apply(this, [{ 'type': 'sed', sedLayers: (0, _keys2.default)(sedLayers), firstPassNodes: firstPassNodes }]);
	            firstPassNodes = [];
	        }
	
	        if (fixedCount / nodes.length > 0.98) {
	            move.finish(unFixedNodes);
	        }
	
	        eventHandler['tick'].apply(this, [{ 'type': 'tick', balls: nodes, bounds: bounds, gy: isDirectionGravity.y }]);
	    };
	
	    move.canBeFinished = function (t) {
	        if (typeof t === "boolean") {
	            canBeFinished = t;
	        }
	        return move;
	    };
	    move.finish = function (unFixedNodes) {
	        var _this = this;
	
	        if (!canBeFinished) return;
	        console.log("finish");
	        if (raf) clearInterval(raf);
	        var i = -1,
	            tick = 0;
	        var timer = setInterval(function () {
	            while (++i < unFixedNodes.length) {
	                unFixedNodes[i].r *= 0.8;
	            }
	            eventHandler['tick'].apply(_this, [{ 'type': 'tick', balls: unFixedNodes, bounds: bounds }]);
	            if (tick > 10) {
	                clearInterval(timer);
	                eventHandler['tick'].apply(_this, [{ 'type': 'tick', balls: [], bounds: bounds }]);
	                eventHandler['end'].apply(_this, [{ 'type': 'end' }]);
	                firstPassNodes = [];
	            }
	            ++tick;
	        }, 30);
	    };
	
	    move.on = function (event, callback) {
	        if (!arguments.length) return eventHandler;
	        if (arguments.length === 1) return eventHandler[event];
	        if (arguments.length === 2) {
	            eventHandler[event] = callback;
	        }
	        return move;
	    };
	
	    move.isAABBBoundary = function (x) {
	        if (!arguments.length) return isAABBBoundary;
	        isAABBBoundary = x;
	        return move;
	    };
	
	    move.bounds = function (x) {
	        if (!arguments.length) return bounds;
	        bounds = x;
	        return move;
	    };
	
	    move.friction = function (params) {
	        if (!arguments.length) return friction;
	        var type = typeof params === 'undefined' ? 'undefined' : (0, _typeof3.default)(params);
	        switch (type) {
	            case 'object':
	                {
	                    if (Array.isArray(params)) {
	                        if (params.length === 2) {
	                            friction = { x: params[0], y: params[1] };
	                        } else if (params.length === 1) {
	                            friction = { x: params[0], y: params[0] };
	                        }
	                    } else {
	                        friction = { x: params.x, y: params.y };
	                    }
	                    break;
	                }
	            case 'number':
	                {
	                    friction = { x: params, y: params };
	                    break;
	                }
	        }
	        return move;
	    };
	
	    move.gravity = function (params) {
	        if (!arguments.length) return friction;
	        var type = typeof params === 'undefined' ? 'undefined' : (0, _typeof3.default)(params);
	        switch (type) {
	            case 'object':
	                {
	                    if (Array.isArray(params)) {
	                        gravity = { x: params[0], y: params[1], magnitude: params[2] };
	                        if (isNaN(+params[0] * +params[1])) {
	                            isDirectionGravity = {
	                                x: params[0] == 0 ? 0 : params[0] > 0 ? params[2] : -params[2],
	                                y: params[1] == 0 ? 0 : params[1] > 0 ? params[2] : -params[2]
	                            };
	                        } else isDirectionGravity = null;
	                    } else {
	                        gravity = { x: params.x, y: params.y, magnitude: params.magnitude };
	                        if (isNaN(+params.x * +params.y)) {
	                            isDirectionGravity = {
	                                x: params.x == 0 ? 0 : params.x > 0 ? params.magnitude : -params.magnitude,
	                                y: params.y == 0 ? 0 : params.y > 0 ? params.magnitude : -params.magnitude
	                            };
	                        } else isDirectionGravity = null;
	                    }
	                    break;
	                }
	            case 'number':
	                {
	                    gravity = { x: 0, y: Infinity, magnitude: params };
	                    isDirectionGravity = {
	                        x: 0,
	                        y: params
	                    };
	                    break;
	                }
	        }
	        return move;
	    };
	
	    move.boundary = function (params) {
	        if (!arguments.length) return boundary;
	        var type = typeof params === 'undefined' ? 'undefined' : (0, _typeof3.default)(params);
	        switch (type) {
	            case 'object':
	                {
	                    if (Array.isArray(params)) {
	                        isBoundaryGroup = false;
	                    } else {
	                        boundaryGroupKeys = (0, _keys2.default)(params);
	                        isBoundaryGroup = true;
	                    }
	                    boundary = params;
	                }
	                break;
	            default:
	                break;
	        }
	        return move;
	    };
	
	    move.remove = function () {
	        if (raf) clearInterval(raf);
	        move = null;
	    };
	
	    return move;
	};
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 97 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"bubble-float\"></div>\n";

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _classCallCheck2 = __webpack_require__(99);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(100);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _d = __webpack_require__(51);
	
	var _d2 = _interopRequireDefault(_d);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var TWOPI = Math.PI * 2;
	var BASECIRCLERADIUS = 35;
	var TIMELINEUIDGEN = -1;
	
	var _class = function () {
	
	    /**
	     * @param  {d3-selection} backCanvas
	     * @param  {d3-selection} frontCanvas
	     * @param  {number} timeLineHeight
	     */
	    function _class(backCanvas, frontCanvas, timeLineHeight) {
	        (0, _classCallCheck3.default)(this, _class);
	
	        // init variables      
	        this.backCanvas = backCanvas;
	        this.frontCanvas = frontCanvas;
	        this.width = +this.backCanvas.attr("width");
	        this.height = +this.backCanvas.attr("height");
	        this.center = [this.width * 0.5, this.helght * 0.5];
	        this.timeLineHeight = timeLineHeight;
	        this.halfTimeLineHeight = timeLineHeight * 0.5;
	
	        // default value for variables;
	        this.frontContext = this.frontCanvas.node().getContext("2d");
	        this.backContext = this.backCanvas.node().getContext("2d");
	        this.timeFormat = _d2.default.time.format("%b.%d,%H");
	        //this.dotsNum = 10;
	        //this.dotPadding = 10;
	        this.skewLinePerDot = 20;
	        //this.skewLineNum = this.dotsNum * this.skewLinePerDot;
	        //this.skewLinePadding = 1;
	        this.circleRadius = BASECIRCLERADIUS;
	        this.dotRadius = 2;
	        this.distToSplit = 30;
	        this.dropBalls = true;
	
	        // private variables
	        this._id = ++TIMELINEUIDGEN;
	        this._timeLineData = null;
	
	        this.testTick = 0;
	    }
	    /**
	     * @param  {Function} drawFunc
	     * @param  {Array<any>} parameters
	     * @param  {number} x=undefined
	     * @param  {number} y=undefined
	     * @param  {number} scale=undefined
	     */
	
	
	    (0, _createClass3.default)(_class, [{
	        key: "DrawUsingCustom",
	        value: function DrawUsingCustom(drawFunc, parameters) {
	            var x = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
	            var y = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
	            var scale = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
	
	
	            this.backContext.clearRect(0, 0, this.width, this.height);
	            this.frontContext.clearRect(0, 0, this.width, this.height);
	
	            var transform = _d2.default.transform(this.backCanvas.attr("transform"));
	            var tx = typeof x === "number" ? x : 0;
	            var ty = typeof y === "number" ? y : 0;
	            var ts = typeof scale === "number" ? scale : 1;
	
	            this.backContext.save();
	            this.backContext.translate(tx + transform.translate[0], ty + transform.translate[1]);
	            this.backContext.scale(ts * transform.scale[0], ts * transform.scale[1]);
	
	            this.frontContext.save();
	            this.frontContext.translate(tx + transform.translate[0], ty + transform.translate[1]);
	            this.frontContext.scale(ts * transform.scale[0], ts * transform.scale[1]);
	
	            var splitResult = drawFunc.apply(this, parameters);
	
	            this.backContext.restore();
	            this.frontContext.restore();
	
	            return splitResult;
	        }
	
	        /**
	         * @param  {Array<number>} dotsXPosition
	         * @param  {Array<number>} dotsYPosition
	         * @param  {number} id
	         */
	
	    }, {
	        key: "DrawTimeLine",
	        value: function DrawTimeLine(dotsXPosition, circlesData) {
	            var xOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	            var yOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
	            var splitBalls = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
	
	            var drawer = function drawer(dotsXPosition, circlesData, xOffset, yOffset, splitBalls) {
	                if (!dotsXPosition || !Array.isArray(dotsXPosition)) return;
	
	                var timeLineData = this._timeLineData || {};
	
	                var dotsNum = dotsXPosition.length;
	                var dotPadding = (dotsXPosition[dotsXPosition.length - 1] - dotsXPosition[0]) / (dotsNum - 1);
	                var skewLineNum = dotsNum * this.skewLinePerDot;
	                var skewLinePadding = dotPadding / this.skewLinePerDot;
	
	                this.AtomDrawSkewLines(dotsXPosition, skewLineNum, skewLinePadding, xOffset);
	                this.AtomDrawLinks(dotsXPosition);
	                var resultObj = this.AtomDrawCircles(circlesData, xOffset, yOffset, splitBalls);
	                var lineWidth = resultObj.circleLineWidth;
	
	                var maxHeight = _d2.default.max(circlesData),
	                    maxWidth = _d2.default.max(dotsXPosition);
	
	                timeLineData.x = 0;
	                timeLineData.y = this.halfTimeLineHeight - this.circleRadius - lineWidth;
	                timeLineData.width = this.width + lineWidth * 2 + maxWidth;
	                timeLineData.height = (this.circleRadius + lineWidth) * 2 + maxHeight;
	                timeLineData.dotsXPosition = dotsXPosition;
	                timeLineData.dotsYPosition = circlesData;
	                this._timeLineData = timeLineData;
	
	                return resultObj.splitBallsFinished;
	            };
	
	            var newDrawer = function newDrawer(dotsXPosition, circlesData, xOffset, yOffset, splitBalls) {
	                if (!dotsXPosition || !Array.isArray(dotsXPosition)) return;
	                var timeLineData = this._timeLineData || {};
	
	                // link line
	                var end = dotsXPosition[dotsXPosition.length - 1];
	                this.backContext.lineWidth = 8;
	                this.backContext.strokeStyle = "rgb(73,75,87)";
	                this.backContext.lineWidth = 8;
	                this.backContext.beginPath();
	                this.backContext.moveTo(0, this.halfTimeLineHeight);
	                this.backContext.lineTo(end, this.halfTimeLineHeight);
	                this.backContext.stroke();
	
	                var resultObj = this.NewAtomDrawCircles(circlesData, xOffset, yOffset, splitBalls);
	                var lineWidth = resultObj.circleLineWidth;
	
	                var maxHeight = _d2.default.max(circlesData),
	                    maxWidth = _d2.default.max(dotsXPosition);
	
	                timeLineData.x = 0;
	                timeLineData.y = this.halfTimeLineHeight - this.circleRadius - lineWidth;
	                timeLineData.width = this.width + lineWidth * 2 + maxWidth;
	                timeLineData.height = (this.circleRadius + lineWidth) * 2 + maxHeight;
	                timeLineData.dotsXPosition = dotsXPosition;
	                timeLineData.dotsYPosition = circlesData;
	                this._timeLineData = timeLineData;
	
	                return resultObj.splitBallsFinished;
	            };
	
	            return this.DrawUsingCustom(newDrawer, [dotsXPosition, circlesData, xOffset, yOffset, splitBalls]);
	            //return this.DrawUsingCustom(drawer, [dotsXPosition, circlesData, xOffset, yOffset, splitBalls]);
	        }
	    }, {
	        key: "setDistToSplit",
	        value: function setDistToSplit(d) {
	            if (typeof d === "number") {
	                this.distToSplit = d;
	            }
	            return this;
	        }
	    }, {
	        key: "setDropBalls",
	        value: function setDropBalls(t) {
	            if (typeof t === "boolean") {
	                this.dropBalls = t;
	            }
	
	            return this;
	        }
	    }, {
	        key: "NewAtomDrawCircles",
	        value: function NewAtomDrawCircles(circlesData) {
	            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	            var splitBalls = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
	
	            // Circle
	            var circleLineWidth = 5;
	            var circleNum = circlesData.length;
	            this.frontContext.lineWidth = 5;
	            this.frontContext.strokeStyle = "rgb(73,75,87)";
	            this.frontContext.fillStyle = "rgb(204,110,76)"; //"rgb(233, 30, 99)";//"rgb(199,166,63)";
	            this.frontContext.beginPath();
	
	            for (var i = 0; i < circleNum; ++i) {
	                if (this.dropBalls && !circlesData[i].firstDrop) continue;
	                this.frontContext.moveTo(circlesData[i].x + this.circleRadius - (Array.isArray(xOffset) ? xOffset[i] : xOffset), this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset));
	                this.frontContext.arc(circlesData[i].x - (Array.isArray(xOffset) ? xOffset[i] : xOffset), this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset), this.circleRadius, 0, TWOPI);
	            }
	            this.frontContext.fill();
	            this.frontContext.stroke();
	
	            //text
	            this.frontContext.fillStyle = "#fff"; //"rgb(73,75,87)";
	            this.frontContext.font = "25px Segoe UI Light"; //"28px Arial Black";
	            this.frontContext.textBaseline = "middle";
	            this.frontContext.textAlign = "center";
	            this.frontContext.beginPath();
	            for (var _i = 0; _i < circleNum; ++_i) {
	                if (this.dropBalls && !circlesData[_i].firstDrop) continue;
	                this.frontContext.fillText(this.timeFormat(new Date(circlesData[_i].ts)), circlesData[_i].x - (Array.isArray(xOffset) ? xOffset[_i] : xOffset), this.halfTimeLineHeight + circlesData[_i].y + (Array.isArray(yOffset) ? yOffset[_i] : yOffset));
	            }
	            this.frontContext.fill();
	
	            var splitBallsFinished = false;
	            if (splitBalls) {
	
	                var dist = 0;
	                for (var _i2 = 0, len = splitBalls.length; _i2 < len; ++_i2) {
	                    var ball = splitBalls[_i2];
	                    this.frontContext.fillStyle = ball.color;
	                    this.frontContext.beginPath();
	                    this.frontContext.moveTo(ball.x + ball.r, this.halfTimeLineHeight + ball.y);
	                    this.frontContext.arc(ball.x, this.halfTimeLineHeight + ball.y, ball.r, 0, TWOPI);
	
	                    var tx = ball.x + (ball.x - ball.px) * 0.9;
	                    ball.px = ball.x;
	                    ball.x = tx;
	                    dist += Math.abs(ball.px - ball.x);
	
	                    var ty = ball.y + (ball.y - ball.py) * 0.9;
	                    ball.py = ball.y;
	                    ball.y = ty;
	                    this.frontContext.fill();
	                }
	                this.testTick++;
	                if (dist < 1 * splitBalls.length) {
	                    splitBallsFinished = true;
	                    console.log("tick time:" + this.testTick);
	                    this.testTick = 0;
	                }
	            }
	
	            return { 'circleLineWidth': circleLineWidth, 'splitBallsFinished': splitBallsFinished };
	        }
	
	        /**
	         * @param  {Array<number>} dotsXPosition
	         * @returns {(t)=>void} callBack function for d3-tween
	         */
	
	    }, {
	        key: "AnimationInitTimeLine",
	        value: function AnimationInitTimeLine(dotsXPosition) {
	            var dotsNum = dotsXPosition.length;
	            var dotPadding = (dotsXPosition[dotsXPosition.length - 1].x - dotsXPosition[0].x) / (dotsNum - 1);
	            var dotDelay = 1 / dotsNum;
	
	            var skewLineNum = dotsNum * this.skewLinePerDot;
	            var skewLinePadding = dotPadding / this.skewLinePerDot;
	            var skewLineDelay = 1 / skewLineNum;
	
	            var start = dotsXPosition[0].x;
	            var end = dotsXPosition[dotsXPosition.length - 1].x;
	            var i = 0,
	                j = 0;
	
	            var transform = _d2.default.transform(this.backCanvas.attr("transform"));
	
	            var newCallBack = function newCallBack(t) {
	                this.backContext.save();
	                this.frontContext.save();
	                this.backContext.translate(transform.translate[0], transform.translate[1]);
	                this.frontContext.translate(transform.translate[0], transform.translate[1]);
	
	                //circle
	                while (t > j * dotDelay) {
	                    if (dotsXPosition[j].empty) {
	                        ++j;
	                        continue;
	                    }
	
	                    this.frontContext.lineWidth = 5;
	                    this.frontContext.strokeStyle = "rgb(73,75,87)";
	                    this.frontContext.fillStyle = "rgb(204,110,76)"; //"rgb(233, 30, 99)";//"rgb(199,166,63)";
	                    this.frontContext.beginPath();
	                    this.frontContext.moveTo(dotsXPosition[j].x + this.circleRadius, this.halfTimeLineHeight);
	                    this.frontContext.arc(dotsXPosition[j].x, this.halfTimeLineHeight, this.circleRadius, 0, TWOPI);
	                    this.frontContext.fill();
	                    this.frontContext.stroke();
	
	                    //text
	                    this.frontContext.fillStyle = "#fff"; //"rgb(73,75,87)";
	                    this.frontContext.font = "28px Segoe UI Light"; //"28px Arial Black";
	                    this.frontContext.textBaseline = "middle";
	                    this.frontContext.textAlign = "center";
	                    this.frontContext.beginPath();
	                    this.frontContext.fillText(this.timeFormat(dotsXPosition[j].ts), dotsXPosition[j].x, this.halfTimeLineHeight);
	                    this.frontContext.fill();
	                    ++j;
	                }
	
	                // link line
	                var tempEnd = this.width * t;
	                this.backContext.lineWidth = 8;
	                this.backContext.strokeStyle = "rgb(73,75,87)";
	                this.backContext.lineWidth = 8;
	                this.backContext.beginPath();
	                this.backContext.moveTo(0, this.halfTimeLineHeight);
	                this.backContext.lineTo(tempEnd, this.halfTimeLineHeight);
	                this.backContext.stroke();
	
	                this.backContext.restore();
	                this.frontContext.restore();
	            };
	
	            var callBack = function callBack(t) {
	                this.backContext.save();
	                this.frontContext.save();
	                this.backContext.translate(transform.translate[0], transform.translate[1]);
	                this.frontContext.translate(transform.translate[0], transform.translate[1]);
	
	                // skewLine
	                while (t > i * skewLineDelay) {
	                    this.backContext.strokeStyle = "#D90429";
	                    this.backContext.fillStyle = "#D90429";
	                    this.backContext.lineWidth = 0.5;
	
	                    var x = start + i * skewLinePadding;
	                    this.backContext.beginPath();
	
	                    this.backContext.moveTo(x + skewLinePadding, this.halfTimeLineHeight);
	                    this.backContext.lineTo(x, this.timeLineHeight);
	
	                    if ((i & 3) === 0) {
	                        this.backContext.moveTo(x + skewLinePadding, this.halfTimeLineHeight);
	                        this.backContext.arc(x + skewLinePadding, this.halfTimeLineHeight, this.dotRadius, 0, TWOPI);
	                    }
	
	                    this.backContext.fill();
	                    this.backContext.stroke();
	                    ++i;
	                }
	
	                // Circle
	                while (t > j * dotDelay) {
	                    if (dotsXPosition[j].empty) {
	                        ++j;
	                        continue;
	                    }
	
	                    this.frontContext.lineWidth = 5;
	                    this.frontContext.strokeStyle = "rgb(221, 196, 207)";
	                    this.frontContext.fillStyle = "rgb(233,243,246)";
	                    this.frontContext.beginPath();
	                    this.frontContext.moveTo(dotsXPosition[j].x + this.circleRadius, this.halfTimeLineHeight);
	                    this.frontContext.arc(dotsXPosition[j].x, this.halfTimeLineHeight, this.circleRadius, 0, TWOPI);
	                    this.frontContext.fill();
	                    this.frontContext.stroke();
	
	                    // text
	                    this.frontContext.fillStyle = "#D90429";
	                    this.frontContext.font = "28px Arial Black";
	                    this.frontContext.textBaseline = "middle";
	                    this.frontContext.textAlign = "center";
	                    this.frontContext.beginPath();
	                    this.frontContext.fillText(this.timeFormat(dotsXPosition[j].ts), dotsXPosition[j].x, this.halfTimeLineHeight);
	                    this.frontContext.fill();
	                    ++j;
	                }
	
	                var tempEnd = this.width * t;
	                // link
	                this.backContext.lineWidth = 1;
	                this.backContext.strokeStyle = "rgb(221, 196, 207)";
	                this.backContext.beginPath();
	                this.backContext.moveTo(0, 0);
	                this.backContext.lineTo(tempEnd, 0);
	                this.backContext.moveTo(0, this.timeLineHeight);
	                this.backContext.lineTo(tempEnd, this.timeLineHeight);
	                this.backContext.stroke();
	
	                this.backContext.restore();
	                this.frontContext.restore();
	            };
	
	            return newCallBack.bind(this);
	        }
	    }, {
	        key: "AnimationAggregateCircles",
	        value: function AnimationAggregateCircles(startCirclesData, endCirclesData, scale) {
	            var _this = this;
	
	            var transform = _d2.default.transform(this.backCanvas.attr("transform"));
	            var targetR = BASECIRCLERADIUS * scale;
	            var startGap = void 0,
	                endGap = void 0;
	            if (startCirclesData[1] && endCirclesData[1]) {
	                startGap = startCirclesData[1].ts - startCirclesData[0].ts;
	                endGap = endCirclesData[1].ts - endCirclesData[0].ts;
	            }
	
	            var sourceCirclesData = void 0,
	                targetCirclesData = void 0;
	            if (startGap > endGap) {
	                sourceCirclesData = endCirclesData;
	                targetCirclesData = startCirclesData;
	            } else {
	                sourceCirclesData = startCirclesData;
	                targetCirclesData = endCirclesData;
	            }
	            for (var i = 0, len = sourceCirclesData.length; i < len; ++i) {
	                var circle = sourceCirclesData[i];
	                var insideIndex = -1;
	                while (targetCirclesData[++insideIndex] && targetCirclesData[insideIndex].ts < circle.ts) {}
	                if (--insideIndex < 0) insideIndex = 0;
	
	                if (startGap > endGap) {
	                    circle.aggregate = {
	                        sx: targetCirclesData[insideIndex].x,
	                        ex: circle.x
	                    };
	                } else {
	                    circle.aggregate = {
	                        sx: circle.x,
	                        ex: targetCirclesData[insideIndex].x
	                    };
	                }
	            }
	
	            var newCallback = function newCallback(t) {
	                _this.frontContext.clearRect(0, _this.height * 0.2, _this.width, _this.height * 0.8);
	                _this.frontContext.save();
	                _this.frontContext.translate(transform.translate[0], transform.translate[1]);
	                _this.frontContext.scale(transform.scale[0], transform.scale[1]);
	
	                var circleLineWidth = 5;
	                var circleNum = sourceCirclesData.length;
	                _this.frontContext.lineWidth = 5;
	                _this.frontContext.strokeStyle = "rgb(73,75,87)";
	                _this.frontContext.fillStyle = "rgb(204,110,76)"; //"rgb(233, 30, 99)";//"rgb(199,166,63)";
	                _this.frontContext.beginPath();
	                for (var _i3 = 0; _i3 < circleNum; ++_i3) {
	                    var _circle = sourceCirclesData[_i3];
	                    if (!_circle.firstDrop) continue;
	                    _this.frontContext.moveTo(_circle.aggregate.sx + (_circle.aggregate.ex - _circle.aggregate.sx) * t + _this.circleRadius + (targetR - _this.circleRadius) * t, _this.halfTimeLineHeight + _circle.y);
	                    _this.frontContext.arc(_circle.aggregate.sx + (_circle.aggregate.ex - _circle.aggregate.sx) * t, _this.halfTimeLineHeight, _this.circleRadius + (targetR - _this.circleRadius) * t, 0, TWOPI);
	                }
	                _this.frontContext.fill();
	                _this.frontContext.stroke();
	
	                //text
	                _this.frontContext.fillStyle = "#fff"; //"rgb(73,75,87)";
	                _this.frontContext.font = "28px Segoe UI Light"; //"28px Arial Black";
	                _this.frontContext.textBaseline = "middle";
	                _this.frontContext.textAlign = "center";
	                _this.frontContext.beginPath();
	                for (var _i4 = 0; _i4 < circleNum; ++_i4) {
	                    var _circle2 = sourceCirclesData[_i4];
	                    if (!_circle2.firstDrop) continue;
	                    _this.frontContext.fillText(_this.timeFormat(new Date(_circle2.ts)), _circle2.aggregate.sx + (_circle2.aggregate.ex - _circle2.aggregate.sx) * t, _this.halfTimeLineHeight + _circle2.y);
	                }
	                _this.frontContext.fill();
	
	                if (t === 1) {
	                    _this.circleRadius = targetR;
	                }
	                _this.frontContext.restore();
	            };
	
	            var callBack = function callBack(t) {
	                _this.frontContext.clearRect(0, _this.height * 0.2, _this.width, _this.height * 0.8);
	                _this.frontContext.save();
	                _this.frontContext.translate(transform.translate[0], transform.translate[1]);
	                _this.frontContext.scale(transform.scale[0], transform.scale[1]);
	
	                var circleLineWidth = 5;
	                var circleNum = sourceCirclesData.length;
	                _this.frontContext.lineWidth = circleLineWidth;
	                _this.frontContext.strokeStyle = "rgb(221, 196, 207)";
	                _this.frontContext.fillStyle = "rgb(233,243,246)";
	                _this.frontContext.beginPath();
	                for (var _i5 = 0; _i5 < circleNum; ++_i5) {
	                    var _circle3 = sourceCirclesData[_i5];
	                    if (!_circle3.firstDrop) continue;
	                    _this.frontContext.moveTo(_circle3.aggregate.sx + (_circle3.aggregate.ex - _circle3.aggregate.sx) * t + _this.circleRadius + (targetR - _this.circleRadius) * t, _this.halfTimeLineHeight + _circle3.y);
	                    _this.frontContext.arc(_circle3.aggregate.sx + (_circle3.aggregate.ex - _circle3.aggregate.sx) * t, _this.halfTimeLineHeight, _this.circleRadius + (targetR - _this.circleRadius) * t, 0, TWOPI);
	                }
	                _this.frontContext.fill();
	                _this.frontContext.stroke();
	
	                // text
	                _this.frontContext.fillStyle = "#D90429";
	                _this.frontContext.font = "28px Arial Black";
	                _this.frontContext.textBaseline = "middle";
	                _this.frontContext.textAlign = "center";
	                _this.frontContext.beginPath();
	                for (var _i6 = 0; _i6 < circleNum; ++_i6) {
	                    var _circle4 = sourceCirclesData[_i6];
	                    if (!_circle4.firstDrop) continue;
	                    _this.frontContext.fillText(_this.timeFormat(new Date(_circle4.ts)), _circle4.aggregate.sx + (_circle4.aggregate.ex - _circle4.aggregate.sx) * t, _this.halfTimeLineHeight + _circle4.y);
	                }
	                _this.frontContext.fill();
	
	                if (t === 1) {
	                    _this.circleRadius = targetR;
	                }
	                _this.frontContext.restore();
	            };
	
	            return newCallback.bind(this);
	            // return callBack.bind(this);
	        }
	
	        /**
	         * @param  {Array<number>} dotsXPosition
	         */
	
	    }, {
	        key: "AtomDrawSkewLines",
	        value: function AtomDrawSkewLines(dotsXPosition, skewLineNum, skewLinePadding) {
	            var xOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
	
	            this.backContext.strokeStyle = "#D90429";
	            this.backContext.fillStyle = "#D90429";
	            this.backContext.lineWidth = 0.5;
	            this.backContext.beginPath();
	            for (var i = 0; i < skewLineNum; ++i) {
	
	                var tempX = dotsXPosition[0] + i * skewLinePadding;
	                this.backContext.moveTo(tempX + skewLinePadding - xOffset, this.halfTimeLineHeight);
	                this.backContext.lineTo(tempX - xOffset, this.timeLineHeight);
	
	                if ((i & 3) == 0) {
	                    this.backContext.moveTo(tempX + skewLinePadding - xOffset, this.halfTimeLineHeight);
	                    this.backContext.arc(tempX + skewLinePadding - xOffset, this.halfTimeLineHeight, this.dotRadius, 0, TWOPI);
	                }
	            }
	            this.backContext.fill();
	            this.backContext.stroke();
	        }
	
	        /**
	         * @param  {Array<number>} dotsXPosition
	         * @param  {Array<number>} dotsYPosition
	         */
	
	    }, {
	        key: "AtomDrawCircles",
	        value: function AtomDrawCircles(circlesData) {
	            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	            var splitBalls = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
	
	
	            // Circle
	            var circleLineWidth = 5;
	            var circleNum = circlesData.length;
	            this.frontContext.lineWidth = circleLineWidth;
	            this.frontContext.strokeStyle = "rgb(221, 196, 207)";
	            this.frontContext.fillStyle = "rgb(233,243,246)";
	            this.frontContext.beginPath();
	
	            for (var i = 0; i < circleNum; ++i) {
	                if (!circlesData[i].firstDrop) continue;
	                this.frontContext.moveTo(circlesData[i].x + this.circleRadius - (Array.isArray(xOffset) ? xOffset[i] : xOffset), this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset));
	                this.frontContext.arc(circlesData[i].x - (Array.isArray(xOffset) ? xOffset[i] : xOffset), this.halfTimeLineHeight + circlesData[i].y + (Array.isArray(yOffset) ? yOffset[i] : yOffset), this.circleRadius, 0, TWOPI);
	            }
	            this.frontContext.fill();
	            this.frontContext.stroke();
	
	            // text
	            this.frontContext.fillStyle = "#D90429";
	            this.frontContext.font = "28px Arial Black";
	            this.frontContext.textBaseline = "middle";
	            this.frontContext.textAlign = "center";
	            this.frontContext.beginPath();
	            for (var _i7 = 0; _i7 < circleNum; ++_i7) {
	                if (!circlesData[_i7].firstDrop) continue;
	                this.frontContext.fillText(this.timeFormat(new Date(circlesData[_i7].ts)), circlesData[_i7].x - (Array.isArray(xOffset) ? xOffset[_i7] : xOffset), this.halfTimeLineHeight + circlesData[_i7].y + (Array.isArray(yOffset) ? yOffset[_i7] : yOffset));
	            }
	            this.frontContext.fill();
	
	            var splitBallsFinished = false;
	            if (splitBalls) {
	
	                var dist = 0;
	                for (var _i8 = 0, len = splitBalls.length; _i8 < len; ++_i8) {
	                    var ball = splitBalls[_i8];
	                    this.frontContext.fillStyle = ball.color;
	                    this.frontContext.beginPath();
	                    this.frontContext.moveTo(ball.x + ball.r, this.halfTimeLineHeight + ball.y);
	                    this.frontContext.arc(ball.x, this.halfTimeLineHeight + ball.y, ball.r, 0, TWOPI);
	
	                    var tx = ball.x + (ball.x - ball.px) * 0.9;
	                    ball.px = ball.x;
	                    ball.x = tx;
	                    dist += Math.abs(ball.px - ball.x);
	
	                    var ty = ball.y + (ball.y - ball.py) * 0.9;
	                    ball.py = ball.y;
	                    ball.y = ty;
	                    this.frontContext.fill();
	                }
	                this.testTick++;
	                if (dist < 1 * splitBalls.length) {
	                    splitBallsFinished = true;
	                    console.log("tick time:" + this.testTick);
	                    this.testTick = 0;
	                }
	            }
	
	            return { 'circleLineWidth': circleLineWidth, 'splitBallsFinished': splitBallsFinished };
	        }
	
	        /**
	         * @param  {Array<number>} dotsXPosition
	         */
	
	    }, {
	        key: "AtomDrawLinks",
	        value: function AtomDrawLinks(dotsXPosition) {
	            var end = dotsXPosition[dotsXPosition.length - 1];
	            // link
	            this.backContext.lineWidth = 1;
	            this.backContext.strokeStyle = "rgb(221, 196, 207)";
	            this.backContext.beginPath();
	            this.backContext.moveTo(0, 0);
	            this.backContext.lineTo(end, 0);
	            this.backContext.moveTo(0, this.timeLineHeight);
	            this.backContext.lineTo(end, this.timeLineHeight);
	            this.backContext.stroke();
	        }
	
	        /**
	         * @param  {number} id
	         */
	
	    }, {
	        key: "GetDotsYPosition",
	        value: function GetDotsYPosition() {
	            return this._timeLineData && this._timeLineData.dotsYPosition;
	        }
	    }, {
	        key: "ClearCanvas",
	        value: function ClearCanvas() {
	            this.circleRadius = BASECIRCLERADIUS;
	            this.backContext.clearRect(0, 0, this.width, this.height);
	            this.frontContext.clearRect(0, 0, this.width, this.height);
	            this.backContext.setTransform(1, 0, 0, 1, 0, 0);
	            this.frontContext.setTransform(1, 0, 0, 1, 0, 0);
	        }
	    }]);
	    return _class;
	}();

	exports.default = _class;

/***/ },
/* 99 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(101);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(102), __esModule: true };

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(103);
	var $Object = __webpack_require__(38).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(37);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(46), 'Object', {defineProperty: __webpack_require__(42).f});

/***/ },
/* 104 */
/***/ function(module, exports) {

	module.exports = "\n<!-- Your content goes here -->\n<div class=\"screen-scroll mdl-card mdl-shadow--3dp mdl-cell mdl-cell--12-col\" _v-613ff422=\"\">\n    <div class=\"mdl-card__title\" _v-613ff422=\"\">\n        <h2 class=\"mdl-card__title-text\" _v-613ff422=\"\">Video-{{selectedVideo}}</h2>\n    </div>\n\n    <svg class=\"screen-scroll-svg\" _v-613ff422=\"\"></svg>\n    <div class=\"mdl-card__actions mdl-card--border\" _v-613ff422=\"\"> </div>\n    <bubble-float v-ref:bubble-float-component=\"\" _v-613ff422=\"\"></bubble-float>\n</div>";

/***/ },
/* 105 */
/***/ function(module, exports) {

	module.exports = "<div class=\"mdl-layout mdl-js-layout\" _v-81cd484e=\"\">\n    <header class=\"mdl-layout__header mdl-layout__header--scroll\" _v-81cd484e=\"\">\n        <div class=\"mdl-layout__header-row\" _v-81cd484e=\"\">\n            <!-- Title -->\n            <span class=\"mdl-layout-title\" _v-81cd484e=\"\">Videos</span>\n            <!-- Add spacer, to align navigation to the right -->\n            <div class=\"mdl-layout-spacer\" _v-81cd484e=\"\"></div>\n            <!-- Navigation. We hide it in small screens. -->\n            <nav class=\"mdl-navigation\" _v-81cd484e=\"\">\n                <a class=\"mdl-navigation__link\" v-link=\"vLinkIndex\" _v-81cd484e=\"\">Ours</a>\n                <a class=\"mdl-navigation__link\" v-link=\"vLinkCongleiPath\" _v-81cd484e=\"\">Conglei's</a>\n                <a class=\"mdl-navigation__link\" v-link=\"vLinkNoForeshadow\" _v-81cd484e=\"\">No ForeShadow</a>\n            </nav>\n        </div>\n    </header>\n    <div class=\"mdl-layout__drawer\" _v-81cd484e=\"\">\n        <span class=\"mdl-layout-title\" _v-81cd484e=\"\">Videos</span>\n        <nav class=\"mdl-navigation\" _v-81cd484e=\"\">\n            <label class=\"mdl-navigation__link\" _v-81cd484e=\"\">Video\n                <select v-model=\"selectedVideo\" @change=\"SelectVideo\" :disabled=\"selectVideoDisabled\" _v-81cd484e=\"\">\n                    <option v-for=\"id in videoIds\" :value=\"id\" _v-81cd484e=\"\">\n                        {{ id }}\n                    </option>\n                </select>\n            </label>\n\n            <label class=\"mdl-navigation__link\" _v-81cd484e=\"\">Speed X\n                <select v-model=\"zoomScaleMax\" @change=\"SelectSpeed\" :disabled=\"selectVideoDisabled\" _v-81cd484e=\"\">\n                    <option v-for=\"speed in zoomScaleList\" :value=\"speed\" _v-81cd484e=\"\">\n                        {{ speed }}\n                    </option>\n                </select>\n            </label>\n\n            <label class=\"mdl-navigation__link\" _v-81cd484e=\"\">\n                <label class=\"mdl-switch mdl-js-switch mdl-js-ripple-effect \" for=\"isAcceleration\" _v-81cd484e=\"\">\n                    <input type=\"checkbox\" id=\"isAcceleration\" class=\"mdl-switch__input\" v-model=\"isAcceleration\" @change=\"ChangeAcceleration\" _v-81cd484e=\"\">\n                    <span class=\"mdl-switch__label\" _v-81cd484e=\"\">Accerleration</span>\n                </label>\n            </label>\n\n            <label class=\"mdl-navigation__link\" for=\"btn-play\" _v-81cd484e=\"\">\n                <button id=\"btn-play\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent mdl-color-text--grey-800\" type=\"button\" @click=\"Resume\" _v-81cd484e=\"\"> Play </button>\n            </label>\n\n            <label class=\"mdl-navigation__link\" for=\"btn-Pause\" _v-81cd484e=\"\">\n                <button id=\"btn-Pause\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\" type=\"button\" @click=\"Pause\" _v-81cd484e=\"\">\n                    Pause </button>\n            </label>\n\n            <label class=\"mdl-navigation__link\" _v-81cd484e=\"\">\n                <hr _v-81cd484e=\"\">\n            </label>\n        </nav>\n\n    </div>\n    <main class=\"mdl-layout__content\" _v-81cd484e=\"\">\n        <div class=\"page-content\" _v-81cd484e=\"\">\n            <!-- Your content goes here -->\n            <router-view v-ref:click-animation-component=\"\" _v-81cd484e=\"\">\n            </router-view>\n        </div>\n    </main>\n</div>";

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	var __vue_styles__ = {}
	__webpack_require__(107)
	__webpack_require__(108)
	__vue_script__ = __webpack_require__(109)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\components\\CongleiBaseline\\CongleiBaseline.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(110)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	var __vue_options__ = typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports
	if (__vue_template__) {
	__vue_options__.template = __vue_template__
	}
	if (!__vue_options__.computed) __vue_options__.computed = {}
	Object.keys(__vue_styles__).forEach(function (key) {
	var module = __vue_styles__[key]
	__vue_options__.computed[key] = function () { return module }
	})


/***/ },
/* 107 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 108 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _keys = __webpack_require__(16);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _BubbleFloat = __webpack_require__(56);
	
	var _BubbleFloat2 = _interopRequireDefault(_BubbleFloat);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	    components: {
	        BubbleFloat: _BubbleFloat2.default
	    },
	    ready: function ready() {
	        Array.prototype.aggregate = function (num) {
	            var length = this.length;
	            var newArray = [];
	            var sum = 0;
	            for (var i = 0; i < length; i++) {
	                sum += this[i];
	                if ((i + 1) % num == 0) {
	                    newArray.push(sum / num);
	                    sum = 0;
	                }
	            }
	            if (length % num != 0) newArray.push(sum / length % num);
	            return newArray;
	        };
	
	        this.InitVariables();
	        if (!this.clickData) {
	            this.$root.getData();
	        }
	    },
	
	    doc: null,
	    svg: null,
	    stackGraph: null,
	    contextTimeLineG: null,
	    contextXscale: null,
	    contextTimeLineXAxisGen: null,
	    contextTimeLineXAxis: null,
	
	    stackXscale: null,
	    stackYscale: null,
	    stackXAxisGen: null,
	    stackYAxisGen: null,
	    stackXAxis: null,
	    stackYAxis: null,
	    xAxisTimeFormat: null,
	    areaGen: null,
	    stackLayout: null,
	    digitalClock: null,
	    digitalTimeFormat: null,
	    digitalDateFormat: null,
	    clickData: null,
	    stackData: null,
	    animationTimer: null,
	
	    data: function data() {
	        return {
	            padding: { top: 0, right: 50, bottom: 30, left: 50 },
	            width: null,
	            height: null,
	            center: null,
	            titleHeight: null,
	            viewInnerWidth: null,
	            viewInnerHeight: null,
	
	            selectedVideo: null,
	
	            timeInterval: 60,
	            stackBarMaxY: 0,
	            stackBarMaxIndex: 0,
	            stackBarWidth: 0,
	            chartHeight: 300,
	            barHeight: 300,
	            chartWidth: 0,
	            playrate: 20000,
	            clickColor: {
	                "pause": "#FFC107",
	                "play": "#80CBC4",
	                "seeked": "#03A9F4",
	                "error": "#607D8B",
	                "ratechange": "#00BCD4",
	                "stalled": "#EF5350"
	            },
	            orderMapping: {
	                "stalled": 0,
	                "ratechange": 1,
	                "play": 2,
	                "seeked": 3,
	                "pause": 4
	            }
	        };
	    },
	
	    methods: {
	        setRawdata: function setRawdata(data, stackData) {
	            this.clickData = {};
	            for (var i = 0, len = data.length; i < len; ++i) {
	                if (data[i].currentTime === 0) continue;
	                data[i].date = new Date(data[i].ts);
	
	                var videoId = data[i].videoId;
	                if (!this.clickData[videoId]) this.clickData[videoId] = {};
	                var videoData = this.clickData[videoId];
	
	                if (!videoData.clickDataGroupByTimeArray) videoData.clickDataGroupByTimeArray = [];
	                videoData.clickDataGroupByTimeArray.push(data[i]);
	            }
	
	            var videoIds = (0, _keys2.default)(this.clickData);
	            for (var _i = 0, _len = videoIds.length; _i < _len; ++_i) {
	                var _videoData = this.clickData[videoIds[_i]];
	                _videoData.clickDataGroupByTimeArray.sort(function (a, b) {
	                    return +a.ts - +b.ts;
	                });
	            }
	
	            this.stackData = stackData;
	
	            this.$refs.bubbleFloatComponent.setBarHeight(this.stackBarChartHeight).setTimeInterval(30).videosData(stackData);
	            return videoIds;
	        },
	        SelectVideo: function SelectVideo(selectedVideo) {
	            this.selectedVideo = selectedVideo;
	
	            this.clean();
	
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray;
	
	            //set up domain of each scale
	            this.contextXscale.domain(d3.extent(tempL1A, function (d) {
	                return +d.ts;
	            }));
	            this.xDomainMin = this.contextXscale.domain()[0];
	            this.xDomainMax = this.contextXscale.domain()[1];
	            setTimeout(this.InitView, 20);
	        },
	        InitVariables: function InitVariables() {
	            var _this = this;
	
	            this.doc = d3.select(this.$el);
	            this.titleHeight = this.doc.select(".mdl-card__title").node().clientHeight;
	            this.width = this.doc.node().clientWidth;
	            this.height = this.doc.node().clientHeight - this.titleHeight;
	            this.viewInnerWidth = this.width;
	            this.viewInnerHeight = this.height;
	            this.contextTimeLineHeight = this.height * 0.10;
	            this.chartWidth = this.width - this.padding.left - this.padding.right;
	            this.chartHeight = this.height * 0.7;
	            this.svg = this.doc.select("svg.conglei-svg").attr("height", this.viewInnerHeight);
	
	            this.center = [this.viewInnerWidth * 0.5, this.viewInnerHeight * 0.5];
	
	            this.svg.append("rect").attr({
	                "class": "svg-background",
	                "x": 0,
	                "y": 0,
	                "width": this.width,
	                "height": this.height * 0.15
	            });
	
	            this.stackLayout = d3.layout.stack().offset("zero").values(function (d) {
	                return d.values;
	            }).x(function (d) {
	                return d.x;
	            }).y(function (d) {
	                return d.y;
	            });
	            this.xAxisTimeFormat = d3.time.format("%M:%S");
	            this.contextXscale = d3.time.scale().range([this.padding.right, this.viewInnerWidth - this.padding.left]);
	            this.contextTimeLineXAxisGen = d3.svg.axis().scale(this.contextXscale).orient("top").tickSize(6, 0).tickFormat(function (d) {
	                return d3.time.format("%b %d")(d);
	            });
	
	            this.stackXscale = d3.scale.linear().range([this.padding.left, this.chartWidth - this.padding.right]);
	            this.stackXAxisGen = d3.svg.axis().scale(this.stackXscale).tickSize(6, 0).orient("bottom");
	
	            this.stackYscale = d3.scale.linear().range([this.chartHeight * 0.8 - this.padding.bottom, this.chartHeight * 0.8 - this.barHeight]);
	            this.stackYAxisGen = d3.svg.axis().scale(this.stackYscale).ticks(4).tickSize(6, 0).orient("left");
	            this.areaGen = d3.svg.area().interpolate("basis").x(function (d) {
	                return _this.stackXscale(d.x);
	            }).y0(function (d) {
	                return _this.stackYscale(d.y0);
	            }).y1(function (d) {
	                return _this.stackYscale(d.y + d.y0);
	            });
	
	            this.digitalDateFormat = d3.time.format("%b %d");
	            this.digitalTimeFormat = d3.time.format("%H:%M");
	        },
	        InitView: function InitView() {
	            this.contextTimeLineG = this.svg.append("g").attr("class", "time-line-context-group").attr("transform", "translate(" + [0, this.padding.top + this.titleHeight] + ")");
	
	            this.contextTimeLineXAxis = this.contextTimeLineG.append("g").attr("class", "x axis");
	
	            this.contextTimeLineXAxis.call(this.contextTimeLineXAxisGen);
	            this.contextTimeLineXAxis.append("circle").attr({
	                'cx': this.contextXscale.range()[0],
	                'r': 10,
	                'class': 'time-pivot'
	            });
	            this.drawStackGraph();
	        },
	        processStackData: function processStackData(data) {
	            if (!data) return;
	            // aggregate the clicks by time
	            if (!data.hasAggregate) {
	                for (var i = 0, len = data.layers.length; i < len; ++i) {
	                    var layer = data.layers[i];
	                    var oldValues = layer.values,
	                        newValues = [];
	                    for (var j = 0, lenj = Math.ceil(oldValues.length / this.timeInterval); j < lenj; ++j) {
	                        newValues.push({ x: j, y: 0 });
	                    }
	
	                    for (var _j = 1, _lenj = oldValues.length; _j < _lenj; ++_j) {
	                        var newIndex = Math.floor(_j / this.timeInterval);
	                        newValues[newIndex].y += oldValues[_j].y;
	                    }
	                    layer.values = newValues;
	                    layer._original_values = oldValues;
	                }
	                data.maxTime = Math.floor(data.maxTime / this.timeInterval);
	
	                var maxY = -Infinity;
	                // calculate the max Y
	                for (var _i2 = 0, _len2 = data.layers[0].values.length; _i2 < _len2; ++_i2) {
	                    var tempSum = 0;
	                    for (var _j2 = 0, _lenj2 = data.layers.length; _j2 < _lenj2; ++_j2) {
	                        tempSum += data.layers[_j2].values[_i2].y;
	                    }
	                    if (tempSum > maxY) maxY = tempSum;
	                }
	                data.maxSumValues = maxY;
	                this.stackBarMaxY = maxY;
	                this.stackBarMaxIndex = data.maxTime;
	                data.hasAggregate = true;
	            }
	
	            // sort the order;
	            var sortedlayers = [];
	            this.layersName = [];
	            for (var _i3 = 0, _len3 = data.layers.length, d; _i3 < _len3; ++_i3) {
	                d = data.layers[_i3];
	                sortedlayers[this.orderMapping[d.name]] = d;
	                this.layersName[this.orderMapping[d.name]] = d.name;
	            }
	            data.layers = sortedlayers;
	            this.layersName = this.layersName.reverse();
	            //update scale
	            this.stackXscale.domain([0, data.maxTime]);
	            this.stackYscale.domain([0, data.maxSumValues]);
	            //update axis-gen
	            this.stackXAxisGen.scale(this.stackXscale);
	            this.stackYAxisGen.scale(this.stackYscale);
	        },
	        drawStackGraph: function drawStackGraph() {
	            var _this2 = this;
	
	            this.processStackData(this.stackData[this.selectedVideo]);
	            var chart = this.stackGraph = this.svg.append("g").attr({
	                "class": "stack-graph",
	                "transform": function transform() {
	                    return "translate(" + [_this2.padding.left, _this2.height * 0.25] + ")";
	                }
	            });
	
	            var maxIndex = this.stackXscale.domain()[1];
	            this.stackBarWidth = this.chartWidth / maxIndex;
	            this.stackXAxisGen.ticks(maxIndex);
	            var data = this.stackLayout(this.stackData[this.selectedVideo].layers);
	            // append stackBar
	            chart.append("g").attr("class", "back-ground upper-chart").style('opacity', 1e-6).selectAll("g.layer").data(data).enter().append("g").attr("class", function (d) {
	                return "layer " + d.name;
	            }).append("path").attr("d", function (d) {
	                return _this2.areaGen(d.values);
	            });
	
	            //this.drawLegends(chart);
	            this.drawDigitalClock(this.svg);
	            this.start();
	        },
	        drawLegends: function drawLegends(chart) {
	            var _this3 = this;
	
	            this.stackXAxis = chart.select("g.back-ground.upper-chart").append("g").attr({
	                "class": "x axis",
	                "transform": "translate(" + [-this.stackBarWidth * 0.5 + this.padding.left, this.chartHeight * 0.8 - this.padding.bottom] + ")"
	            }).call(this.stackXAxisGen);
	            this.stackXAxis.selectAll(".tick text").text(function (d, i) {
	                if (i & 1) return _this3.xAxisTimeFormat(new Date(_this3.timeInterval * d * 1000));
	            });
	            this.stackXAxis.append("text").attr({
	                "class": "caption",
	                "x": this.chartWidth * 0.5,
	                "y": this.padding.bottom + 20
	            }).text("Video Progress");
	
	            this.stackYAxis = chart.select("g.back-ground.upper-chart").append("g").attr({
	                "class": "y axis",
	                "transform": "translate(" + [this.padding.left, 0] + ")"
	            }).call(this.stackYAxisGen);
	
	            this.stackYAxis.append("text").attr({
	                "class": "caption vertical-caption",
	                "x": -this.chartHeight * 0.8 + this.barHeight * 0.5 + this.padding.bottom,
	                "y": -45
	            }).text("Number of Clicks");
	
	            var legends = chart.append("g").attr({
	                "class": "legend",
	                "transform": "translate(" + [this.chartWidth - this.padding.left, 10] + ")"
	            }).selectAll("g.legend-rect").data(this.layersName).enter().append("g").attr("class", function (d) {
	                return "legend-rect " + d;
	            });
	
	            legends.append("rect").attr({
	                "y": function y(d, i) {
	                    return i * 25;
	                },
	                "height": 20,
	                "width": 20
	            });
	
	            legends.append("text").attr({
	                "y": function y(d, i) {
	                    return i * 25 + 15;
	                },
	                "x": -5
	            }).style({
	                "text-anchor": "end"
	            }).text(function (d) {
	                return d;
	            });
	
	            //draw digital clock
	        },
	        drawDigitalClock: function drawDigitalClock(chart) {
	            this.digitalClock = chart.append("g").attr("class", "clock-group").attr("transform", "translate(" + [this.center[0], this.padding.top + this.titleHeight + this.height * 0.2] + ")");
	            this.digitalClock.append("line").attr({
	                "x1": -150,
	                "y1": 20,
	                "y2": 20,
	                "x2": 150
	            });
	            this.digitalClock.append("text").attr({
	                "class": "date"
	            }).text("TEST");
	            this.digitalClock.append("text").attr({
	                "class": "time",
	                "y": 85
	            }).text("TEST");
	        },
	        AnimationUpdateDigitalClock: function AnimationUpdateDigitalClock(date) {
	            if (!this.digitalClock) return;
	            if (typeof date === "number" || typeof date === "string") date = new Date(date);
	            this.digitalClock.select("text.date").text(this.digitalDateFormat(date));
	            this.digitalClock.select("text.time").text(this.digitalTimeFormat(date));
	        },
	        start: function start() {
	            var _this4 = this;
	
	            var draw = function draw() {
	
	                if (allDataLength < sliceCount * sliceSize) return;
	                //get the data to be shown in this slice
	                var start = sliceCount * sliceSize;
	                var end = Math.min(tempL1A.length, (sliceCount + 1) * sliceSize);
	                var slicedData = tempL1A.slice(start, end);
	                var dataCount = slicedData.length;
	                var minTime = slicedData[0].ts;
	                sliceCount++;
	
	                var endCount = 0;
	                chart.selectAll('.points_' + sliceCount).data(slicedData, function (d) {
	                    return d.ts;
	                }).enter().append('circle').attr({
	                    class: function _class(d) {
	                        return d.type;
	                    },
	                    cx: function cx(d) {
	                        return _this4.stackXscale(d.currentTime / _this4.timeInterval);
	                    },
	                    r: 0,
	                    opacity: 1
	                }).transition().delay(function (d) {
	                    return (d.ts - minTime) / _this4.playrate;
	                }).duration(1000).ease('cubic').attr({
	                    opacity: 0.2,
	                    r: circleRadiu
	                }).each("end", function (d) {
	                    ++endCount;
	                    d3.select(this).remove();
	                    if (endCount === dataCount) {
	                        draw();
	                    }
	                });
	
	                //this.animationTimer = setTimeout(draw, (slicedData[slicedData.length - 1].ts + 1010 - minTime) / this.playrate);
	            };
	            console.log(this.stackXscale.domain());
	            console.log(this.stackXscale.range());
	
	            var currentTime = void 0,
	                lastTime = this.contextXscale.domain()[0].getTime();
	            var isBegin = false;
	
	            var tempL1A = this.clickData[this.selectedVideo].clickDataGroupByTimeArray,
	                allDataLength = tempL1A.length;
	
	            console.log(tempL1A);
	
	            var sliceCount = 0,
	                sliceSize = 100;
	
	            var circleRadiu = 40;
	            var chart = this.stackGraph.append("g").attr("class", "event-circle").attr("transform", "translate(" + [0, this.chartHeight - this.padding.bottom - circleRadiu] + ")");
	
	            setTimeout(function () {
	                _this4.stackGraph.select('g.back-ground').transition().duration(1000).style('opacity', '1');
	            }, 10000);
	
	            this.contextTimeLineXAxis.select("circle").transition().ease("linear").duration((this.contextXscale.domain()[1].getTime() - this.contextXscale.domain()[0].getTime()) / this.playrate).attrTween("cx", function () {
	                return function (t) {
	                    currentTime = _this4.contextXscale.domain()[0].getTime() + t * (_this4.contextXscale.domain()[1].getTime() - _this4.contextXscale.domain()[0].getTime());
	                    _this4.AnimationUpdateDigitalClock(currentTime);
	                    if (!isBegin) {
	                        if (currentTime < tempL1A[0].ts) return;else {
	                            isBegin = true;
	                            draw();
	                        }
	                    }
	                    lastTime = currentTime;
	                    return _this4.contextXscale.range()[0] + t * (_this4.contextXscale.range()[1] - _this4.contextXscale.range()[0]);
	                };
	            });
	        },
	        stop: function stop() {
	            clearTimeout(this.animationTimer);
	        },
	        clean: function clean() {
	            this.stop();
	            this.contextTimeLineG && this.contextTimeLineG.selectAll("*").remove();
	            this.stackGraph && this.stackGraph.selectAll("*").remove();
	            this.digitalClock && this.digitalClock.selectAll("*").remove();
	        }
	    }
	};

/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = "<!-- Your content goes here -->\n<div class=\"conglei mdl-card mdl-shadow--3dp mdl-cell mdl-cell--12-col\" _v-5d610277=\"\">\n    <div class=\"mdl-card__title\" _v-5d610277=\"\">\n        <h2 class=\"mdl-card__title-text\" _v-5d610277=\"\">Video-{{selectedVideo}}</h2>\n    </div>\n\n    <svg class=\"conglei-svg\" _v-5d610277=\"\"></svg>\n    <bubble-float v-ref:bubble-float-component=\"\" _v-5d610277=\"\"></bubble-float>\n</div>";

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	var __vue_styles__ = {}
	__webpack_require__(112)
	__webpack_require__(113)
	__vue_script__ = __webpack_require__(114)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\components\\NoForeShadowBaseline\\NoForeshadowBaseline.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(115)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	var __vue_options__ = typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports
	if (__vue_template__) {
	__vue_options__.template = __vue_template__
	}
	if (!__vue_options__.computed) __vue_options__.computed = {}
	Object.keys(__vue_styles__).forEach(function (key) {
	var module = __vue_styles__[key]
	__vue_options__.computed[key] = function () { return module }
	})


/***/ },
/* 112 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 113 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _keys = __webpack_require__(16);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _d = __webpack_require__(51);
	
	var _d2 = _interopRequireDefault(_d);
	
	var _materialDesignLite = __webpack_require__(52);
	
	var _materialDesignLite2 = _interopRequireDefault(_materialDesignLite);
	
	__webpack_require__(53);
	
	var _BubbleFloat = __webpack_require__(56);
	
	var _BubbleFloat2 = _interopRequireDefault(_BubbleFloat);
	
	var _TimeLine = __webpack_require__(98);
	
	var _TimeLine2 = _interopRequireDefault(_TimeLine);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// components here
	exports.default = {
	    components: {
	        BubbleFloat: _BubbleFloat2.default
	    },
	    ready: function ready() {
	        this.InitVariables();
	        console.log("ready no-ball-drop");
	        if (!this.clickData) {
	            this.$root.getData();
	        }
	    },
	
	
	    // Complex data here
	    //d3 element
	    doc: null,
	    svg: null,
	    contextTimeLineG: null,
	    //xAxis: null,
	    timelineChartData: null,
	    timelineChartLineGen: null,
	    animation: null,
	    digitalClock: null,
	
	    //d3 drawing helper
	    focusXscale: null,
	    contextXscale: null,
	    contextBarChartYscale: null,
	    arcGen: null,
	    brush: null,
	    dateFormat: null,
	    timeFormat: null,
	
	    clickData: null,
	    data: function data() {
	        return {
	            padding: { top: 0, right: 50, bottom: 30, left: 50 },
	            width: null,
	            height: null,
	            center: null,
	            titleHeight: null,
	            viewInnerWidth: null,
	            viewInnerHeight: null,
	            contextTimeLineHeight: null,
	            contextTimeLineY: null,
	            stackBarChartHeight: 300,
	
	            //control panel
	            zoomScaleMax: 8,
	            focusTimeLineViewScale: 1,
	            focusDataScale: 1,
	            isAcceleration: true,
	            accelerateMode: "domain",
	
	            selectedVideo: "",
	
	            // durations:[5000,1500,2500,5000],
	            baseDuration: 1000,
	            currentDuration: 1000,
	
	            timeInterval: { name: "Hour", ms: 60 * 60 * 1000 }, // hour
	
	            //data to draw
	            xDomainMin: null,
	            xDomainMax: null
	        };
	    },
	
	    methods: {
	        setRawdata: function setRawdata(data, stackData) {
	            this.clickData = {};
	            var time2edInterval = this.zoomScaleMax * this.timeInterval.ms;
	            for (var i = 0, len = data.length; i < len; ++i) {
	                if (data[i].currentTime === 0) continue;
	                data[i].date = new Date(data[i].ts);
	
	                var videoId = data[i].videoId;
	                if (!this.clickData[videoId]) this.clickData[videoId] = {};
	                var videoData = this.clickData[videoId];
	
	                if (!videoData.clickDataGroupByTimeArray) videoData.clickDataGroupByTimeArray = {};
	                if (!videoData.clickDataGroupByTimeDict) videoData.clickDataGroupByTimeDict = {};
	                if (!videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale]) videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale] = [];
	                if (!videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale]) videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale] = {};
	                if (!videoData.clickDataGroupByTimeArray[this.zoomScaleMax]) videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
	                if (!videoData.clickDataGroupByTimeDict[this.zoomScaleMax]) videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
	
	                var index = Math.floor(data[i].ts / this.timeInterval.ms);
	                if (!videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index]) videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index] = [];
	                videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][index].push(data[i]);
	
	                index = Math.floor(data[i].ts / time2edInterval);
	                if (!videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index]) videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index] = [];
	                videoData.clickDataGroupByTimeDict[this.zoomScaleMax][index].push(data[i]);
	            }
	
	            var videoIds = (0, _keys2.default)(this.clickData);
	            for (var _i = 0, _len = videoIds.length; _i < _len; ++_i) {
	                var _videoData = this.clickData[videoIds[_i]];
	                var timeKeys = (0, _keys2.default)(_videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale]);
	                for (var j = 0, lenj = timeKeys.length; j < lenj; ++j) {
	                    _videoData.clickDataGroupByTimeArray[this.focusTimeLineViewScale][j] = {
	                        ts: +timeKeys[j] * this.timeInterval.ms,
	                        value: _videoData.clickDataGroupByTimeDict[this.focusTimeLineViewScale][timeKeys[j]]
	                    };
	                }
	
	                timeKeys = (0, _keys2.default)(_videoData.clickDataGroupByTimeDict[this.zoomScaleMax]);
	                for (var _j = 0, _lenj = timeKeys.length; _j < _lenj; ++_j) {
	                    _videoData.clickDataGroupByTimeArray[this.zoomScaleMax][_j] = {
	                        ts: +timeKeys[_j] * time2edInterval,
	                        value: _videoData.clickDataGroupByTimeDict[this.zoomScaleMax][timeKeys[_j]]
	                    };
	                }
	            }
	
	            this.$refs.bubbleFloatComponent.setBarHeight(this.stackBarChartHeight).setIs2D(this.is2D).setTimeInterval(30).videosData(stackData);
	
	            return videoIds;
	        },
	        processData: function processData(tempL1A) {
	            if (tempL1A.statics) return;
	            var extent = _d2.default.extent(tempL1A, function (d) {
	                return d.value.length;
	            });
	            var max = extent[1];
	            var min = extent[0];
	            var mean = _d2.default.mean(tempL1A, function (d) {
	                return d.value.length;
	            });
	            var median = _d2.default.median(tempL1A, function (d) {
	                return d.value.length;
	            });
	            var deviation = _d2.default.deviation(tempL1A, function (d) {
	                return d.value.length;
	            });
	            tempL1A.statics = {
	                extent: extent,
	                max: max,
	                min: min,
	                mean: mean,
	                median: median,
	                deviation: deviation
	            };
	        },
	        calOutLier: function calOutLier(tempL1A) {
	            if (tempL1A.outliers) return;
	            if (!tempL1A.statics) this.processData(tempL1A);
	            var statics = tempL1A.statics;
	            var mean = statics.mean;
	            var deviation = statics.deviation;
	            var sigmaCount = 2;
	            var upperBound = mean + sigmaCount * deviation;
	            var lowerBound = mean - sigmaCount * deviation;
	            var outliers = [];
	            for (var i = 0, len = tempL1A.length, value; i < len; ++i) {
	                value = tempL1A[i].value.length;
	                if (value > upperBound || value < lowerBound) {
	                    tempL1A[i].isOutlier = true;
	                    outliers.push(tempL1A[i]);
	                }
	            }
	            tempL1A.outliers = outliers;
	        },
	        SelectVideo: function SelectVideo(selectedVideo) {
	            this.selectedVideo = selectedVideo;
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray[1];
	            var tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
	            if (!tempL2A) {
	                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
	                var tempL2D = videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
	                var time2edInterval = this.timeInterval.ms * this.zoomScaleMax;
	                for (var i = 0, len = tempL1A.length; i < len; ++i) {
	                    var clicks = tempL1A[i].value;
	                    for (var j = 0, lenj = clicks.length; j < lenj; ++j) {
	                        var click = clicks[j];
	                        var index = Math.floor(click.ts / time2edInterval);
	                        if (!tempL2D[index]) tempL2D[index] = [];
	                        tempL2D[index].push(click);
	                    }
	                }
	
	                var timeKeys = (0, _keys2.default)(tempL2D);
	                for (var _i2 = 0, _len2 = timeKeys.length; _i2 < _len2; ++_i2) {
	                    tempL2A[_i2] = {
	                        ts: +timeKeys[_i2] * time2edInterval,
	                        value: tempL2D[timeKeys[_i2]]
	                    };
	                }
	            }
	            this.calOutLier(tempL1A);
	            this.calOutLier(tempL2A);
	
	            //set up domain of each scale
	            this.contextBarChartYscale.domain(tempL1A.statics.extent);
	            this.focusXscale.domain(_d2.default.extent(tempL1A, function (d) {
	                return +d.ts;
	            }));
	            this.contextXscale.domain(this.focusXscale.domain());
	            this.xDomainMin = this.focusXscale.domain()[0];
	            this.xDomainMax = this.focusXscale.domain()[1];
	            setTimeout(this.InitView, 20);
	        },
	        SelectSpeed: function SelectSpeed(zoomScaleMax) {
	            this.zoomScaleMax = zoomScaleMax;
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray[1];
	            var tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
	            if (!tempL2A) {
	                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax] = [];
	                var tempL2D = videoData.clickDataGroupByTimeDict[this.zoomScaleMax] = {};
	                var time2edInterval = this.timeInterval.ms * this.zoomScaleMax;
	                for (var i = 0, len = tempL1A.length; i < len; ++i) {
	                    var clicks = tempL1A[i].value;
	                    for (var j = 0, lenj = clicks.length; j < lenj; ++j) {
	                        var click = clicks[j];
	                        var index = Math.floor(click.ts / time2edInterval);
	                        if (!tempL2D[index]) tempL2D[index] = [];
	                        tempL2D[index].push(click);
	                    }
	                }
	
	                var timeKeys = (0, _keys2.default)(tempL2D);
	                for (var _i3 = 0, _len3 = timeKeys.length; _i3 < _len3; ++_i3) {
	                    tempL2A[_i3] = {
	                        ts: +timeKeys[_i3] * time2edInterval,
	                        value: tempL2D[timeKeys[_i3]]
	                    };
	                }
	            }
	            this.calOutLier(tempL1A);
	            this.calOutLier(tempL2A);
	
	            this.InitView();
	        },
	        ChangeAcceleration: function ChangeAcceleration(isAcceleration) {
	            this.isAcceleration = isAcceleration;
	            if (!this.isAcceleration) {
	                this.focusTimeLineViewScale = 1;
	            }
	        },
	        InitVariables: function InitVariables() {
	            this.doc = _d2.default.select(this.$el);
	            this.titleHeight = this.doc.select(".mdl-card__title").node().clientHeight;
	            this.width = this.doc.node().clientWidth;
	            this.viewInnerWidth = this.width;
	            this.height = this.doc.node().clientHeight - this.titleHeight;
	            this.contextTimeLineHeight = this.height * 0.10;
	            this.viewInnerHeight = this.height * 0.15;
	            this.svg = this.doc.select("svg.no-foreshadow-baseline-svg").attr("height", this.viewInnerHeight);
	            this.svg.append("rect").attr({
	                "class": "svg-background",
	                "x": 0,
	                "y": 0,
	                "width": this.width,
	                "height": this.viewInnerHeight
	            });
	            this.center = [this.viewInnerWidth * 0.5, this.viewInnerHeight * 0.5];
	
	            this.contextTimeLineY = 0;
	
	            // Scales
	            this.contextXscale = _d2.default.time.scale();
	
	            this.contextBarChartYscale = _d2.default.scale.linear().range([0, this.contextTimeLineHeight]);
	
	            this.focusXscale = _d2.default.time.scale();
	            this.arcGen = _d2.default.svg.arc().innerRadius(0).outerRadius(200).startAngle(0).endAngle(2 * Math.PI);
	            this.timelineChartLineGen = _d2.default.svg.line().interpolate("basis").x(function (d) {
	                return d.x;
	            }).y(function (d) {
	                return d.y;
	            });
	            this.dateFormat = _d2.default.time.format("%b %d");
	            this.timeFormat = _d2.default.time.format("%H:%M");
	
	            this.brush = _d2.default.svg.brush().x(this.contextXscale);
	        },
	        drawDigitalClock: function drawDigitalClock(chart) {
	            this.digitalClock = chart.append("g").attr("class", "clock-group").attr("transform", "translate(" + [this.center[0], this.center[1]] + ")");
	            this.digitalClock.append("line").attr({
	                "x1": -150,
	                "y1": 20,
	                "y2": 20,
	                "x2": 150
	            });
	            this.digitalClock.append("text").attr({
	                "class": "date"
	            }).text("TEST");
	            this.digitalClock.append("text").attr({
	                "class": "time",
	                "y": 85
	            }).text("TEST");
	        },
	        InitView: function InitView() {
	            var timeLinePosition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	            if (this.animation) this.animation.interrupt();
	            //clear
	            this.focusTimeLineViewScale = 1;
	            this.focusDataScale = 1;
	            var videoData = this.clickData[this.selectedVideo];
	            var tempL1A = videoData.clickDataGroupByTimeArray[1],
	                tempL2A = videoData.clickDataGroupByTimeArray[this.zoomScaleMax];
	            this.calOutLier(tempL1A);
	            this.calOutLier(tempL2A);
	
	            for (var i = 0, len = tempL1A.length; i < len; ++i) {
	                tempL1A[i].firstDrop = true;
	            }
	            for (var _i4 = 0, _len4 = tempL2A.length; _i4 < _len4; ++_i4) {
	                tempL2A[_i4].firstDrop = true;
	            }
	
	            this.contextTimeLineY = this.padding.top;
	            this.$refs.bubbleFloatComponent.setPosition(0, this.viewInnerHeight + this.titleHeight).setSize([this.viewInnerWidth, this.height - this.viewInnerHeight]);
	
	            this.zoomInView = [this.center[0], this.halfTimeLineHeight, this.viewInnerWidth];
	            this.zoomOutView = [this.center[0], this.timeLineHeight, this.viewInnerWidth * 2];
	            //modify the domain of xScale for focus view
	            this.focusXscale.range([this.padding.left, this.width - this.padding.right]).domain([_d2.default.time.hour.offset(this.xDomainMin, -5), _d2.default.time.hour.offset(this.xDomainMin, 5)]);
	
	            // clear the svg
	            this.contextTimeLineG && this.contextTimeLineG.selectAll("*").remove();
	            this.svg.select("defs").selectAll("*").remove();
	
	            this.drawContextTimeLine(tempL1A);
	
	            this.zoomIn = false;
	            this.focusTimeLineViewScale = 1;
	
	            var syncDelay = 0.3;
	            this.$refs.bubbleFloatComponent.drawNoStackChart(this.selectedVideo).start();
	            this.animation = _d2.default.select("svg.no-foreshadow-baseline-svg");
	            this.AnimationTick(this.baseDuration);
	        },
	        AnimationUpdateDigitalClock: function AnimationUpdateDigitalClock(date) {
	            if (!this.digitalClock) return;
	            if (typeof date === "number" || typeof date === "string") date = new Date(date);
	            this.digitalClock.select("text.date").text(this.dateFormat(date));
	            this.digitalClock.select("text.time").text(this.timeFormat(date));
	        },
	        drawContextTimeLine: function drawContextTimeLine(tempL1A) {
	            this.contextXscale.range([this.padding.left, this.width - this.padding.right]);
	            this.contextTimeLineG = this.svg.append("g").attr("class", "time-line-context-group").attr("transform", "translate(" + [0, 0] + ")");
	
	            this.brush.x(this.contextXscale).extent(this.focusXscale.domain());
	            // Context TimeLine here
	            this.contextTimeLineG.append("g").attr("class", "x brush").on("mousedown", function () {
	                _d2.default.event.stopImmediatePropagation();
	            }).call(this.brush).style("pointer-events", "none").selectAll("rect").attr({
	                "y": this.viewInnerHeight - this.padding.bottom - this.contextTimeLineHeight,
	                "height": this.contextTimeLineHeight
	            });
	
	            this.contextTimeLineXAxis = this.contextTimeLineG.append("g").attr("class", "x axis").attr("transform", "translate(" + [0, this.viewInnerHeight - this.padding.bottom] + ")");
	
	            this.contextTimeLineXAxis.call(_d2.default.svg.axis().scale(this.contextXscale).orient("top").tickSize(6, 0).tickFormat(function (d) {
	                return _d2.default.time.format("%b %d")(d);
	            }));
	
	            this.contextTimeLineXAxis.append("circle").attr({
	                'cx': this.contextXscale.range()[0],
	                'r': 10,
	                'class': 'time-pivot'
	            });
	        },
	        AddOffsetToDomain: function AddOffsetToDomain(xScale) {
	            var domain = xScale.domain();
	            var domainWidth = 0.2 * (domain[1].getTime() - domain[0].getTime());
	            var tempDomainMin = domain[0].getTime() + domainWidth,
	                tempDomainMax = domain[1].getTime() + domainWidth;
	            if (tempDomainMax > this.xDomainMax) {
	                //limit to the max
	                tempDomainMin = domain[0];
	                tempDomainMax = domain[1];
	            }
	            return [tempDomainMin, tempDomainMax];
	        },
	        AnimationTick: function AnimationTick(duration) {
	            var _this = this;
	
	            var stop = false;
	            this.animation.transition().duration(duration).ease("linear").each("interrupt", function () {
	                console.log("interrupt");
	                stop = true;
	            }).each(function () {
	                // update the domains               
	                var lastDomain = _this.focusXscale.domain();
	                var lastDomainCenter = lastDomain[0].getTime() + 0.5 * (lastDomain[1].getTime() - lastDomain[0].getTime());
	                var currentDomain = _this.AddOffsetToDomain(_this.focusXscale);
	                var currentDomainCenter = currentDomain[0] + 0.5 * (currentDomain[1] - currentDomain[0]);
	
	                // 1.determine the position of each bar firstly
	                var focusBarData = [];
	                var targetData = _this.clickData[_this.selectedVideo].clickDataGroupByTimeArray[1];
	                _this.zoomIn = false;
	                for (var i = 0, len = targetData.length; i < len; ++i) {
	                    if (targetData[i].ts >= lastDomain[0]) {
	                        if (targetData[i].ts <= currentDomain[1]) {
	                            if (targetData[i].isOutlier) {
	                                _this.zoomIn = true;
	                            }
	                            focusBarData.push(targetData[i]);
	                        } else {
	                            break;
	                        }
	                    }
	                }
	
	                _d2.default.select({}).transition().tween("main", function () {
	                    var interpolateDomain = _d2.default.interpolateNumber(lastDomainCenter, currentDomainCenter);
	                    return function (t) {
	                        if (stop) return;
	                        var offset = interpolateDomain(t);
	                        _this.$refs.bubbleFloatComponent.AnimationUpdateDigitalClock(offset);
	                        _this.contextTimeLineXAxis.select("circle").attr("cx", _this.contextXscale(offset));
	
	                        for (var _i5 = 0, _len5 = focusBarData.length; _i5 < _len5; ++_i5) {
	                            if (focusBarData[_i5].ts > offset) {
	                                if (focusBarData[_i5].firstDrop) {
	                                    focusBarData[_i5].firstDrop = false;
	                                    _this.$refs.bubbleFloatComponent.inputClicks(focusBarData[_i5].value, focusBarData[_i5]).drawClicks();
	                                }
	                            }
	                        }
	                    };
	                });
	
	                // 2.update new domain
	                _this.focusXscale.domain(currentDomain);
	                // 3.define our brush extent with new domain
	                _this.brush.extent(currentDomain);
	                _this.brush(_this.contextTimeLineG.select(".x.brush").transition());
	            }).transition().duration(10).each("end", function () {
	                if (!stop && _this.focusXscale.domain()[1] < _this.xDomainMax) {
	                    if (_this.isAcceleration && !_this.zoomIn) {
	                        switch (_this.accelerateMode) {
	                            case "domain":
	                                {
	                                    _this.focusTimeLineViewScale = _this.zoomScaleMax;
	                                    _this.AccelerateByDomain(_this.zoomScaleMax);
	                                    _this.$refs.bubbleFloatComponent.accelerateBallsDropping(_this.zoomScaleMax);
	                                    break;
	                                }
	                            case "screen":
	                                {
	                                    _this.zoomIn = true;
	                                    _this.focusTimeLineViewScale = _this.zoomScaleMax;
	                                    _this.zoomOutView = [_this.zoomInView[0] + _this.viewInnerWidth * 0.5, _this.timeLineHeight, _this.viewInnerWidth * _this.focusTimeLineViewScale];
	                                    _this.AccelerateByScreen(duration, _this.zoomInView, _this.zoomOutView);
	                                    break;
	                                }
	                        }
	                    } else if (_this.isAcceleration && _this.zoomIn) {
	                        switch (_this.accelerateMode) {
	                            case "domain":
	                                {
	                                    _this.focusTimeLineViewScale = 1;
	                                    _this.AccelerateByDomain(1);
	                                    _this.$refs.bubbleFloatComponent.accelerateBallsDropping(1);
	                                    break;
	                                }
	                            case "screen":
	                                {
	                                    _this.zoomIn = false;
	                                    _this.focusTimeLineViewScale = 1;
	                                    _this.zoomInView = [_this.zoomOutView[0] + _this.viewInnerWidth * 0.5, _this.timeLineHeight * 0.5, _this.viewInnerWidth * _this.focusTimeLineViewScale];
	                                    _this.AccelerateByScreen(duration, _this.zoomOutView, _this.zoomInView);
	                                    break;
	                                }
	                        }
	                    } else {
	                        _this.AnimationTick(duration);
	                    }
	                }
	            });
	        },
	        Pause: function Pause() {
	            this.animation.interrupt();
	            this.$refs.bubbleFloatComponent.pause();
	        },
	        Resume: function Resume() {
	            this.AnimationTick(this.baseDuration);
	            this.$refs.bubbleFloatComponent.resume();
	        },
	        AccelerateByDomain: function AccelerateByDomain(scale) {
	            var targetDuration = this.baseDuration / scale;
	            var sourceDuration = this.baseDuration / (scale != 1 ? 1 : this.zoomScaleMax);
	            var offset = (targetDuration - sourceDuration) * 0.2;
	            if (this.currentDuration != targetDuration) this.currentDuration += offset;
	            this.AnimationTick(this.currentDuration);
	        },
	        AccelerateByScreen: function AccelerateByScreen(duration, start, end) {
	            this.animation.interrupt();
	            this.selectVideoDisabled = true;
	            var originalFocusXscale = this.focusXscale.copy();
	            var halfScreen = end[2] * 0.5;
	            this.focusXscale.domain([end[0] - halfScreen, end[0] + halfScreen].map(originalFocusXscale.invert));
	            this.selectVideoDisabled = false;
	            this.AnimationTick(duration);
	        }
	    }
	};
	
	// self lib here

/***/ },
/* 115 */
/***/ function(module, exports) {

	module.exports = "\n<!-- Your content goes here -->\n<div class=\"no-foreshadow-baseline mdl-card mdl-shadow--3dp mdl-cell mdl-cell--12-col\" _v-24f243ef=\"\">\n    <div class=\"mdl-card__title\" _v-24f243ef=\"\">\n        <h2 class=\"mdl-card__title-text\" _v-24f243ef=\"\">Video-{{selectedVideo}}</h2>\n    </div>\n\n    <svg class=\"no-foreshadow-baseline-svg\" _v-24f243ef=\"\"></svg>\n    <div class=\"mdl-card__actions mdl-card--border\" _v-24f243ef=\"\"> </div>\n    <bubble-float v-ref:bubble-float-component=\"\" _v-24f243ef=\"\"></bubble-float>\n</div>";

/***/ }
]);
//# sourceMappingURL=app.js.map