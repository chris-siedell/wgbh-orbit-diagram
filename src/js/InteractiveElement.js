/*
src/js/InteractiveElement.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-01
*/



const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';




export default class InteractiveElement {


	constructor(coordinator, orbitDiagram) {

		// parent is the OrbitDiagram instance that created the object.
		this._coordinator = coordinator;
		this._orbitDiagram = orbitDiagram;

		this.TYPE_MOUSE = 'mouse';
		this.TYPE_TOUCH = 'touch';
		this.TYPE_NONE = 'none';

		// Subclasses must do the following:

		// 1. Define the following constants in constructor:
		//	_DEFAULT_IMAGE_RADIUS
		// 2. Call super() at beginning and super._initAs(identity) at ending of constructor.
		// 3. Define these methods:
		//	_drawHitAreas
		//	_getAngleForClientPt
		//	_getCurrAngle
		//	_getDeltaObjForRotations
		// 3b. Set these properties in _drawHitAreas:
		//	_maxMouseHitAreaDistance
		//	_maxTouchHitAreaDistance
		// 4. Create these unattached SVG layers:

		//	_image

		//	_shadowed
		//	_mouseHitArea
		//	_touchHitArea

		// Create and attach images, etc. to _shadowedAndMasked.


		//	_shadowed
		//	_focus



		this._isMouseOver = false;

		this._touchHitAreaFill = 'rgba(255, 0, 255, 0)';
		this._mouseHitAreaFill = 'rgba(0, 255, 0, 0)';
		

		// These get defined by the subclass.
		this._DEFAULT_IMAGE_RADIUS = 0;

		// The MIN_TOUCH_RADIUS constant is meant to provide guidance to the _drawHitAreas function
		//	so that the touch interaction areas are not too small.
		this._MIN_TOUCH_RADIUS = 24;

		// The parent OrbitDiagram takes responsibility for calculating the moon or earth's
		//	position, rotation, and scale.
		this._scale = 1;
		this._rotationDegrees = 0;

		// radius = scale * DEFAULT_IMAGE_RADIUS
		this._radius = 0;
		

		this._unshadowed = document.createElementNS(svgNS, 'g');
	}

	_initAs(identity) {
		// identity must be 'moon' or 'earth'.

		this._identity = identity;
		if (identity === 'moon') {
			this._coordinator.registerMoon(this);
		} else if (identity === 'earth') {
			this._coordinator.registerEarth(this);
		} else {
			throw new Error('Unknown identity.');
		}

		// These properties must stay in sync.
		this._isRollOverHighlightVisible = false;
//		this._focus.setAttribute('visibility', 'hidden');

		this._onMouseEnter = this._onMouseEnter.bind(this);
		this._onMouseLeaveLocal = this._onMouseLeaveLocal.bind(this);
		this._onMouseDown = this._onMouseDown.bind(this);

		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseFinished = this._onMouseFinished.bind(this);


		// SVG

		this._outerGroup = document.createElementNS(svgNS, 'g');

		this._innerGroup = document.createElementNS(svgNS, 'g');
		this._outerGroup.appendChild(this._innerGroup);

		this._shadowed = document.createElementNS(svgNS, 'g');

		this._shadowedMask = document.createElementNS(svgNS, 'mask');
		this._shadowedMask.setAttribute('id', identity+'-shadowed-mask');
		this._innerGroup.appendChild(this._shadowedMask);

		this._shadowedMaskCircle = document.createElementNS(svgNS, 'circle');
		this._shadowedMaskCircle.setAttribute('cx', 0);
		this._shadowedMaskCircle.setAttribute('cy', 0);
		this._shadowedMaskCircle.setAttribute('r', this._DEFAULT_IMAGE_RADIUS);
		this._shadowedMaskCircle.setAttribute('fill', 'white');
		this._shadowedMask.appendChild(this._shadowedMaskCircle);

		this._shadowed.setAttribute('mask', 'url(#'+identity+'-shadowed-mask)');
		this._innerGroup.appendChild(this._shadowed);

		this._innerGroup.appendChild(this._unshadowed);

		this._interactive = document.createElementNS(svgNS, 'g');
		this._innerGroup.appendChild(this._interactive);

		this._interactive.appendChild(this._touchHitArea);
		this._interactive.appendChild(this._mouseHitArea);

		this._createImage();
		this._createShadow();

		this._shadowed.appendChild(this._image);
		this._shadowed.appendChild(this._shadow);

		// Always-on Event Listeners
		this._mouseHitArea.addEventListener('mouseenter', this._onMouseEnter);
		this._mouseHitArea.addEventListener('mouseleave', this._onMouseLeaveLocal);

		this._mouseHitArea.addEventListener('mousedown', this._onMouseDown);
	}

