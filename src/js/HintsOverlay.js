/*
HintsOverlay.js
wgbh-orbit-diagram
astro.unl.edu
2019-08-01
*/


export default class HintsOverlay {


	constructor() {

		this._wrapper = document.createElement('div');
		this._wrapper.classList.add('wgbh-orbit-diagram-init-message');

		this._text = document.createElement('div');
		this._text.classList.add('wgbh-orbit-diagram-init-message-text');
		this._text.textContent = 'Drag Earth or the Moon to change the time.';

		this._wrapper.appendChild(this._text);

		this._isDismissed = false;
	}


	getElement() {
		return this._wrapper;
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


