/*
OrbitDiagram.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-01
*/


import './css/OrbitDiagram.css';

import SunURL from './graphics/Boston2_v1_sun.svg';

import Moon from './js/Moon.js';
import Earth from './js/Earth.js';
import InteractiveElementCoordinator from './js/InteractiveElementCoordinator.js';



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

		this._svg = document.createElementNS(svgNS, 'svg');
		this._svg.classList.add('wgbh-orbit-diagram-svg');
		this._root.appendChild(this._svg);

		this._sunGroup = document.createElementNS(svgNS, 'g');
		this._svg.appendChild(this._sunGroup);

		this._sun = document.createElementNS(svgNS, 'image');
		this._sun.setAttribute('width', 100);
		this._sun.setAttribute('height', 400);
		this._sun.setAttribute('x', 0);
		this._sun.setAttribute('y', -200);
		this._sun.setAttributeNS(xlinkNS, 'href', SunURL);
		this._sunGroup.appendChild(this._sun);


		this._margin = 0.05;
		this._earthSize = 0.2;

		this._orbitWidth = 2;
		this._orbitColor = 'white';

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

		this._needs_redoLayout = true;
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

		if (params.hasOwnProperty('needsRedoLayout')) {
			this._needs_redoLayout = true;
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

		// These constants are baked into the external graphics.
		const MOON_EARTH_RATIO = 0.27;
		const MOON_IMAGE_DEFAULT_RADIUS = 13.5;
		const EARTH_IMAGE_DEFAULT_RADIUS = 50;

		let bb = this._root.getBoundingClientRect();
		this._width = Math.floor(bb.width);
		this._height = Math.floor(bb.height);

		this._svg.setAttribute('viewBox', '0 0 ' + this._width + ' ' + this._height);

		this._earthRadiusPx = 0.5*this._earthSize*this._height;
		this._moonRadiusPx = MOON_EARTH_RATIO*this._earthRadiusPx;

		this._orbitRadiusPx = 0.5*this._height - this._margin*this._height - this._moonRadiusPx;

		this._orbitCenterY = 0.5*this._height;
		this._orbitCenterX = this._width - this._orbitCenterY;

		this._moonScale = this._moonRadiusPx/MOON_IMAGE_DEFAULT_RADIUS;
		this._earthScale = this._earthRadiusPx/EARTH_IMAGE_DEFAULT_RADIUS;

		this._earth.setPosition(this._orbitCenterX, this._orbitCenterY);
		this._earth.setScale(this._earthScale);

		this._moon.setScale(this._moonScale);

		let sunScale = this._height/400;
		this._sunGroup.setAttribute('transform', 'translate(0, ' + (this._height/2) + ') scale('+sunScale+')');

		console.log(this._orbitRadiusPx);

		// For development: check for hit area overlap.
		let minSafeOrbitRadiusForMouse = this._earth._maxMouseHitAreaDistance + this._moon._maxMouseHitAreaDistance;
		if (minSafeOrbitRadiusForMouse > this._orbitRadiusPx) {
			console.warn('The earth\'s and moon\'s mouse hit areas will overlap.');
		}
		let minSafeOrbitRadiusForTouch = this._earth._maxTouchHitAreaDistance + this._moon._maxTouchHitAreaDistance;
		if (minSafeOrbitRadiusForTouch > this._orbitRadiusPx) {
			console.warn('The earth\'s and moon\'s touch hit areas will overlap.');
		}


		this._needs_redoLayout = false;

//		console.group('_redoLayout');
//		console.log(' width: '+this._width);
//		console.log(' height: '+this._height);
//		console.log(' earthRadiusPx: '+this._earthRadiusPx);
//		console.log(' moonRadiusPx: '+this._moonRadiusPx);
//		console.log(' orbitRadiusPx: '+this._orbitRadiusPx);
//		console.log(' orbitCenterX: '+this._orbitCenterX);
//		console.log(' orbitCenterY: '+this._orbitCenterY);
//		console.log(' moonScale: '+this._moonScale);
//		console.log(' earthScale: '+this._earthScale);
//		console.groupEnd();
	}


	_redrawOrbit() {
		this._orbit.setAttribute('cx', this._orbitCenterX);
		this._orbit.setAttribute('cy', this._orbitCenterY);
		this._orbit.setAttribute('r', this._orbitRadiusPx);
		this._orbit.setAttribute('stroke-width', this._orbitWidth);
		this._orbit.setAttribute('stroke', this._orbitColor);
		this._needs_redrawOrbit = false;
	}

}