	_createShadow() {
		let D = this._DEFAULT_IMAGE_RADIUS + 5;
		this._shadow = document.createElementNS(svgNS, 'rect');
		this._shadow.setAttribute('fill', 'rgba(0, 0, 0, 0.6)');
		this._shadow.setAttribute('x', 0);
		this._shadow.setAttribute('y', -D);
		this._shadow.setAttribute('rx', 0);
		this._shadow.setAttribute('ry', 0);
		this._shadow.setAttribute('width', D);
		this._shadow.setAttribute('height', 2*D);
	}

	_createImage() {
		this._image = document.createElementNS(svgNS, 'image');
		this._image.setAttribute('width', 2*this._DEFAULT_IMAGE_RADIUS);
		this._image.setAttribute('height', 2*this._DEFAULT_IMAGE_RADIUS);
		this._image.setAttribute('x', -this._DEFAULT_IMAGE_RADIUS);
		this._image.setAttribute('y', -this._DEFAULT_IMAGE_RADIUS);
		this._image.setAttributeNS(xlinkNS, 'href', this._imageURL);
	}

	getElement() {
		return this._outerGroup;
	}

	setScale(scale) {
		this._scale = scale;
		this._radius = this._scale * this._DEFAULT_IMAGE_RADIUS;
		this._redrawHitAreas();
		this._updateInnerTransforms();
	}

	setPosition(x, y) {
		this._outerGroup.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
	}

	setRotation(degrees) {
		this._rotationDegrees = degrees;
		this._updateInnerTransforms();
	}

	_updateInnerTransforms() {
		let rotate = 'rotate(' + this._rotationDegrees + ', 0, 0)';
		let scale = 'scale(' + this._scale + ')';
		this._image.setAttribute('transform', rotate);
		this._interactive.setAttribute('transform', rotate);
		this._unshadowed.setAttribute('transform', rotate);
		this._innerGroup.setAttribute('transform', scale);
	}


	/*
	**	Dragging
	*/

	cancelDragging() {
		console.log(this._identity+': cancelDragging');
		this._stopDragging();
	}

	_startDragging(clientPt, type) {

		if (type === this.TYPE_MOUSE) {
			document.addEventListener('mousemove', this._onMouseMove);
			document.addEventListener('mouseup', this._onMouseFinished);
			document.addEventListener('mouseleave', this._onMouseFinished);
		} else if (type === this.TYPE_TOUCH) {

			throw new Error('not implemeneted');

		} else {
			console.error('Unknown drag type.');
			return;
		}

		this._dragType = type;

		this._dragInitOpaqueTime = this._orbitDiagram._timekeeper.getTime().opaqueTime;	
	
		this._dragAngleOffset = this._getCurrAngle() - this._getAngleForClientPt(clientPt);
		
		this._dragRotations = 0;
		
		this._coordinator._onDragBegin(this);
	}

