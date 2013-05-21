;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var UISegue = require('../index.js');
var UIButton = require('sioux-ui-button');

window.onload = function () {

	var segue = new UISegue('push', document.querySelector('.screen'));
	window.segue = segue;

	segue.on('leftPopped', function (left) {
		console.log(left);
	});

	segue.on('rightPopped', function (right) {
		console.log(right);
	});
	
	var activeNext = new UIButton(document.querySelector('.foo .next'));
	activeNext.on('tap', function () {

		segue.wind()
		.then(function () {
			console.log('WINDED');
		});
	});

	var prevNext = new UIButton(document.querySelector('.bar .next'));
	prevNext.on('tap', function () {
	
		segue.wind();
	});

	var activeBack = new UIButton(document.querySelector('.foo .back'));
	activeBack.on('tap', function () {
	
		segue.unwind()
		.then(function () {
			console.log('UNWINDED');
		});
	});

	var nextBack = new UIButton(document.querySelector('.baz .back'));
	nextBack.on('tap', function () {
	
		segue.unwind();
	});


	var modalSegue = new UISegue('modal', document.querySelector('.screen'));
	window.modalSegue = modalSegue;

	var modalWinder = new UIButton(document.querySelector('.foo .modal'));
	modalWinder.on('tap', function () {

		modalSegue.wind();
	});
	var modalUnwind = new UIButton(document.querySelector('.mod button'));
	modalUnwind.on('tap', function () {

		modalSegue.unwind();
	});
	
};
},{"../index.js":2,"sioux-ui-button":3}],2:[function(require,module,exports){
(function(){var inherits = require('inherits');
var events = require('events');
var fs = require('fs');
var insertCss = require('insert-css');
var UI = require('sioux-ui');

//var html = fs.readFileSync(__dirname + '/struct.html');
var css = ".ui-window[data-segue=\"active\"], .ui-window[data-segue=\"left\"], .ui-window[data-segue=\"right\"] {\r\n\t-webkit-transition: -webkit-transform ease-in-out 0s;\r\n\r\n\t/*-webkit-transform-style: preserve-3d;*/\r\n}\r\n\r\n.ui-window[data-segue=\"active\"] {\r\n\tz-index: 20;\r\n}\r\n\r\n.ui-window[data-segue=\"left\"] {\r\n\t-webkit-transform: translate3d(-100%, 0, 0);\r\n\r\n\tz-index: 10;\r\n}\r\n\r\n.ui-window[data-segue=\"right\"] {\r\n\t-webkit-transform: translate3d(100%, 0, 0);\r\n\r\n\tz-index: 10;\r\n}\r\n\r\n.ui-window[data-segue=\"modal\"] {\r\n\tz-index: 40;\r\n\t\r\n\tbackground: pink;\r\n\t-webkit-transition: -webkit-transform ease-in-out .4s;\t\r\n\t-webkit-transform: translate3d(0, 100%, 0);\r\n}";
insertCss(css);

function Segue (type, element) {
	this.element = element;

	this.state = 'AVAILABLE';
	this.DURATION = '.35s';
	this.type = type || 'push';

	if (this.type === 'modal') {
		this.modal = element.querySelector('.ui-window[data-segue="modal"]');
	}
	else if (this.type === 'push') {
		this.active = element.querySelector('.ui-window[data-segue="active"]');
		this.right = element.querySelector('.ui-window[data-segue="right"]');
		this.left = element.querySelector('.ui-window[data-segue="left"]');
	}
}

inherits(Segue, UI);

var pushWind = function () {
	var self = this;

	if (self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.emit('rightWillAppear', self.right);
	self.active.style.webkitTransitionDuration = self.DURATION;
	self.active.style.webkitTransform = 'translate3d(-100%, 0, 0)';
	self.right.style.webkitTransitionDuration = self.DURATION;
	self.right.style.webkitTransform = 'translate3d(0, 0, 0)';

	var activeHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;
		
		self.emit('leftPopped', self.left, event);
		self.emit('rightDidAppear', self.right, event);

		var tmp = self.left;
		self.left = self.active;
		self.active = self.right;
		self.right = tmp;
		this.style.webkitTransitionDuration = '0s';
		this.setAttribute('data-segue', 'left');

		this.removeEventListener('webkitTransitionEnd', activeHandler);
	};
	self.active.addEventListener('webkitTransitionEnd', activeHandler, false);

	var rightHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;

		this.webkitTransitionDuration = '0s';
		this.setAttribute('data-segue', 'active');
		setTimeout(function () {
			self.right.setAttribute('data-segue', 'right');
			self.state = 'AVAILABLE';

			if (self.callback) self.callback.call(self);
			self.callback = undefined;
		}, 1);
		this.removeEventListener('webkitTransitionEnd', rightHandler);
	};
	self.right.addEventListener('webkitTransitionEnd', rightHandler, false);
};

var pushUnwind = function () {
	var self = this;

	if (self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.emit('leftWillAppear', self.left);
	self.active.style.webkitTransitionDuration = self.DURATION;
	self.active.style.webkitTransform = 'translate3d(100%, 0, 0)';
	self.left.style.webkitTransitionDuration = self.DURATION;
	self.left.style.webkitTransform = 'translate3d(0, 0, 0)';

	var activeHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;
		
		self.emit('rightPopped', self.right, event);
		self.emit('leftDidAppear', self.left, event);
		var tmp = self.right;
		self.right = self.active;
		self.active = self.left;
		self.left = tmp;
		this.style.webkitTransitionDuration = '0s';
		this.setAttribute('data-segue', 'right');
	
		this.removeEventListener('webkitTransitionEnd', activeHandler);
	};
	self.active.addEventListener('webkitTransitionEnd', activeHandler, false);

	var leftHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;

		this.webkitTransitionDuration = '0s';
		this.setAttribute('data-segue', 'active');
		setTimeout(function () {
			self.left.setAttribute('data-segue', 'left');
			self.state = 'AVAILABLE';

			if (self.callback) self.callback.call(self);
			self.callback = undefined;
		}, 1);

		this.removeEventListener('webkitTransitionEnd', leftHandler);
	}; 
	self.left.addEventListener('webkitTransitionEnd', leftHandler, false);
};

var modalWind = function () {
	var self = this;

	if (self.modal.style.webkitTransform === 'translate3d(0, 0px, 0)' || self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.modal.style.webkitTransitionDuration = self.DURATION;
	self.modal.style.webkitTransform = 'translate3d(0, 0, 0)';
	self.emit('modalWillAppear', self.modal);

	var modalHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;
		
		self.emit('modalDidAppear', self.modal, event);
		self.state = 'AVAILABLE';

		this.removeEventListener('webkitTransitionEnd', modalHandler);

		if (self.callback) self.callback.call(self);
		self.callback = undefined;
	};
	self.modal.addEventListener('webkitTransitionEnd', modalHandler, false);
};

var modalUnwind = function () {
	var self = this;

	if (self.modal.style.webkitTransform === 'translate3d(0, 100%, 0)' || self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.modal.style.webkitTransitionDuration = self.DURATION;
	self.modal.style.webkitTransform = 'translate3d(0, 100%, 0)';

	var modalHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;
		
		self.emit('modalDidDisappear', self.modal, event);
		self.state = 'AVAILABLE';

		this.removeEventListener('webkitTransitionEnd', modalHandler);

		if (self.callback) self.callback.call(self);
		self.callback = undefined;
	};
	self.modal.addEventListener('webkitTransitionEnd', modalHandler, false);
};

Segue.prototype.wind = function () {
	if (this.type === 'push') {
		pushWind.call(this);
	}
	else if (this.type === 'modal') {
		modalWind.call(this);
	}

	return this;
};

Segue.prototype.unwind = function () {
	if (this.type === 'push') {
		pushUnwind.call(this);
	}
	else if (this.type === 'modal') {
		modalUnwind.call(this);	
	}

	return this;
};

Segue.prototype.then = function (fn) {
	this.callback = fn;

	return this;
};


module.exports = Segue;
})()
},{"events":4,"fs":5,"inherits":6,"sioux-ui":7,"insert-css":8}],6:[function(require,module,exports){
module.exports = inherits

function inherits (c, p, proto) {
  proto = proto || {}
  var e = {}
  ;[c.prototype, proto].forEach(function (s) {
    Object.getOwnPropertyNames(s).forEach(function (k) {
      e[k] = Object.getOwnPropertyDescriptor(s, k)
    })
  })
  c.prototype = Object.create(p.prototype, e)
  c.super = p
}

//function Child () {
//  Child.super.call(this)
//  console.error([this
//                ,this.constructor
//                ,this.constructor === Child
//                ,this.constructor.super === Parent
//                ,Object.getPrototypeOf(this) === Child.prototype
//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))
//                 === Parent.prototype
//                ,this instanceof Child
//                ,this instanceof Parent])
//}
//function Parent () {}
//inherits(Child, Parent)
//new Child

},{}],8:[function(require,module,exports){
var inserted = [];

module.exports = function (css) {
    if (inserted.indexOf(css) >= 0) return;
    inserted.push(css);
    
    var elem = document.createElement('style');
    var text = document.createTextNode(css);
    elem.appendChild(text);
    
    if (document.head.childNodes.length) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
    }
    else {
        document.head.appendChild(elem);
    }
};

},{}],5:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}],9:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":9}],3:[function(require,module,exports){
var inherits = require('inherits');
var fs = require('fs');
var insertCss = require('insert-css');
var UI = require('sioux-ui');

