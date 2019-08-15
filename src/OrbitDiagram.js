/*
OrbitDiagram.js
wgbh-orbit-diagram
astro.unl.edu
2019-08-15
*/


const VERSION_STR = '0.8';
console.info('WGBH Orbit Diagram (version: ' + VERSION_STR + ')');


import './css/OrbitDiagram.css';

// The sun and sun gradient SVGs must have dimensions (width, height,
//	and viewBox) of 400x200.
import SunURL from './graphics/Boston2_v2-modified_sun.svg';
import SunGradientURL from './graphics/Boston2_v2-modified_sun-gradient.svg';

import TimeTickmarksURL from './graphics/time-tickmarks.svg';

import Moon from './js/Moon.js';
import Earth from './js/Earth.js';
import InteractiveElementCoordinator from './js/InteractiveElementCoordinator.js';
import InitMessage from './js/InitMessage.js';


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class OrbitDiagram {


	constructor(initParams) {

		this._timekeeper = null;

		if (typeof initParams === 'object') {
			if (initParams.hasOwnProperty('timekeeper')) {
				this._timekeeper = initParams.timekeeper;
			}
		}

		if (this._timekeeper === null) {
			throw new Error('Orbit diagram requires a lunar timekeeper object.');
		}

		this._root = document.createElement('div');
		this._root.classList.add('wgbh-orbit-diagram-root');

		this._note = document.createElement('div');
		this._note.classList.add('wgbh-orbit-diagram-note');
		this._note.textContent = 'not to scale';
		this._root.appendChild(this._note);

		this._svg = document.createElementNS(svgNS, 'svg');
		this._svg.classList.add('wgbh-orbit-diagram-svg');
		this._root.appendChild(this._svg);

		this._initMessage = new InitMessage();
		this._root.appendChild(this._initMessage.getElement());

		this._sunGradientGroup = document.createElementNS(svgNS, 'g');
		this._svg.appendChild(this._sunGradientGroup);
		
		this._sunGradient = document.createElementNS(svgNS, 'image');
		this._sunGradient.setAttribute('preserveAspectRatio', 'none');
		this._sunGradient.setAttribute('width', 200);
		this._sunGradient.setAttribute('height', 400);
		this._sunGradient.setAttribute('x', 0);
		this._sunGradient.setAttribute('y', -200);
		this._sunGradient.setAttributeNS(xlinkNS, 'href', SunGradientURL);
		this._sunGradientGroup.appendChild(this._sunGradient);

		this._timeTickmarksGroup = document.createElementNS(svgNS, 'g');
		this._timeTickmarksGroup.setAttribute('visibility', 'hidden');
		this._svg.appendChild(this._timeTickmarksGroup);

		this._timeTickmarks = document.createElementNS(svgNS, 'image');
		this._timeTickmarks.setAttribute('width', 300);
		this._timeTickmarks.setAttribute('height', 300);
		this._timeTickmarks.setAttribute('x', -150);
		this._timeTickmarks.setAttribute('y', -150);
		this._timeTickmarks.setAttributeNS(xlinkNS, 'href', TimeTickmarksURL);
		this._timeTickmarksGroup.appendChild(this._timeTickmarks);

		this._sunGroup = document.createElementNS(svgNS, 'g');
		this._svg.appendChild(this._sunGroup);

		this._sun = document.createElementNS(svgNS, 'image');
		this._sun.setAttribute('width', 200);
		this._sun.setAttribute('height', 400);
		this._sun.setAttribute('x', 0);
		this._sun.setAttribute('y', -200);
		this._sun.setAttributeNS(xlinkNS, 'href', SunURL);
		this._sunGroup.appendChild(this._sun);

		this._remSampler = document.createElement('div');
		this._remSampler.classList.add('wgbh-orbit-diagram-rem-sampler');
		this._root.appendChild(this._remSampler);

		this._margin = 0.05;
		this._earthSize = 0.2;

		this._orbitWidth = 2;
		this._orbitColor = 'rgb(180, 180, 180)';
		this._orbitStyle = 'dotted';

		this._orbit = document.createElementNS(svgNS, 'circle');
		this._orbit.setAttribute('fill', 'none');
		this._svg.appendChild(this._orbit);

		this._coordinator = new InteractiveElementCoordinator(this);

		this._earth = new Earth(this._coordinator, this);
		this._svg.appendChild(this._earth.getElement());

		this._moon = new Moon(this._coordinator, this);
		this._svg.appendChild(this._moon.getElement());


		this._moon._otherElement = this._earth;
		this._earth._otherElement = this._moon;

		this._coordinator.checkRegistrations();

		this._areHintsShown = true;

		this._needs_redoLayout = true;
	}

	dismissHints() {
		if (this._areHintsShown) {
			this._initMessage.dismiss();

			this._moon.dismissInitHint();
			this._earth.dismissInitHint();

			this._areHintsShown = false;
		}
	}

	getElement() {
		return this._root;
	}


	setParams(params) {

		if (params.hasOwnProperty('margin')) {
			this._margin = params.margin;
			this._needs_redoLayout = true;
		}

		if (params.hasOwnProperty('earthSize')) {
			this._earthSize = params.earthSize;
			this._needs_redoLayout = true;
		}

		if (params.hasOwnProperty('width')) {
			this._width = params.width;
			this._needs_redoLayout = true;
		}

		if (params.hasOwnProperty('height')) {
			this._height = params.height;
			this._needs_redoLayout = true;
		}

		if (params.hasOwnProperty('needsRedoLayout')) {
			this._needs_redoLayout = true;
		}

		if (params.hasOwnProperty('showLunarLandmark')) {
			this._moon.setShowLandmark(params.showLunarLandmark);
		}

		if (params.hasOwnProperty('showTimeTickmarks')) {
			if (params.showTimeTickmarks) {
				this._timeTickmarksGroup.setAttribute('visibility', 'visible');
			} else {
				this._timeTickmarksGroup.setAttribute('visibility', 'hidden');
			}
		}
	}

	update() {

		if (this._needs_redoLayout) {
			this._redoLayout();
		}

		if (this._needs_redrawOrbit) {
			this._redrawOrbit();
		}

		if (this._timekeeper.getHasAnimationStateChanged()) {
			let animState = this._timekeeper.getAnimationState();
			if (animState === this._timekeeper.IDLE) {
				// Allow dragging.
				this._coordinator.setIsDraggingAllowed(true);
			} else if (animState === this._timekeeper.PLAYING || animState === this._timekeeper.TRANSITIONING) {
				// Forbid dragging. This call also cancels any active dragging.
				this._coordinator.setIsDraggingAllowed(false);
			} else {
				console.error('Unknown animation state.');
			}
		}

		if (this._timekeeper.getHasTimeChanged() || this._needs_updateEarthAndMoon) {
			this._updateEarthAndMoon();
		}
	}

	_updateEarthAndMoon() {
		// This method positions and rotates the earth and moon according to the current time.
		// It should be called whenever the time has changed, or the layout has just been redone.

		let timeObj = this._timekeeper.getTime();

		let earthRotation = 90 - 360*timeObj.fractionalTimeOfDay;
		this._earth.setRotation(earthRotation);

		let moonRotation = -360*timeObj.moonPhase;
		this._moon.setRotation(moonRotation);

		let moonAnomaly = Math.PI + 2*Math.PI*timeObj.moonPhase;
		let moonX = this._orbitCenterX + this._orbitRadiusPx*Math.cos(moonAnomaly);
		let moonY = this._orbitCenterY - this._orbitRadiusPx*Math.sin(moonAnomaly);
		this._moon.setPosition(moonX, moonY);

		this._needs_updateEarthAndMoon = false;
	}

	getDiagramPtForClientPt(clientPt) {
		let bb = this._svg.getBoundingClientRect();
		return {
			x: clientPt.x - bb.left,
			y: clientPt.y - bb.top,
		};
	}

	getOrbitPtForClientPt(clientPt) {
		let bb = this._svg.getBoundingClientRect();
		let orbitClientX = bb.left + this._orbitCenterX;
		let orbitClientY = bb.top + this._orbitCenterY;
		let orbitPt = {
			x: clientPt.x - orbitClientX,
			y: clientPt.y - orbitClientY,
		};
		return orbitPt;
	}
	
	_redoLayout() {

		// This method needs to be called whenever the width, height, or other
		//	layout parameters have changed.

		this._needs_redrawOrbit = true;
		this._needs_updateEarthAndMoon = true;

		const remPx = this._remSampler.getBoundingClientRect().width;

		// These constants are baked into the external graphics.
		const MOON_EARTH_RATIO = 0.28;//0.27;
		const MOON_IMAGE_DEFAULT_RADIUS = 14;//13.5;
		const EARTH_IMAGE_DEFAULT_RADIUS = 50;
	
		// scaleFactor controls the sizing of the 'not to scale' note and the
		//	initial message.
		const xScaleFactor = ((this._width/remPx) - 20)/40;
		const yScaleFactor = ((this._height/remPx) - 10)/20;
		const scaleFactor = Math.min(1, Math.max(0, xScaleFactor, yScaleFactor));

		this._root.style.width = this._width + 'px';
		this._root.style.height = this._height + 'px';

		this._svg.style.width = this._width + 'px';
		this._svg.style.height = this._height + 'px';

		this._svg.setAttribute('viewBox', '0 0 ' + this._width + ' ' + this._height);

		this._earthRadiusPx = 0.5*this._earthSize*this._height;
		this._moonRadiusPx = MOON_EARTH_RATIO*this._earthRadiusPx;

		this._orbitRadiusPx = 0.5*this._height - this._margin*this._height - this._moonRadiusPx;

		this._orbitCenterY = 0.5*this._height;
		this._orbitCenterX = this._width - this._orbitCenterY;

		let timeTickmarksTransform = 'translate(' + this._orbitCenterX + ', ' + this._orbitCenterY + ')';
		timeTickmarksTransform += ' scale(' + (this._earthRadiusPx/50) + ')';

		this._timeTickmarksGroup.setAttribute('transform', timeTickmarksTransform);

		this._moonScale = this._moonRadiusPx/MOON_IMAGE_DEFAULT_RADIUS;
		this._earthScale = this._earthRadiusPx/EARTH_IMAGE_DEFAULT_RADIUS;

		this._earth.setPosition(this._orbitCenterX, this._orbitCenterY);
		this._earth.setScale(this._earthScale);

		this._moon.setScale(this._moonScale);

		let sunScale = this._height/400;
		this._sunGroup.setAttribute('transform', 'translate(0, ' + (this._height/2) + ') scale('+sunScale+')');

		let sunGradientXScale = (this._orbitCenterX - 0.5*this._orbitRadiusPx) / 200;
		this._sunGradient.setAttribute('transform', 'translate(0, ' +
				(this._height/2) + ') scale(' + sunGradientXScale + ', ' + sunScale + ')');

		// Check for hit area overlap.
		let minSafeOrbitRadiusForMouse = this._earth._maxMouseHitAreaDistance + this._moon._maxMouseHitAreaDistance;
		if (minSafeOrbitRadiusForMouse > this._orbitRadiusPx) {
			console.warn('The earth\'s and moon\'s mouse hit areas will overlap.');
		}
		let minSafeOrbitRadiusForTouch = this._earth._maxTouchHitAreaDistance + this._moon._maxTouchHitAreaDistance;
		if (minSafeOrbitRadiusForTouch > this._orbitRadiusPx) {
			console.warn('The earth\'s and moon\'s touch hit areas will overlap.');
		}

		this._initMessage.setPosition(this._width/2, this._orbitCenterY - this._orbitRadiusPx);
		this._initMessage.setScale(scaleFactor);

		const noteMargins = 0.2 + 0.8*scaleFactor;	
		this._note.style.margin = '0 ' + noteMargins + 'rem ' + noteMargins + 'rem 0';
		this._note.style.fontSize = (0.6 + 0.4*scaleFactor) + 'rem';

		this._needs_redoLayout = false;
	}

	_redrawOrbit() {
		this._orbit.setAttribute('cx', this._orbitCenterX);
		this._orbit.setAttribute('cy', this._orbitCenterY);
		this._orbit.setAttribute('r', this._orbitRadiusPx);
		this._orbit.setAttribute('stroke-width', this._orbitWidth);
		this._orbit.setAttribute('stroke', this._orbitColor);
		if (this._orbitStyle === 'dotted') {
			// spacingTarget is used to calculate the actual spacing, which is
			//	chosen so that there are an integer number of identical gaps.
			const spacingTarget = 4 * this._orbitWidth;
			const circ = 2*Math.PI*this._orbitRadiusPx;
			const n = Math.ceil(circ / spacingTarget);
			const spacing = circ / n;
			this._orbit.setAttribute('stroke-linecap', 'round');
			this._orbit.setAttribute('stroke-dasharray', '0 ' + spacing);
		} else {
			this._orbit.setAttribute('stroke-dasharray', 'none');
		}
		this._needs_redrawOrbit = false;
	}

}


