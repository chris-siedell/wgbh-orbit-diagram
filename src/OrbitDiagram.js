/*
OrbitDiagram.js
wgbh-orbit-diagram
astro.unl.edu
2019-06-27
*/


import './OrbitDiagram.css';


import EarthURL from './graphics/orbit-diagram-earth.svg';
import MoonURL from './graphics/orbit-diagram-moon.svg';


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class OrbitDiagram {


	constructor(initParams) {


		console.log(EarthURL);
		console.log(MoonURL);

		this._timekeeper = null;

		if (typeof initParams === 'object') {
			if (initParams.hasOwnProperty('timekeeper')) {
				this._timekeeper = initParams.timekeeper;
			}
		}

		if (this._timekeeper === null) {
			throw new Error('Orbit diagram running without timekeeper.');
		}

		this._root = document.createElement('div');
		this._root.classList.add('wgbh-orbit-diagram-root');

		this._svg = document.createElementNS(svgNS, 'svg');
		this._svg.classList.add('wgbh-orbit-diagram-svg');
		this._root.appendChild(this._svg);


		this._margin = 0.05;
		this._earthSize = 0.2;

		this._orbitWidth = 2;
		this._orbitColor = 'white';

		this._orbit = document.createElementNS(svgNS, 'circle');
		this._orbit.setAttribute('fill', 'none');
		this._svg.appendChild(this._orbit);

		this._earthGroup = document.createElementNS(svgNS, 'g');
		this._svg.appendChild(this._earthGroup);

		this._earth = document.createElementNS(svgNS, 'image');
		this._earth.setAttribute('width', 150);
		this._earth.setAttribute('height', 150);
		this._earth.setAttribute('x', -75);
		this._earth.setAttribute('y', -75);
		this._earth.setAttributeNS(xlinkNS, 'href', EarthURL);
		this._earthGroup.appendChild(this._earth);

		this._moonGroup = document.createElementNS(svgNS, 'g');
		this._svg.appendChild(this._moonGroup);

		this._moon = document.createElementNS(svgNS, 'image');
		this._moon.setAttribute('width', 50);
		this._moon.setAttribute('height', 50);
		this._moon.setAttribute('x', -25);
		this._moon.setAttribute('y', -25);
		this._moon.setAttributeNS(xlinkNS, 'href', MoonURL);
		this._moonGroup.appendChild(this._moon);

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
				// Do nothing.
			} else if (animState === this._timekeeper.PLAYING) {
				// Cancel any active dragging.
			} else if (animState === this._timekeeper.TRANSITIONING) {
				// Cancel any active dragging.
			} else {
				console.error('Unknown animation state.');
			}
		}

		if (this._timekeeper.getHasTimeChanged() || this._needs_updateEarthAndMoon) {
			this._updateEarthAndMoon();
		}
	}

	_updateEarthAndMoon() {

		let timeObj = this._timekeeper.getTime();

		let earthRotation = 90 - 360*timeObj.fractionalTimeOfDay;

		let moonRotation = -360*timeObj.moonPhase;

		let moonAngle = Math.PI + 2*Math.PI*timeObj.moonPhase;
		let moonX = this._orbitCenterX + this._orbitRadiusPx*Math.cos(moonAngle);
		let moonY = this._orbitCenterY - this._orbitRadiusPx*Math.sin(moonAngle);

		let earthTransform = '';
		//earthTransform += 'rotate(' + earthRotation + ', 0, 0)';
		earthTransform += ' translate(' + this._orbitCenterX + ', ' + this._orbitCenterY + ')';
		earthTransform += ' scale(' + this._earthScale + ')';

		this._earth.setAttribute('transform', 'rotate('+earthRotation+', 0, 0)');

		this._earthGroup.setAttribute('transform', earthTransform);

		let moonTransform = '';
		//moonTransform += 'rotate(' + moonRotation + ', 0, 0)';
		moonTransform += ' translate(' + moonX + ', ' + moonY + ')';
		moonTransform += ' scale(' + this._moonScale + ')';

		this._moon.setAttribute('transform', 'rotate('+moonRotation+', 0, 0)');
		this._moonGroup.setAttribute('transform', moonTransform);

		this._needs_updateEarthAndMoon = false;
	}
	
	_redoLayout() {

		this._needs_redrawOrbit = true;

		let bb = this._root.getBoundingClientRect();
		this._width = Math.floor(bb.width);
		this._height = Math.floor(bb.height);

		this._svg.setAttribute('viewBox', '0 0 ' + this._width + ' ' + this._height);

		const MOON_EARTH_RATIO = 0.27;

		this._earthRadiusPx = 0.5*this._earthSize*this._height;
		this._moonRadiusPx = MOON_EARTH_RATIO*this._earthRadiusPx;
		
		this._orbitRadiusPx = 0.5*this._height - this._margin*this._height - this._moonRadiusPx;

		this._orbitCenterY = 0.5*this._height;
		this._orbitCenterX = this._width - this._orbitCenterY;

		const MOON_IMAGE_DEFAULT_RADIUS = 13.5;
		const EARTH_IMAGE_DEFAULT_RADIUS = 50;

		this._moonScale = this._moonRadiusPx/MOON_IMAGE_DEFAULT_RADIUS;
		this._earthScale = this._earthRadiusPx/EARTH_IMAGE_DEFAULT_RADIUS;


		console.group('_redoLayout');
		console.log(' width: '+this._width);
		console.log(' height: '+this._height);
		console.log(' earthRadiusPx: '+this._earthRadiusPx);
		console.log(' moonRadiusPx: '+this._moonRadiusPx);
		console.log(' orbitRadiusPx: '+this._orbitRadiusPx);
		console.log(' orbitCenterX: '+this._orbitCenterX);
		console.log(' orbitCenterY: '+this._orbitCenterY);
		console.log(' moonScale: '+this._moonScale);
		console.log(' earthScale: '+this._earthScale);
		console.groupEnd();

		this._needs_redoLayout = false;
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


