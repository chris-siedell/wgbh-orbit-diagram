


import MoonURL from '../graphics/orbit-diagram-moon.svg';
import MoonFocusURL from '../graphics/orbit-diagram-moon-focus.svg';

import Common from './Common.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';



export default class Moon extends Common {


	constructor() {
		super();

		this._outerGroup = document.createElementNS(svgNS, 'g');

		this._innerGroup = document.createElementNS(svgNS, 'g');
		this._outerGroup.appendChild(this._innerGroup);

		this._focus = document.createElementNS(svgNS, 'image');
		this._focus.setAttribute('width', 50);
		this._focus.setAttribute('height', 50);
		this._focus.setAttribute('x', -25);
		this._focus.setAttribute('y', -25);
		this._focus.setAttributeNS(xlinkNS, 'href', MoonFocusURL);
		this._innerGroup.appendChild(this._focus);

		this._shadowed = document.createElementNS(svgNS, 'image');
		this._shadowed.setAttribute('width', 50);
		this._shadowed.setAttribute('height', 50);
		this._shadowed.setAttribute('x', -25);
		this._shadowed.setAttribute('y', -25);
		this._shadowed.setAttributeNS(xlinkNS, 'href', MoonURL);
		this._innerGroup.appendChild(this._shadowed);

		this._touchHitArea = document.createElementNS(svgNS, 'circle');
		this._touchHitArea.setAttribute('fill', 'rgba(255, 0, 255, 0.8)');
		this._innerGroup.appendChild(this._touchHitArea);

		this._mouseHitArea = document.createElementNS(svgNS, 'circle');
		this._mouseHitArea.setAttribute('fill', 'rgba(0, 255, 0, 0.8)');
		this._innerGroup.appendChild(this._mouseHitArea);

		this._init();
	}


	_redrawHitAreas() {

		// _MIN_HIT_RADIUS

		const MOON_IMAGE_DEFAULT_RADIUS = 13.5;

		let r = this._scale * MOON_IMAGE_DEFAULT_RADIUS;

		if (r < this._MIN_TOUCH_RADIUS) {
			r = this._MIN_TOUCH_RADIUS;
		}

		this._touchHitArea.setAttribute('r', r);
		this._touchHitArea.setAttribute('cx', 0);
		this._touchHitArea.setAttribute('cy', 0);

		this._mouseHitArea.setAttribute('r', MOON_IMAGE_DEFAULT_RADIUS);
		this._mouseHitArea.setAttribute('cx', 0);
		this._mouseHitArea.setAttribute('cy', 0);
		
	}


}