	_updateDragging(clientPt) {

		let dragAngle = this._getAngleForClientPt(clientPt) + this._dragAngleOffset;
		let currAngle = this._getCurrAngle();
		
		let rotationsDelta = (dragAngle - currAngle) / (2*Math.PI);
		rotationsDelta = (rotationsDelta%1 + 1)%1;
		if (rotationsDelta > 0.5) {
			rotationsDelta -= 1;
		}

		this._dragRotations += rotationsDelta;

		let deltaObj = this._getDeltaObjForRotations(this._dragRotations);	
		deltaObj.baseOpaqueTime = this._dragInitOpaqueTime;
		deltaObj.doAnimation = false;

		this._orbitDiagram._timekeeper.setTimeByDelta(deltaObj);
	}


	_stopDragging() {
		if (this._dragType === this.TYPE_MOUSE) {
			document.removeEventListener('mousemove', this._onMouseMove);
			document.removeEventListener('mouseup', this._onMouseFinished);
			document.removeEventListener('mouseleave', this._onMouseFinished);
			this._coordinator._onDragEnd(this);
		} else if (this._dragType === this.TYPE_TOUCH) {
			throw new Error('not implemeneted');
			this._coordinator._onDragEnd(this);
		}
		this._dragType = this.TYPE_NONE;
	}

	getIsBeingDragged() {
		return this._dragType === this.TYPE_MOUSE || this._dragType === this.TYPE_TOUCH;
	}

	_getDragInitScore(clientPt, type) {
		// Given a client point and pointer type, this method returns a score to signify if dragging
		//	may initialize on the item, and if so, what priority should be given to this item among
		//	competing items. 'Initialize' means either starting dragging, or allowing the pointer (e.g. a touch)
		//	to be a backup for the item.
		// Specifically, this method returns either Number.POSITIVE_INFINITY or a finite number.
		// If POSITIVE_INFINITY is returned, dragging must not start on the item -- it is out of
		//	consideration.
		// If a finite number is returned, then it is the distance squared of the client point
		//	to the item's central hotspot. In this case, dragging may start on the item, but priority
		//	should be given to any competing items with lower scores.

		if (!this._coordinator.getCanDragInitOnElement(this)) {
			return Number.POSITIVE_INFINITY;
		}

		if (type === this.TYPE_MOUSE) {
			// Mouse dragging is exclusive, with no backups.
			if (this.getIsBeingDragged()) {
				return Number.POSITIVE_INFINITY;
			}
		} else if (type === this.TYPE_TOUCH) {

			throw new Error('not implemented');

		} else {
			console.error('Unknown type.');
			return Number.POSITIVE_INFINITY;
		}

		return 1;
	}


	/*
	**	Mouse Dragging Handlers
	*/

	_onMouseDown(e) {
		let clientPt = {x: e.clientX, y: e.clientY};
		let bestScore = this._getDragInitScore(clientPt, this.TYPE_MOUSE);
		if (Number.isFinite(bestScore)) {
			e.preventDefault();
			this._startDragging(clientPt, this.TYPE_MOUSE);
		}
	}

	_onMouseMove(e) {
		e.preventDefault();
		this._updateDragging({x: e.clientX, y: e.clientY});
	}

	_onMouseFinished(e) {
		e.preventDefault();
		this._stopDragging();
	}


	/*
	**	Roll-Over Handlers and Methods
	*/

	getIsMouseOver() {
		return this._isMouseOver;
	}

	_onMouseEnter() {
		this._isMouseOver = true;
		this._coordinator.updateRollOverHighlightForElement(this);
	}

	_onMouseLeaveLocal() {
		this._isMouseOver = false;
		this._coordinator.updateRollOverHighlightForElement(this);
	}

	getIsRollOverHighlightVisible() {
		return this._isRollOverHighlightVisible;
	}

	setIsRollOverHighlightVisible(arg) {
		arg = Boolean(arg);
		if (arg === this._isRollOverHighlightVisible) {
			return;
		}
		this._isRollOverHighlightVisible = arg;
//		if (this._isRollOverHighlightVisible) {
//			this._focus.setAttribute('visibility', 'visible');
//		} else {
//			this._focus.setAttribute('visibility', 'hidden');
//		}
	}

}