function initStates (self) {
	self.on('touchstart', function (event) {
		//event.preventDefault();
		self.element.classList.add('active');
	});

	var endingFn = function (event) {
		self.element.classList.remove('active');
	};

	self.on('touchend', endingFn);
	self.on('touchcancel', endingFn);
	self.on('touchleave', endingFn);
}


function UIButton (element) {
	this.element = element;
	this.spawnEvents();

	initStates(this);

	return this;
}

inherits(UIButton, UI);

var css = "button, input[type=\"submit\"], input[type=\"button\"], .button {\r\n\tfont-family: Verdana, sans-serif;\r\n\tfont-size: 14px;\r\n\tcolor: black;\r\n\r\n\tbackground: whiteSmoke;\r\n\r\n\tpadding: 10px 16px;\r\n\r\n\tbox-shadow: 1px 1px 3px #CCC;\r\n\r\n\tborder: none;\r\n\tborder-radius: 30px;\r\n\t-webkit-transition: -webkit-transform 85ms ease-in-out;\r\n}\r\n\r\nbutton.active, input[type=\"submit\"].active, input[type=\"button\"].active, .button.active {\r\n\t-webkit-transform: scale3d(.92, .92, 0);\r\n}";
insertCss(css);

module.exports = UIButton;
},{"fs":5,"insert-css":10,"inherits":11,"sioux-ui":12}],7:[function(require,module,exports){
var inherits = require('inherits');
var events = require('events');
var fs = require('fs');
var insertCss = require('insert-css');

function isInBounds (touch, element) {
	var left   = element.offsetLeft
		, top    = element.offsetTop
		, right  = left + element.offsetWidth
		, bottom = top + element.offsetHeight
	;
	return (touch.pageX > left && touch.pageX < right && touch.pageY > top && touch.pageY < bottom);
}

function applyCss (element, key, value) {
	element.setProperty(key, value);
}

function UI (element) {
	this.element = element;

	this.spawnEvents();
}

inherits(UI, events.EventEmitter);

var css = "body {\r\n\tmargin: 0;\r\n}\r\n\r\n.screen {\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\r\n\toverflow: hidden;\r\n}\r\n\r\n.ui-window {\r\n\tposition: fixed;\r\n\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\r\n\tdisplay: inline-block;\r\n\r\n\toverflow: auto; \r\n\t-webkit-overflow-scrolling: touch;\r\n}";
insertCss(css);

UI.prototype.spawnEvents = function () {
	this._tapStartTouch = { pageX: undefined, pageY: undefined };
	this.TAP_BOUND_X = 15;
	this.TAP_BOUND_Y = 15;
	var self = this;
	var element = self.element;

	// Adding built-in touch events

	element.addEventListener('touchstart', function (event) {
		self.emit('touchstart', event, element);
	}, false);
	element.addEventListener('touchmove', function (event) {
		self.emit('touchmove', event, element);
	}, false);
	element.addEventListener('touchend', function (event) {
		self.emit('touchend', event, element);
	}, false);
	element.addEventListener('touchcancel', function (event) {
		self.emit('touchcancel', event, element);
	}, false);

	// Custom touch events

	// Touch leave event
	var touchleaveHandler = function (event) {
		event.preventDefault();
		var touch = event.touches[0] || event.changedTouches[0];
		if (!isInBounds(touch, element)) {
			self.emit('touchleave', event, element);
			element.removeEventListener('touchmove', touchleaveHandler, false);
		}
	};

	element.addEventListener('touchmove', touchleaveHandler, false);
	element.addEventListener('touchend', function (event) {
		element.addEventListener('touchmove', touchleaveHandler, false);
	}, false);

	// Tap event
	element.addEventListener('touchstart', function (event) {
		self._tapStartTouch.pageX = event.changedTouches[0].pageX;
		self._tapStartTouch.pageY = event.changedTouches[0].pageY;
	}, false);

	var tapTouchLeaveHandler = function (event) {
		self._tapStartTouch.pageX = undefined;
		self._tapStartTouch.pageY = undefined;
	};
	self.on('touchleave', tapTouchLeaveHandler, false);
	element.addEventListener('touchcancel', tapTouchLeaveHandler, false);

	element.addEventListener('touchend', function (event) {
		if (!self._tapStartTouch.pageX && !self._tapStartTouch.pageY) return;

		var x = Math.abs(event.changedTouches[0].pageX - self._tapStartTouch.pageX);
		var y = Math.abs(event.changedTouches[0].pageY - self._tapStartTouch.pageY);

		if (x < self.TAP_BOUND_X && y < self.TAP_BOUND_Y) self.emit('tap', event, element);

		self._tapStartTouch.pageX = undefined;
		self._tapStartTouch.pageY = undefined;
	}, false);

	return self;
};

UI.prototype.css = function (key, value) {
	if ((typeof key) === 'string' && value) applyCss(this.element, key, value);
	else  if ((typeof key) === 'string')
		return element.style.getPropertyValue(key);
	else
		for (var k in key) applyCss(this.element, k, key[k]);

	return this;
};

module.exports = UI;
},{"events":4,"fs":5,"inherits":6,"insert-css":8}],10:[function(require,module,exports){
var inserted = [];

module.exports = function (css) {
    if (inserted.indexOf(css) >= 0) return;
    inserted.push(css);
    
    var elem = document.createElement('style');
    var text = document.createTextNode(css);
    elem.appendChild(text);
    
    if (document.head.childNodes.length) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
    }
    else {
        document.head.appendChild(elem);
    }
};

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
var inherits = require('inherits');
var events = require('events');
var fs = require('fs');
var insertCss = require('insert-css');

function isInBounds (touch, element) {
	var left   = element.offsetLeft
		, top    = element.offsetTop
		, right  = left + element.offsetWidth
		, bottom = top + element.offsetHeight
	;
	return (touch.pageX > left && touch.pageX < right && touch.pageY > top && touch.pageY < bottom);
}

function applyCss (element, key, value) {
	element.setProperty(key, value);
}

function UI (element) {
	this.element = element;

	this.spawnEvents();
}

inherits(UI, events.EventEmitter);

var css = "body {\r\n\tmargin: 0;\r\n}\r\n\r\n.screen {\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\r\n\toverflow: hidden;\r\n}\r\n\r\n.ui-window {\r\n\tposition: fixed;\r\n\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\r\n\tdisplay: inline-block;\r\n\r\n\toverflow: auto; \r\n\t-webkit-overflow-scrolling: touch;\r\n}";
insertCss(css);

UI.prototype.spawnEvents = function () {
	this._tapStartTouch = { pageX: undefined, pageY: undefined };
	this.TAP_BOUND_X = 15;
	this.TAP_BOUND_Y = 15;
	var self = this;
	var element = self.element;

	// Adding built-in touch events

	element.addEventListener('touchstart', function (event) {
		self.emit('touchstart', event, element);
	}, false);
	element.addEventListener('touchmove', function (event) {
		self.emit('touchmove', event, element);
	}, false);
	element.addEventListener('touchend', function (event) {
		self.emit('touchend', event, element);
	}, false);
	element.addEventListener('touchcancel', function (event) {
		self.emit('touchcancel', event, element);
	}, false);

	// Custom touch events

	// Touch leave event
	var touchleaveHandler = function (event) {
		event.preventDefault();
		var touch = event.touches[0] || event.changedTouches[0];
		if (!isInBounds(touch, element)) {
			self.emit('touchleave', event, element);
			element.removeEventListener('touchmove', touchleaveHandler, false);
		}
	};

	element.addEventListener('touchmove', touchleaveHandler, false);
	element.addEventListener('touchend', function (event) {
		element.addEventListener('touchmove', touchleaveHandler, false);
	}, false);

	// Tap event
	element.addEventListener('touchstart', function (event) {
		self._tapStartTouch.pageX = event.changedTouches[0].pageX;
		self._tapStartTouch.pageY = event.changedTouches[0].pageY;
	}, false);

	var tapTouchLeaveHandler = function (event) {
		self._tapStartTouch.pageX = undefined;
		self._tapStartTouch.pageY = undefined;
	};
	self.on('touchleave', tapTouchLeaveHandler, false);
	element.addEventListener('touchcancel', tapTouchLeaveHandler, false);

	element.addEventListener('touchend', function (event) {
		if (!self._tapStartTouch.pageX && !self._tapStartTouch.pageY) return;

		var x = Math.abs(event.changedTouches[0].pageX - self._tapStartTouch.pageX);
		var y = Math.abs(event.changedTouches[0].pageY - self._tapStartTouch.pageY);

		if (x < self.TAP_BOUND_X && y < self.TAP_BOUND_Y) self.emit('tap', event, element);

		self._tapStartTouch.pageX = undefined;
		self._tapStartTouch.pageY = undefined;
	}, false);

	return self;
};

UI.prototype.css = function (key, value) {
	if ((typeof key) === 'string' && value) applyCss(this.element, key, value);
	else  if ((typeof key) === 'string')
		return element.style.getPropertyValue(key);
	else
		for (var k in key) applyCss(this.element, k, key[k]);

	return this;
};

module.exports = UI;
},{"events":4,"fs":5,"inherits":13,"insert-css":14}],13:[function(require,module,exports){
module.exports = inherits

function inherits (c, p, proto) {
  proto = proto || {}
  var e = {}
  ;[c.prototype, proto].forEach(function (s) {
    Object.getOwnPropertyNames(s).forEach(function (k) {
      e[k] = Object.getOwnPropertyDescriptor(s, k)
    })
  })
  c.prototype = Object.create(p.prototype, e)
  c.super = p
}

//function Child () {
//  Child.super.call(this)
//  console.error([this
//                ,this.constructor
//                ,this.constructor === Child
//                ,this.constructor.super === Parent
//                ,Object.getPrototypeOf(this) === Child.prototype
//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))
//                 === Parent.prototype
//                ,this instanceof Child
//                ,this instanceof Parent])
//}
//function Parent () {}
//inherits(Child, Parent)
//new Child

},{}],14:[function(require,module,exports){
var inserted = [];

module.exports = function (css) {
    if (inserted.indexOf(css) >= 0) return;
    inserted.push(css);
    
    var elem = document.createElement('style');
    var text = document.createTextNode(css);
    elem.appendChild(text);
    
    if (document.head.childNodes.length) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
    }
    else {
        document.head.appendChild(elem);
    }
};

},{}]},{},[1])
;