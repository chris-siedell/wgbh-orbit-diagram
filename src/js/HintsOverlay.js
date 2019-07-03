/*
HintsOverlay.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-03
*/

// TODO: this is just a rough sketch

import DemoDragArrowsURL from '../graphics/Untitled-1-01.svg';


export default class HintsOverlay {


	constructor() {

		this._text = document.createElement('div');
		this._text.classList.add('wgbh-orbit-diagram-hints-text');
		this._text.textContent = 'Drag the earth or the moon to change the time.';

		this._img = document.createElement('img');
		this._img.classList.add('wgbh-orbit-diagram-hints-img');
		this._img.ondragstart = ((e) => {
			return false;
		});
		this._img.src = DemoDragArrowsURL;
		this._img.width = 250;
		this._img.height = 320;

		this._isDismissed = false;
	}


	getText() {
		return this._text;
	}

	getImg() {
		return this._img;
	}


	setPosition(x, y) {
		if (this._isDismissed) {
			return;
		}
		this._text.style.right = x + 'px';
		this._text.style.bottom = y + 'px';
		this._img.style.right = (x - 155) + 'px';
		this._img.style.bottom = (y - 143) + 'px';
	}


	dismiss() {
		this._isDismissed = true;
		this._text.classList.add('wgbh-orbit-diagram-hints-dismissed');
		this._img.classList.add('wgbh-orbit-diagram-hints-dismissed');
	}

}


