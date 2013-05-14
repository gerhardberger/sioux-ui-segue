var inherits = require('inherits');
var events = require('events');
var fs = require('fs');
var insertCss = require('insert-css');
var UI = require('sioux-ui');

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

var css = fs.readFileSync(__dirname + '/style.css');
insertCss(css);

var pushWind = function () {
	var self = this;

	if (self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.emit('rightWillAppear', self.right);
	self.active.style.webkitTransitionDuration = self.DURATION;
	self.active.style.webkitTransform = 'translateX(-100%)';
	self.right.style.webkitTransitionDuration = self.DURATION;
	self.right.style.webkitTransform = 'translateX(0)';

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
	self.active.style.webkitTransform = 'translateX(100%)';
	self.left.style.webkitTransitionDuration = self.DURATION;
	self.left.style.webkitTransform = 'translateX(0)';

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
		}, 1);

		this.removeEventListener('webkitTransitionEnd', leftHandler);
	}; 
	self.left.addEventListener('webkitTransitionEnd', leftHandler, false);
};

var modalWind = function () {
	var self = this;

	if (self.modal.style.webkitTransform === 'translateY(0px)' || self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.modal.style.webkitTransitionDuration = self.DURATION;
	self.modal.style.webkitTransform = 'translateY(0)';
	self.emit('modalWillAppear', self.modal);

	var modalHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;
		
		self.emit('modalDidAppear', self.modal, event);
		self.state = 'AVAILABLE';

		this.removeEventListener('webkitTransitionEnd', modalHandler);
	};
	self.modal.addEventListener('webkitTransitionEnd', modalHandler, false);
};

var modalUnwind = function () {
	var self = this;

	if (self.modal.style.webkitTransform === 'translateY(100%)' || self.state === 'UNAVAILABLE') return;
	self.state = 'UNAVAILABLE';

	self.modal.style.webkitTransitionDuration = self.DURATION;
	self.modal.style.webkitTransform = 'translateY(100%)';

	var modalHandler = function (event) {
		if (event.propertyName !== '-webkit-transform') return;
		
		self.emit('modalDidDisappear', self.modal, event);
		self.state = 'AVAILABLE';

		this.removeEventListener('webkitTransitionEnd', modalHandler);
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
};

Segue.prototype.unwind = function () {
	if (this.type === 'push') {
		pushUnwind.call(this);
	}
	else if (this.type === 'modal') {
		modalUnwind.call(this);	
	}
};


module.exports = Segue;