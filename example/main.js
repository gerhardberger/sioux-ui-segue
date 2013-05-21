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