/*
src/js/InteractiveElement.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-10
*/



const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';

/*

The dragging code here borrows heavily from the DraggableItemMixin in phase-positions-demo. One feature
	of that mixin that was not copied is "competing drag items". That feature is not necessary unless the
	diagram is drawn at such a scale that the earth and moon hit areas overlap.

*/



export default class InteractiveElement {


	constructor(coordinator, orbitDiagram) {

		// parent is the OrbitDiagram instance that created the object.
		this._coordinator = coordinator;
		this._orbitDiagram = orbitDiagram;

		this.TYPE_MOUSE = 'mouse';
		this.TYPE_TOUCH = 'touch';
		this.TYPE_NONE = 'none';

		this._hintArcLength = 80;
		this._hintArcWidth = 14;
		this._hintArcFill = 'white';
		this._hintArcStroke = 'rgba(190, 190, 190, 1)';
		this._hintArcStrokeWidth = 3;


		this._focusStroke = 'white';
		this._focusStrokeWidth = 6;
		this._focusStrokeOffset = 6;

		this._highlightFill = 'rgba(255, 255, 255, 0.5)';





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


		this._MAX_BACKUP_TOUCH_DISTANCE = 80;


		// The parent OrbitDiagram takes responsibility for calculating the moon or earth's
		//	position, rotation, and scale.
		this._scale = 1;
		this._rotationDegrees = 0;

		// radius = scale * DEFAULT_IMAGE_RADIUS
		this._radius = 0;
		
		this._x = 0;
		this._y = 0;

		this._unshadowedBehind = document.createElementNS(svgNS, 'g');
		this._unshadowed = document.createElementNS(svgNS, 'g');
		this._unshadowedAndUnscaled = document.createElementNS(svgNS, 'g');


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

		this._onMouseEnter = this._onMouseEnter.bind(this);
		this._onMouseLeaveLocal = this._onMouseLeaveLocal.bind(this);

		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseFinished = this._onMouseFinished.bind(this);

		this._onTouchStart = this._onTouchStart.bind(this);
		this._onTouchMove = this._onTouchMove.bind(this);
		this._onTouchFinished = this._onTouchFinished.bind(this);


		// SVG

		this._outerGroup = document.createElementNS(svgNS, 'g');

		this._innerGroup = document.createElementNS(svgNS, 'g');


		let highlightFilter = document.createElementNS(svgNS, 'filter');
		highlightFilter.setAttribute('id', identity+'-highlight-filter');

		let blur = document.createElementNS(svgNS, 'feGaussianBlur');
		blur.setAttribute('in', 'SourceGraphic');
		blur.setAttribute('stdDeviation', 5);
		highlightFilter.appendChild(blur);

		this._outerGroup.appendChild(highlightFilter);
		this._outerGroup.appendChild(this._highlight);
		this._highlight.setAttribute('filter', 'url(#'+identity+'-highlight-filter)');


//		this._hint.setAttribute('filter', 'url(#'+identity+'-highlight-filter)');

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

		this._innerGroup.appendChild(this._unshadowedBehind);
		this._innerGroup.appendChild(this._shadowed);

		this._innerGroup.appendChild(this._unshadowed);

		this._interactive = document.createElementNS(svgNS, 'g');
		this._innerGroup.appendChild(this._interactive);

		this._outerGroup.appendChild(this._innerGroup);
		this._outerGroup.appendChild(this._unshadowedAndUnscaled);
		this._outerGroup.appendChild(this._focus);

		this._interactive.appendChild(this._touchHitArea);
		this._interactive.appendChild(this._mouseHitArea);

		this._cursor = null;
		//this._mouseHitArea.style.cursor = this._cursor;

		this._showHighlight = true;//false;
		this._highlight.setAttribute('visibility', 'visible');//'hidden');

		this._createImage();
		this._createShadow();

		this._shadowed.appendChild(this._image);
		this._shadowed.appendChild(this._shadow);

		// Always-on Event Listeners
		this._mouseHitArea.addEventListener('mouseenter', this._onMouseEnter);
		this._mouseHitArea.addEventListener('mouseleave', this._onMouseLeaveLocal);

		this._mouseHitArea.addEventListener('mousedown', this._onMouseDown);
		this._interactive.addEventListener('touchstart', this._onTouchStart);


		// Tab
		this._outerGroup.classList.add('wgbh-orbit-diagram-element-focusarea');

		this._isTabable = null;
		this._isFocused = false;
		this._showFocusRing = null;

		this._onFocus = this._onFocus.bind(this);
		this._onBlur = this._onBlur.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);

