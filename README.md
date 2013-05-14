# Sioux UISegue

``` batch
npm install sioux-ui-segue
```

Push and modal segue for sioux. [demo](http://felix.lovassy.hu/projects/gellert/sioux/segueexample/)

### Inherits from
* [Sioux UI](https://github.com/gerhardberger/sioux-ui)

### Create
``` js
var UISegue = require('sioux-ui-segue');
var segue = new UISegue('push', document.querySelector('.screen'));
// first argument: type of segue
// second argument: the element segue is performed in

segue.wind();
```

### HTML
##### push
``` html
<div class="screen">
  <div class="ui-window foo" data-segue="active"></div>
  <div class="ui-window bar" data-segue="left"></div>
  <div class="ui-window baz" data-segue="right"></div>
</div>
```
##### modal
``` html
<div class="screen">
  <div class="ui-window mod" data-segue="modal"></div>
</div>
```

### Properties
* __state__: `UNAVAILABLE` if the animation is going on, or `AVAILABLE`
* __DURATION__: the duration of the transition
* __type__: the type of the segue, `push` or  `modal`

### Methods
##### .wind()
If the segue is `push`, the current window in the middle will go to the left and the one on the right will go to the middle. If the segue is `modal`, the modal goes up.

##### .unwind()
If the segue is `push`, the current window in the middle will go to the right and the one on the left will go to the middle. If the segue is `modal`, the modal goes down.

### Events
* __.on('rightWillAppear', function(rightElement) {})__
* __.on('leftWillAppear', function(leftElement) {})__
* __.on('leftPopped', function(leftElement, event) {})__
* __.on('rightPopped', function(rightElement, event) {})__
* __.on('rightDidAppear', function(rightElement, event) {})__
* __.on('leftDidAppear', function(leftElement, event) {})__
* __.on('modalDidDisappear', function(modalElement, event) {})__