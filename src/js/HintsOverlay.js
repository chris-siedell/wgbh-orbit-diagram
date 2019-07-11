/*
HintsOverlay.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-11
*/


export default class HintsOverlay {


	constructor() {

		this._text = document.createElement('div');
		this._text.classList.add('wgbh-orbit-diagram-hints-text');
		this._text.textContent = 'Drag Earth or the Moon to change the time.';

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
		this._text.style.left = x + 'px';
		this._text.style.top = y + 'px';
	}


	dismiss() {
		this._isDismissed = true;
		this._text.classList.add('wgbh-orbit-diagram-hints-dismissed');
	}

}