		this._outerGroup.addEventListener('focusin', this._onFocus);
		this._outerGroup.addEventListener('focusout', this._onBlur);

		this.updateAppearance();

	}


	dismissHint() {
		this._hint.classList.add('wgbh-orbit-diagram-hints-dismissed');
	}


	_onKeyDown(e) {

		if (!this._isFocused) {
			console.error('Key down detected for an orbit diagram element that is not focused.');
			return;
		}

		if (!this._coordinator.getIsDraggingAllowed()) {
			console.error('Key down detected for an orbit diagram element when interactivity is not allowed.');
			return;
		}

		if (this._coordinator.getIsDraggingInProgress()) {
			console.warn('Key down detected during dragging. Will ignore.');
			return;
		}

		let deltaObj = this._getDeltaObjForKey(e.key);
		if (deltaObj !== null) {
			e.preventDefault();
			deltaObj.doAnimation = false;
			this._orbitDiagram._timekeeper.setTimeByDelta(deltaObj);
		}
	}

	_onFocus(e) {
	//	console.log(this._identity + ' focus');
		this._isFocused = true;
		this._outerGroup.addEventListener('keydown', this._onKeyDown);
		this.updateAppearance();
	}

	_onBlur(e) {
	//	console.log(this._identity + ' blur');
		this._isFocused = false;
		this._outerGroup.removeEventListener('keydown', this._onKeyDown);
		this.updateAppearance();
	}

	makeFocused() {
		if (!this._isFocused) {
			this._outerGroup.focus();
		}
	}

	removeFocus() {
		if (this._isFocused) {
			this._outerGroup.blur();
		}
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
		this._x = x;
		this._y = y;
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
		this._unshadowedBehind.setAttribute('transform', rotate);
		this._unshadowed.setAttribute('transform', rotate);
		this._unshadowedAndUnscaled.setAttribute('transform', rotate);
		this._focus.setAttribute('transform', rotate);
		this._highlight.setAttribute('transform', rotate);
		this._innerGroup.setAttribute('transform', scale);
	}


	/*
	**	Public Methods
	*/

	cancelDragging() {
		// It is safe to call this method even when not dragging.
		this._stopDragging();
	}


	/*
	**	Internal General Dragging Methods
	*/

	_startDragging(clientPt, type) {
		// Calling code must have already determined that dragging may be started.

//		console.group('_startDragging, type: '+type);
//		console.log('clientPt: '+clientPt.toString());
//		console.log('distance: ' + this._getDistanceOfClientPt(clientPt));
//		console.groupEnd();

		if (type === this.TYPE_MOUSE) {
			document.addEventListener('mousemove', this._onMouseMove);
			document.addEventListener('mouseup', this._onMouseFinished);
			document.addEventListener('mouseleave', this._onMouseFinished);
		} else if (type === this.TYPE_TOUCH) {
			document.addEventListener('touchmove', this._onTouchMove);
			document.addEventListener('touchend', this._onTouchFinished);
			document.addEventListener('touchcancel', this._onTouchFinished);
		} else {
			console.error('Unknown drag type.');
			return;
		}

		this._backupTouches = [];

		this._dragType = type;
		this._dragRotations = 0;
		this._dragInitOpaqueTime = this._orbitDiagram._timekeeper.getTime().opaqueTime;	
		this._calcDragAngleOffset(clientPt);	
		
		this._coordinator._onDragBegin(this);

		this.updateAppearance();
		this._otherElement.updateAppearance();

//		this.updateCursor();
//		this.updateHighlight();
//		this._otherElement.updateCursor();
//		this._otherElement.updateHighlight();
	}

	_calcDragAngleOffset(clientPt) {
		this._dragAngleOffset = this._getCurrAngle() - this._getAngleForClientPt(clientPt);
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
		let didStop = false;
		if (this._dragType === this.TYPE_MOUSE) {
			document.removeEventListener('mousemove', this._onMouseMove);
			document.removeEventListener('mouseup', this._onMouseFinished);
			document.removeEventListener('mouseleave', this._onMouseFinished);
			didStop = true;
		} else if (this._dragType === this.TYPE_TOUCH) {
			document.removeEventListener('touchmove', this._onTouchMove);
			document.removeEventListener('touchend', this._onTouchFinished);
			document.removeEventListener('touchcancel', this._onTouchFinished);
			didStop = true;
		}
		this._dragType = this.TYPE_NONE;
		if (didStop) {
			this._coordinator._onDragEnd(this);
			this.updateCursor();
			this.updateHighlight();
			this._otherElement.updateCursor();
			this._otherElement.updateHighlight();
		}
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
		// If a finite number is returned, then it is the distance of the client point
		//	to the item's hotspot. In this case, dragging may start on the item, but priority
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

			// TODO: ???

		} else {
			console.error('Unknown type.');
			return Number.POSITIVE_INFINITY;
		}

		return this._getDistanceOfClientPt(clientPt);
	}


	/*
	**	Mouse Dragging Handlers
	*/

	_onMouseDown(e) {
		let clientPt = {x: e.clientX, y: e.clientY};
		let bestScore = this._getDragInitScore(clientPt, this.TYPE_MOUSE);
		if (Number.isFinite(bestScore)) {
			e.preventDefault();
			this.makeFocused();
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
	**	Touch Dragging Handlers
	*/

	_onTouchStart(e) {
		// Multiple touches may start at the same time, and they may start
		//	during an ongoing dragging session.

		// Process the touches and populate the newTouches list. After this step
		//	newTouches contains objects with these properties:
		//		id - the new touch's identifier,
		//		clientPt - the new touch's location.
		// New touches that are excluded from dragging (i.e. have an infinite score) are
		//	not included in newTouches. It is possible that after this step newTouches
		//	will be empty.
		// Also, keep track of the best (lowest-scoring) new touch.

		let newTouches = [];
		let bestScore = Number.POSITIVE_INFINITY;
		let bestTouch = null;
		let bestIndex = -1;
		for (let touch of e.changedTouches) {
			let clientPt = {x: touch.clientX, y: touch.clientY};
			let score = this._getDragInitScore(clientPt, this.TYPE_TOUCH);
			if (Number.isFinite(score)) {
				let processedTouch = {
					id: touch.identifier,
					clientPt: clientPt,
				};
				let index = newTouches.push(processedTouch);
				if (score < bestScore) {
					bestScore = score;
					bestTouch = processedTouch;
					bestIndex = index;
				}
			}
		}

		if (newTouches.length === 0) {
			// Nothing to do.
			return;
		}

		// If already dragging the new touches will become backup touches. Otherwise, the
		//	best new touch will be used to start dragging and the rest (if any) will become
		//	backup touches.

		if (this.getIsBeingDragged()) {
			Array.prototype.push.apply(this._backupTouches, newTouches);
		} else {

			e.preventDefault();

			this._activeTouchId = bestTouch.id;
			this._startDragging(bestTouch.clientPt, this.TYPE_TOUCH);

			// _startDragging automatically resets the _backupTouches array.
			newTouches.splice(bestIndex, 1);
			Array.prototype.push.apply(this._backupTouches, newTouches);
		}		
	}

	_onTouchMove(e) {
		this._updateAnyBackupTouches(e.changedTouches);
		let touch = this._findActiveTouch(e.changedTouches);
		if (touch !== null) {
			e.preventDefault();
			this._updateDragging(touch.clientPt);
		}
	}

	_onTouchFinished(e) {
		this._stopTrackingAnyBackupTouches(e.changedTouches);
		let touch = this._findActiveTouch(e.changedTouches);
		if (touch !== null) {
			// The active touch has finished.
			let success = this._switchToBackupTouch();
			if (!success) {
				this._stopDragging();
			}
		}
	}


	/*
	**	Touch Helper Methods
	*/

	_switchToBackupTouch() {
		// This method finds the best, qualifying backup touch and makes it the
		//	active touch, assuming such a touch was found. It returns a bool
		//	indicating whether the switch was made.
		// This method assumes touch dragging is already ongoing.
		// The best touch will be the closest touch to the element whose distance
		//	is also less than the maximum backup touch distance. It is possible that
		//	there is no suitable backup touch.

		let bestDistance = Number.POSITIVE_INFINITY;
		let bestTouch = null;
		let bestIndex = -1;

		for (let i = 0; i < this._backupTouches.length; ++i) {
			let touch = this._backupTouches[i];
			let distance = this._getDistanceOfClientPt(touch.clientPt);
			if (distance <= this._MAX_BACKUP_TOUCH_DISTANCE) {
				// The backup touch is qualifying.
				if (distance < bestDistance) {
					bestDistance = distance;
					bestTouch = touch;
					bestIndex = i;
				}
			}
		}

		if (bestTouch !== null) {
			this._backupTouches.splice(bestIndex, 1);
			this._activeTouchId = bestTouch.id;
			this._calcDragAngleOffset(bestTouch.clientPt);
			return true;
		} else {
			return false;
		}
	}

	_stopTrackingAnyBackupTouches(touchList) {
		// This method removes any of the given touches from the backup touches array.
		for (let i = this._backupTouches.length - 1; i >= 0; --i) {
			let id = this._backupTouches[i].id;
			for (let touch of touchList) {
				if (touch.identifier === id) {
					this._backupTouches.splice(i, 1);
					break;
				}
			}
		}
	}

	_updateAnyBackupTouches(touchList) {
		// This method updates the positions any of the given touches that are also
		//	in the backup touches array.
		for (let touch of touchList) {
			for (let backupTouch of this._backupTouches) {
				if (touch.identifier === backupTouch.id) {
					backupTouch.clientPt = {x: touch.clientX, y: touch.clientY};
					break;
				}
			}
		}
	}

	_findActiveTouch(touchList) {
		// This method searches the given touchList and returns the active touch as an object
		//	with id and clientPt properties, if found. Otherwise, null is returned.
		for (let touch of touchList) {
			if (touch.identifier === this._activeTouchId) {
				return {
					id: this._activeTouchId,
					clientPt: {x: touch.clientX, y: touch.clientY},
				};
			}
		}
		return null;
	}


	/*
	**	Roll-Over Handlers and Methods
	*/

	getIsMouseOver() {
		return this._isMouseOver;
	}

	_onMouseEnter() {
		this._isMouseOver = true;
		this.updateCursor();
		this.updateHighlight();
	}

	_onMouseLeaveLocal() {
		this._isMouseOver = false;
		this.updateCursor();
		this.updateHighlight();
	}

//	getIsRollOverHighlightVisible() {
//		return this._isRollOverHighlightVisible;
//	}


	updateAppearance() {
		this.updateFocus();
		this.updateHighlight();
		this.updateCursor();
	}

	updateCursor() {
		let cursor = null; // null means no cursor request for this element
		if (this._dragType === this.TYPE_MOUSE) {
			cursor = 'grabbing';
		} else if (this._isMouseOver && this._coordinator.getCanDragStartOnElement(this)) {
			cursor = 'grab';
		}
		if (cursor === this._cursor) {
			return;
		}
		this._cursor = cursor;
		this._coordinator.setCursor(this._identity, cursor);
	}

	updateHighlight() {
		// Rules for the highlight:
		//	- appears for mouse roll-over when dragging is allowed,
		//	- appears when dragging is ongoing,
		//	- stays on for the duration of dragging, even if the pointer moves off the element,
		//	- but is not shown simultaneously with focus ring.
		let showHighlight = false;
		if (this.getIsBeingDragged()) {
			showHighlight = true;
		} else if (this._isMouseOver && this._coordinator.getCanDragStartOnElement(this)) {
			showHighlight = true;
		}
		if (this._showFocusRing) {
			showHighlight = false;
		}
		if (showHighlight === this._showHighlight) {
			return;
		}
		this._showHighlight = showHighlight;
		if (this._showHighlight) {
			this._highlight.setAttribute('visibility', 'visible');
		} else {
			this._highlight.setAttribute('visibility', 'hidden');
		}
	}

	updateFocus() {
		let isTabable = this._coordinator.getIsDraggingAllowed();
		let showFocusRing = this._isFocused;
		if (isTabable !== this._isTabable) {
			this._isTabable = isTabable;
			if (this._isTabable) {
				this._outerGroup.tabIndex = 0;
			} else {
				this._outerGroup.tabIndex = -1;
			}
		}
		if (showFocusRing !== this._showFocusRing) {
			this._showFocusRing = showFocusRing;
			if (this._showFocusRing) {
				this._focus.setAttribute('visibility', 'visible');
			} else {
				this._focus.setAttribute('visibility', 'hidden');
			}
		}
	}

}


