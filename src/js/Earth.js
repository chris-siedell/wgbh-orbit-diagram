/*
src/js/Earth.js
wgbh-orbit-diagram
astro.unl.edu
2019-08-03
*/


import EarthURL from '../graphics/Boston2_v1_earth.svg';
import StickfigureURL from '../graphics/Boston2_v5b_stickfigure-extraextrawide.svg';

import CircularArcArrow from 'CircularArcArrow.js';


import InteractiveElement from './InteractiveElement.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Earth extends InteractiveElement {


	constructor(coordinator, orbitDiagram) {
		super(coordinator, orbitDiagram);

		this._DEFAULT_IMAGE_RADIUS = 50;

//		this._outerGroup = document.createElementNS(svgNS, 'g');
//
//		this._innerGroup = document.createElementNS(svgNS, 'g');
//		this._outerGroup.appendChild(this._innerGroup);
//
//		this._focus = document.createElementNS(svgNS, 'image');
//		this._focus.setAttribute('width', 130);
//		this._focus.setAttribute('height', 150);
//		this._focus.setAttribute('x', -65);
//		this._focus.setAttribute('y', -85);
//		this._focus.setAttributeNS(xlinkNS, 'href', EarthFocusURL);
//		this._innerGroup.appendChild(this._focus);
//
//		this._shadowed = document.createElementNS(svgNS, 'image');
//		this._shadowed.setAttribute('width', 130);
//		this._shadowed.setAttribute('height', 150);
//		this._shadowed.setAttribute('x', -65);
//		this._shadowed.setAttribute('y', -85);
//		this._shadowed.setAttributeNS(xlinkNS, 'href', EarthURL);
//		this._innerGroup.appendChild(this._shadowed);

		this._filter = document.createElementNS(svgNS, 'filter');
		this._filter.setAttribute('id', 'stickfigure-filter');
		
		this._filterMatrix = document.createElementNS(svgNS, 'feColorMatrix');
		this._filterMatrix.setAttribute('in', 'SourceGraphic');
		this._filterMatrix.setAttribute('type', 'matrix');
		let n = '1';
		this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
		this._filter.appendChild(this._filterMatrix);
		this._unshadowed.appendChild(this._filter);

		this._stickfigure = document.createElementNS(svgNS, 'image');
		this._stickfigure.setAttribute('width', 130);
		this._stickfigure.setAttribute('height', 150);
		this._stickfigure.setAttribute('x', -65);
		this._stickfigure.setAttribute('y', -85);
		this._stickfigure.setAttributeNS(xlinkNS, 'href', StickfigureURL);
		this._stickfigure.setAttribute('filter', 'url(#stickfigure-filter)');
		this._unshadowed.appendChild(this._stickfigure);

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

		this._touchHitArea = document.createElementNS(svgNS, 'path');
//		this._innerGroup.appendChild(this._touchHitArea);

		this._mouseHitArea = document.createElementNS(svgNS, 'path');
//		this._innerGroup.appendChild(this._mouseHitArea);

		this._imageURL = EarthURL;


		this._focus = document.createElementNS(svgNS, 'g');
		this._focusRing = document.createElementNS(svgNS, 'path');
		this._focusRing.setAttribute('stroke', this._focusStroke);
		this._focusRing.setAttribute('stroke-width', this._focusStrokeWidth);
		this._focusRing.setAttribute('fill', 'none');
		this._focus.appendChild(this._focusRing);


		this._highlight = document.createElementNS(svgNS, 'g');
		this._highlightArea = document.createElementNS(svgNS, 'path');
		this._highlightArea.setAttribute('fill', this._highlightFill);
		this._highlight.appendChild(this._highlightArea);

		super._initAs('earth');
	}


	_redrawHint() {

		let r = 1.2*(this._radius + this._hintArcWidth);
		let delta = 2.7*(this._hintArcWidth / r);
		let theta = this._hintArcLength / r;
		let startAngle = 1.5*Math.PI + delta;

		this._hintCWArrow.setParams({
			r: r,	
			bodyWidth: this._hintArcWidth,
			startAngle: startAngle,
			endAngle: startAngle + theta,
		});	

		this._hintCWPath.setAttribute('d', this._hintCWArrow.getPathData());
	
		let ccwStartAngle = 1.5*Math.PI - delta;
		
		this._hintCCWArrow.setParams({
			isClockwise: false,
			r: r,	
			bodyWidth: this._hintArcWidth,
			startAngle: ccwStartAngle,
			endAngle: ccwStartAngle - theta,
		});	

		this._hintCCWPath.setAttribute('d', this._hintCCWArrow.getPathData());

	}


	setRotation(degrees) {
		super.setRotation(degrees);

		let time = this._orbitDiagram._timekeeper.getTime();

		const ep = 0.03;
		const darkestLevel = 0.2;
		const range = 0.7;
		const power = 3;

		let dawnBegin = 0.25 - ep;
		let dawnEnd = 0.25 + ep;
		let duskBegin = 0.75 - ep;
		let duskEnd = 0.75 + ep;

		let f = time.fractionalTimeOfDay;

		let u = 0;

		if (f < dawnBegin) {
			u = 0;
		} else if (f < dawnEnd) {
			u = (f - dawnBegin)/(dawnEnd - dawnBegin);
		} else if (f < duskBegin) {
			u = 1;
		} else if (f < duskEnd) {
			u = 1 - (f - duskBegin)/(duskEnd - duskBegin);
		} else {
			u = 0;
		}

		let level = darkestLevel + range*Math.pow(u, power);

//		console.log(u+', '+level);
		let n = level.toString();
		this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
	}


	_redrawHitAreas() {

		this._touchHitArea.setAttribute('fill', this._touchHitAreaFill);
		this._mouseHitArea.setAttribute('fill', this._mouseHitAreaFill);

		// The hit areas for the globe include a protrusion for the stickfigure.
		// alpha is the angle on the globe subtended by half of the stickfigure.
		// H is the height of the stickfigure protrusion from the center of the earth.
		// W controls the pointy-ness of the protrusion (0 is pointy, 1 is rounded).
		const alphaDegrees = 15;
		const H = 75;
		const W = 1;

		let alpha = (alphaDegrees/360)*2*Math.PI;
		let R = this._DEFAULT_IMAGE_RADIUS;

		let x0 = R*Math.cos(0.5*Math.PI + alpha);
		let y0 = -R*Math.sin(0.5*Math.PI + alpha);
		let x1 = R*Math.cos(0.5*Math.PI - alpha);
		let y1 = -R*Math.sin(0.5*Math.PI - alpha);
		let x2 = W*R*Math.sin(alpha);
		let y2 = -H;
		let x3 = 0;
		let y3 = -H;

		let d = 'M ' + x0 + ' ' + y0;
		d += ' A 50 50 0 1 0 ' + x1 + ' ' + y1;
		d += ' Q ' + x2 + ' ' + y2 + ' ' + x3 + ' ' + y3;
		d += ' T ' + x0 + ' ' + y0;

		this._mouseHitArea.setAttribute('d' , d);

		// Start by assuming that the touch hit area will be identical to the mouse hit area.	
		// Recall: _radius = _scale * _DEFAULT_IMAGE_RADIUS (= _scale * R).
		let touchRadius = this._radius; // scaled touch radius
		let touchR = R; // unscaled radius
		let touchAlpha = alpha;
		let touchH = H;

		// Increase the radius of the globe if necessary.
		if (touchRadius < this._MIN_TOUCH_RADIUS) {
			touchRadius = this._MIN_TOUCH_RADIUS;
			touchR = touchRadius / this._scale;
		}

		// If the 'radius' of the stickfigure protrusion (half-width at the base) is less than the
		//	min touch radius then alpha will need to be enlarged (up to ninety degrees).
		// stpr = stickfigure touch protrusion 'radius'
		let stpr = touchRadius * Math.sin(touchAlpha);
		if (stpr < this._MIN_TOUCH_RADIUS) {
			let sinTouchAlpha = this._MIN_TOUCH_RADIUS / touchRadius;
			if (sinTouchAlpha > 1) {
				sinTouchAlpha = 1;
			}
			touchAlpha = Math.asin(sinTouchAlpha);
		}

		// Increase the height of the stickfigure protrusion by some multiple of the
		//	min touch radius (this is a 'magic' number, chosen by preference).
		let k = 0.5001;
		touchH = (this._scale*H + k*this._MIN_TOUCH_RADIUS)/this._scale;

		// Ensure that the stickfigure touch protrusion height (from the globe surface) is at least
		//	equal to the min touch radius.
		// sth = stickfigure touch height (scaled, and relative to the actual globe surface)
		let sth = this._scale * (touchH - R);
		if (sth < this._MIN_TOUCH_RADIUS) {
			touchH = (this._MIN_TOUCH_RADIUS / this._scale) + R;
		}

		x0 = touchR*Math.cos(0.5*Math.PI + touchAlpha);
		y0 = -touchR*Math.sin(0.5*Math.PI + touchAlpha);
		x1 = touchR*Math.cos(0.5*Math.PI - touchAlpha);
		y1 = -touchR*Math.sin(0.5*Math.PI - touchAlpha);
		x2 = W*touchR*Math.sin(touchAlpha);
		y2 = -touchH;
		x3 = 0;
		y3 = -touchH;

		d = 'M ' + x0 + ' ' + y0;
		d += ' A 50 50 0 1 0 ' + x1 + ' ' + y1;
		d += ' Q ' + x2 + ' ' + y2 + ' ' + x3 + ' ' + y3;
		d += ' T ' + x0 + ' ' + y0;

		this._touchHitArea.setAttribute('d' , d);

		this._maxTouchHitAreaDistance = this._scale * touchH;
		this._maxMouseHitAreaDistance = this._scale * H;

		this._redrawOtherStuff();
	}


	_redrawOtherStuff() {

		// The hit areas for the globe include a protrusion for the stickfigure.
		// alpha is the angle on the globe subtended by half of the stickfigure.
		// H is the height of the stickfigure protrusion from the center of the earth.
		// W controls the pointy-ness of the protrusion (0 is pointy, 1 is rounded).
		const alphaDegrees = 15;
		const H = 75 * this._scale;
		const W = 1;

		let alpha = (alphaDegrees/360)*2*Math.PI;
		let R = this._radius + this._focusStrokeOffset;

		let x0 = R*Math.cos(0.5*Math.PI + alpha);
		let y0 = -R*Math.sin(0.5*Math.PI + alpha);
		let x1 = R*Math.cos(0.5*Math.PI - alpha);
		let y1 = -R*Math.sin(0.5*Math.PI - alpha);
		let x2 = W*R*Math.sin(alpha);
		let y2 = -H - this._focusStrokeOffset;
		let x3 = 0;
		let y3 = -H - this._focusStrokeOffset;

		let d = 'M ' + x0 + ' ' + y0;
		d += ' A ' + R + ' ' + R + ' 0 1 0 ' + x1 + ' ' + y1;
		d += ' Q ' + x2 + ' ' + y2 + ' ' + x3 + ' ' + y3;
		d += ' T ' + x0 + ' ' + y0 + ' Z';

		this._focusRing.setAttribute('d' , d);

		this._highlightArea.setAttribute('d', d);

		this._redrawHint();
	}


	getHotspotPosition() {
		let radians = this._rotationDegrees * Math.PI/180;
		return {
			x: this._x + this._radius*Math.sin(radians),
			y: this._y - this._radius*Math.cos(radians),
		};
	}

	_getDistanceOfClientPt(clientPt) {
		// Distance is measured from observer's location on the globe.
		let diagramPt = this._orbitDiagram.getDiagramPtForClientPt(clientPt);
		let hPt = this.getHotspotPosition();
		let dx = diagramPt.x - hPt.x;
		let dy = diagramPt.y - hPt.y;	
		return Math.sqrt(dx*dx + dy*dy);
	}

	_getAngleForClientPt(clientPt) {
		let orbitPt = this._orbitDiagram.getOrbitPtForClientPt(clientPt);
		// orbitAngle goes CW from x-axis.
		let orbitAngle = Math.atan2(orbitPt.y, orbitPt.x);
		// angle (for the earth) goes CCW from neg-y-axis.
		return 1.5*Math.PI - orbitAngle;
	}

	_getCurrAngle() {
		let time = this._orbitDiagram._timekeeper.getTime();
		return 2*Math.PI*time.fractionalTimeOfDay;
	}

	_getDeltaObjForRotations(rotations) {
		return {
			fractionalDays: rotations,
		};
	}

	_getDeltaObjForKey(key) {
		let delta = 0.003;
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


