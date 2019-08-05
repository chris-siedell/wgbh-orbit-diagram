/*
InitMessage.js
wgbh-orbit-diagram
astro.unl.edu
2019-08-01
*/


export default class InitMessage {


	constructor() {

		this._element = document.createElement('div');
		this._element.classList.add('wgbh-orbit-diagram-init-message');

		this._text = document.createElement('div');
		this._text.classList.add('wgbh-orbit-diagram-init-message-text');

		this._text.textContent = 'Drag Earth or the Moon to change the time.';

		this._element.appendChild(this._text);

		this._isDismissed = false;
	}


	getElement() {
		return this._element;
	}

	getImg() {
		return this._img;
	}

	setPosition(x, y) {
		this._text.style.left = x + 'px';
		this._text.style.top = y + 'px';
	}

	dismiss() {
		this._isDismissed = true;
		this._element.classList.add('wgbh-orbit-diagram-dismissed');
	}

}


