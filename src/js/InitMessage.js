/*
InitMessage.js
wgbh-orbit-diagram
astro.unl.edu
2019-08-14
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

	setScale(arg) {
		this._element.style.fontSize = (0.8 + 0.4*arg) + 'rem';
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


