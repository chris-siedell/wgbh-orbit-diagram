/*
HintsOverlay.js
wgbh-orbit-diagram
astro.unl.edu
2019-07-03
*/


export default class HintsOverlay {


	constructor() {

		this._element = document.createElement('div');

		this._element.classList.add('wgbh-orbit-diagram-hints');

	}


	getElement() {
		return this._element;
	}


}


