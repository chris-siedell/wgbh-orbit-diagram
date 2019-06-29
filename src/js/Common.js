



export default class Common {


	constructor() {

		this._MIN_TOUCH_RADIUS = 24;


		// Required
		//	_shadowed
		//	_focus
		//	_mouseHitArea
		//	_touchHitArea

		this._scale = 1;
		this._rotationDegrees = 0;


	}

	_init() {

	
		this._mouseHitArea.addEventListener('mousedown', (e) => {
			console.log('mousedown');
			console.log(e);
		});


	}

	getElement() {
		return this._outerGroup;
	}

	setScale(scale) {
		this._scale = scale;
		this._redrawHitAreas();
		this._updateInnerTransform();
	}

	setPosition(x, y) {
		this._outerGroup.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
	}

	setRotation(degrees) {
		this._rotationDegrees = degrees;
		this._updateInnerTransform();
	}

	_updateInnerTransform() {
		let transform = 'rotate(' + this._rotationDegrees + ', 0, 0) scale(' + this._scale + ')';
		this._innerGroup.setAttribute('transform', transform);
	}
}


