/*
src/js/Moon.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-01
*/


import MoonURL from '../graphics/Boston2_v1_moon.svg';

import InteractiveElement from './InteractiveElement.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Moon extends InteractiveElement {


	constructor(coordinator, orbitDiagram) {
		super(coordinator, orbitDiagram);

		this._DEFAULT_IMAGE_RADIUS = 13.5;

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


