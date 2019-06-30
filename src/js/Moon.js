/*
src/js/Moon.js
wgbh-orbit-diagram
astro.unl.edu
2019-06-30
*/


import MoonURL from '../graphics/orbit-diagram-moon.svg';
import MoonFocusURL from '../graphics/orbit-diagram-moon-focus.svg';

import InteractiveElement from './InteractiveElement.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Moon extends InteractiveElement {


	constructor() {
		super();

		this._debugName = 'Moon';

		this._DEFAULT_IMAGE_RADIUS = 13.5;

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
		this._innerGroup.appendChild(this._touchHitArea);

		this._mouseHitArea = document.createElementNS(svgNS, 'circle');
		this._innerGroup.appendChild(this._mouseHitArea);

		super._init();
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
	}


}

