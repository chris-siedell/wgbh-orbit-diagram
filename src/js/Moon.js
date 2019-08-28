/*
src/js/Moon.js
wgbh-orbit-diagram
astro.unl.edu
2019-08-27
*/


import MoonURL from '../graphics/Boston2_v1_moon-fixed.svg';

import CircularArcArrow from 'CircularArcArrow.js';

import InteractiveElement from './InteractiveElement.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Moon extends InteractiveElement {


	constructor(orbitDiagram) {
		super(orbitDiagram);

		this._DEFAULT_IMAGE_RADIUS = 14;//13.5;

		this._touchHitArea = document.createElementNS(svgNS, 'circle');
		this._mouseHitArea = document.createElementNS(svgNS, 'circle');

		this._imageURL = MoonURL;


		this._focus = document.createElementNS(svgNS, 'g');

		this._focusRing = document.createElementNS(svgNS, 'circle');
		this._focusRing.setAttribute('cx', 0);
		this._focusRing.setAttribute('cy', 0);
		this._focusRing.setAttribute('stroke', this._focusStroke);
		this._focusRing.setAttribute('stroke-width', this._focusStrokeWidth);
		this._focusRing.setAttribute('fill', 'none');
		this._focus.appendChild(this._focusRing);

		this._highlight = document.createElementNS(svgNS, 'g');
		this._highlightDisc = document.createElementNS(svgNS, 'circle');
		this._highlightDisc.setAttribute('fill', this._highlightFill);
		this._highlight.appendChild(this._highlightDisc);

		this._hint = document.createElementNS(svgNS, 'g');

		this._hintCWPath = document.createElementNS(svgNS, 'path');
		this._hintCWPath.setAttribute('fill', this._hintArcFill);
		this._hintCWPath.setAttribute('stroke', this._hintArcStroke);
		this._hintCWPath.setAttribute('stroke-width', this._hintArcStrokeWidth);
		this._hintCWPath.setAttribute('stroke-linejoin', 'round');
		this._hintCWPath.setAttribute('stroke-linecap', 'round');
		this._hint.appendChild(this._hintCWPath);
		
		this._hintCCWPath = document.createElementNS(svgNS, 'path');
		this._hintCCWPath.setAttribute('fill', this._hintArcFill);
		this._hintCCWPath.setAttribute('stroke', this._hintArcStroke);
		this._hintCCWPath.setAttribute('stroke-width', this._hintArcStrokeWidth);
		this._hintCCWPath.setAttribute('stroke-linejoin', 'round');
		this._hintCCWPath.setAttribute('stroke-linecap', 'round');
		this._hint.appendChild(this._hintCCWPath);

		this._hintCWArrow = new CircularArcArrow();
		this._hintCCWArrow = new CircularArcArrow();

		this._unshadowedAndUnscaled.appendChild(this._hint);

		const landmarkRadius = 0.2 * this._DEFAULT_IMAGE_RADIUS;
		const landmarkHeight = 3.5 * landmarkRadius;

		this._landmark = document.createElementNS(svgNS, 'rect');
		this._landmark.setAttribute('x', 0);
		this._landmark.setAttribute('y', -landmarkRadius);
		this._landmark.setAttribute('width', this._DEFAULT_IMAGE_RADIUS + landmarkHeight);
		this._landmark.setAttribute('height', 2*landmarkRadius);
		this._landmark.setAttribute('stroke', 'none');
		this._landmark.setAttribute('fill', 'rgb(255, 100, 255)');
		this._landmark.setAttribute('visibility', 'hidden');
		this._unshadowedBehind.appendChild(this._landmark);

		super._initAs('moon');


//		this._outerGroup = document.createElementNS(svgNS, 'g');
//
//		this._innerGroup = document.createElementNS(svgNS, 'g');
//		this._outerGroup.appendChild(this._innerGroup);

//		this._focus = document.createElementNS(svgNS, 'path');
//		this._focus.setAttribute('stroke', 'white');
//		this._focus.setAttribute('stroke-width', 6);
//		this._focus.setAttribute('x', -25);
//		this._focus.setAttribute('y', -25);
//		this._focus.setAttributeNS(xlinkNS, 'href', MoonFocusURL);
//		this._innerGroup.appendChild(this._focus);

//		this._innerGroup.appendChild(this._image);

//		this._innerGroup.appendChild(this._touchHitArea);

//		this._innerGroup.appendChild(this._mouseHitArea);
	}

	setShowLandmark(bool) {
		if (bool) {
			this._landmark.setAttribute('visibility', 'visible');
		} else {
			this._landmark.setAttribute('visibility', 'hidden');
		}
	}

	_redrawHitAreas() {

		this._touchHitArea.setAttribute('fill', this._touchHitAreaFill);
		this._mouseHitArea.setAttribute('fill', this._mouseHitAreaFill);

		let touchRadius = this._radius;
		if (touchRadius < this._MIN_TOUCH_RADIUS) {
			touchRadius = this._MIN_TOUCH_RADIUS;
		}

		this._touchHitArea.setAttribute('r', touchRadius);
		this._touchHitArea.setAttribute('cx', 0);
		this._touchHitArea.setAttribute('cy', 0);

		this._mouseHitArea.setAttribute('r', this._DEFAULT_IMAGE_RADIUS);
		this._mouseHitArea.setAttribute('cx', 0);
		this._mouseHitArea.setAttribute('cy', 0);
		
		this._maxTouchHitAreaDistance = touchRadius;
		this._maxMouseHitAreaDistance = this._DEFAULT_IMAGE_RADIUS;

		this._moreRedrawing();
	}


	_moreRedrawing() {

		let R = this._radius + this._focusStrokeOffset;

		this._focusRing.setAttribute('r', R);
		this._highlightDisc.setAttribute('r', R);

		this._redrawHint();
	}

	_redrawHint() {

		let r = this._orbitDiagram._orbitRadiusPx;
		let delta = (1.5*this._radius + this._hintArcWidth) / r;
		let theta = this._hintArcLength / r;
		let startAngle = Math.PI + delta;

		this._hintCWArrow.setParams({
			r: r,	
			cx: r,
			bodyWidth: this._hintArcWidth,
			startAngle: startAngle,
			endAngle: startAngle + theta,
		});	

		this._hintCWPath.setAttribute('d', this._hintCWArrow.getPathData());
	
		let ccwStartAngle = Math.PI - delta;
		
		this._hintCCWArrow.setParams({
			isClockwise: false,
			r: r,	
			cx: r,
			bodyWidth: this._hintArcWidth,
			startAngle: ccwStartAngle,
			endAngle: ccwStartAngle - theta,
		});	

		this._hintCCWPath.setAttribute('d', this._hintCCWArrow.getPathData());

	}

	getHotspotPosition() {
		return {
			x: this._x,
			y: this._y,
		};
	}

	_getDistanceOfClientPt(clientPt) {
		// Distance is measured from the center of the moon.
		let diagramPt = this._orbitDiagram.getDiagramPtForClientPt(clientPt);
		let dx = diagramPt.x - this._x;
		let dy = diagramPt.y - this._y;	
		return Math.sqrt(dx*dx + dy*dy);
	}

	_getAngleForClientPt(clientPt) {
		let orbitPt = this._orbitDiagram.getOrbitPtForClientPt(clientPt);
		// orbitAngle goes CW from x-axis.
		let orbitAngle = Math.atan2(orbitPt.y, orbitPt.x);
		// angle (for the moon) goes CCW from neg-x-axis.
		return Math.PI - orbitAngle;
	}

	_getCurrAngle() {
		let time = this._orbitDiagram._timekeeper.getTime();
		return 2*Math.PI*time.moonPhase;
	}

	_getDeltaObjForRotations(rotations) {
		return {
			fractionalSynodicPeriods: rotations,
		};
	}

	_getDeltaObjForKey(key) {
		let delta = 0.08;
		if (key === 'ArrowDown' || key === 'ArrowLeft') {
			return {
				fractionalDays: -delta,
			};
		} else if (key === 'ArrowUp' || key === 'ArrowRight') {
			return {
				fractionalDays: delta,
			};
		} else {
			return null;
		}
	}
}


