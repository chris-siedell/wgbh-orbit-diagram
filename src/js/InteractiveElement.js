/*
src/js/InteractiveElement.js
wgbh-orbit-diagram
astro.unl.edu
2019-06-30
*/


export default class InteractiveElement {


	constructor() {

		// Subclasses must meet the following requirements:

		// 1. Define the following constants in constructor:
		//	_DEFAULT_IMAGE_RADIUS
		//	_debugName
		// 2. Call super() at beginning and super._init() at ending of constructor.
		// 3. Define these methods:
		//	_drawHitAreas
		// 3b. Set these properties in _drawHitAreas:
		//	_maxMouseHitAreaDistance
		//	_maxTouchHitAreaDistance
		// 4. Create these SVG layers:
		//	_shadowed
		//	_focus
		//	_mouseHitArea
		//	_touchHitArea



		this._touchHitAreaFill = 'rgba(255, 0, 255, 0.5)';
		this._mouseHitAreaFill = 'rgba(0, 255, 0, 0)';


		// These get defined by the subclass.
		this._DEFAULT_IMAGE_RADIUS = 0;
		this._debugName = 'undefined';

		// The MIN_TOUCH_RADIUS constant is meant to provide guidance to the _drawHitAreas function
		//	so that the touch interaction areas are not too small.
		this._MIN_TOUCH_RADIUS = 24;

		// The parent OrbitDiagram takes responsibility for calculating the moon or earth's
		//	position, rotation, and scale.
		this._scale = 1;
		this._rotationDegrees = 0;

		// radius = scale * DEFAULT_IMAGE_RADIUS
		this._radius = 0;
	}

	_init() {

		this._focus.setAttribute('visibility', 'hidden');

		this._onMouseEnter = this._onMouseEnter.bind(this);
		this._onMouseLeaveLocal = this._onMouseLeaveLocal.bind(this);

		this._mouseHitArea.addEventListener('mouseenter', this._onMouseEnter);
		this._mouseHitArea.addEventListener('mouseleave', this._onMouseLeaveLocal);
	}


	/*
	**	Mouse Roll-Over Handlers
	*/

	_onMouseEnter() {
		console.log(this._debugName + ' on mouse enter');
	}

	_onMouseLeaveLocal() {
		console.log(this._debugName + ' on mouse leave local');
	}

	getElement() {
		return this._outerGroup;
	}

	setScale(scale) {
		this._scale = scale;
		this._radius = this._scale * this._DEFAULT_IMAGE_RADIUS;
		this._redrawHitAreas();
		this._updateInnerTransform();
	}

	setPosition(x, y) {
		this._outerGroup.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
	}

	setRotation(degrees) {
		this._rotationDegrees = degrees;
		this._updateInnerTransform();
	}

	_updateInnerTransform() {
		let transform = 'rotate(' + this._rotationDegrees + ', 0, 0) scale(' + this._scale + ')';
		this._innerGroup.setAttribute('transform', transform);
	}
}


