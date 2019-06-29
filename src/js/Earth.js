
import EarthURL from '../graphics/orbit-diagram-earth.svg';
import EarthFocusURL from '../graphics/orbit-diagram-earth-focus.svg';


import Common from './Common.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';



export default class Earth extends Common {


	constructor() {
		super();

		this._outerGroup = document.createElementNS(svgNS, 'g');

		this._innerGroup = document.createElementNS(svgNS, 'g');
		this._outerGroup.appendChild(this._innerGroup);

		this._focus = document.createElementNS(svgNS, 'image');
		this._focus.setAttribute('width', 130);
		this._focus.setAttribute('height', 150);
		this._focus.setAttribute('x', -65);
		this._focus.setAttribute('y', -85);
		this._focus.setAttributeNS(xlinkNS, 'href', EarthFocusURL);
		this._innerGroup.appendChild(this._focus);

		this._shadowed = document.createElementNS(svgNS, 'image');
		this._shadowed.setAttribute('width', 130);
		this._shadowed.setAttribute('height', 150);
		this._shadowed.setAttribute('x', -65);
		this._shadowed.setAttribute('y', -85);
		this._shadowed.setAttributeNS(xlinkNS, 'href', EarthURL);
		this._innerGroup.appendChild(this._shadowed);

		this._touchHitArea = document.createElementNS(svgNS, 'path');
		this._touchHitArea.setAttribute('fill', 'rgba(255, 0, 255, 0.8)');
		this._innerGroup.appendChild(this._touchHitArea);

		this._mouseHitArea = document.createElementNS(svgNS, 'path');
		this._mouseHitArea.setAttribute('fill', 'rgba(0, 255, 0, 0.8)');
		this._innerGroup.appendChild(this._mouseHitArea);

		this._init();
	}


	_redrawHitAreas() {

		// alpha is the angle on the globe for half of the stickfigure.
		// H is the height of the stickfigure from the center (the earth radius is 50).
		// W controls the pointy-ness of the protrusion (0 is pointy, 1 is rounded).
		const alphaDegrees = 15;
		const H = 75;
		const W = 1;

		// This constant is baked into the imported graphics.	
		const EARTH_IMAGE_DEFAULT_RADIUS = 50;
	
		let alpha = (alphaDegrees/360)*2*Math.PI;
		let r = EARTH_IMAGE_DEFAULT_RADIUS;

		let x0 = r*Math.cos(0.5*Math.PI + alpha);
		let y0 = -r*Math.sin(0.5*Math.PI + alpha);
		let x1 = r*Math.cos(0.5*Math.PI - alpha);
		let y1 = -r*Math.sin(0.5*Math.PI - alpha);
		let x2 = W*r*Math.sin(alpha);
		let y2 = -H
		let x3 = 0;
		let y3 = -H;

		let d = 'M ' + x0 + ' ' + y0;
		d += ' A 50 50 0 1 0 ' + x1 + ' ' + y1;
		d += ' Q ' + x2 + ' ' + y2 + ' ' + x3 + ' ' + y3;
		d += ' T ' + x0 + ' ' + y0;

		this._mouseHitArea.setAttribute('d' , d);

		// The code is currently operating under the assumption that the earth will always be rendered
		//	large enough that the min touch radius does not apply to the globe itself. However, the
		//	stickfigure protrusion may need to be enlarged for touch.

		// The above assumption is reasonable as long as the scaled globe radius is approx. equal to
		//	or greater than the min touch radius. If the scaled globe is ever significantly smaller
		//	than this then the following code should be rewritten.

		// TODO: check after implementing responsive layout

		// Start by assuming that the touch hit area will be identical to the mouse hit area.	
		let touchAlpha = alpha;

		// If the 'radius' of the stickfigure protrusion (half-width at the base) is less than the
		//	min touch radius then alpha will need to be enlarged (up to ninety degrees).
		// stpr = stickfigure touch protrusion 'radius'
		let stpr = this._scale * EARTH_IMAGE_DEFAULT_RADIUS * Math.sin(touchAlpha);
		if (stpr < this._MIN_TOUCH_RADIUS) {
			let sinTouchAlpha = this._MIN_TOUCH_RADIUS / (this._scale * EARTH_IMAGE_DEFAULT_RADIUS);
			if (sinTouchAlpha > 1) {
				sinTouchAlpha = 1;
			}
			touchAlpha = Math.asin(sinTouchAlpha);
		}

		x0 = r*Math.cos(0.5*Math.PI + touchAlpha);
		y0 = -r*Math.sin(0.5*Math.PI + touchAlpha);
		x1 = r*Math.cos(0.5*Math.PI - touchAlpha);
		y1 = -r*Math.sin(0.5*Math.PI - touchAlpha);
		x2 = W*r*Math.sin(touchAlpha);
		y2 = -H
		x3 = 0;
		y3 = -H;

		d = 'M ' + x0 + ' ' + y0;
		d += ' A 50 50 0 1 0 ' + x1 + ' ' + y1;
		d += ' Q ' + x2 + ' ' + y2 + ' ' + x3 + ' ' + y3;
		d += ' T ' + x0 + ' ' + y0;

		this._touchHitArea.setAttribute('d' , d);
	}


}

