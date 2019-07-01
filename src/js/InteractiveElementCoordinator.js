



export default class InteractiveElementCoordinator {


	constructor(orbitDiagram) {

		this._orbitDiagram = orbitDiagram;

		this._earth = null;
		this._moon = null;

		this._isDraggingAllowed = true;
		this._isDraggingInProgress = false;

		this._rollOverElement = null;
		this._dragElement = null;
	}


	getDiagramPos() {
		let bb = this._orbitDiagram._svg.getBoundingClientRect();
		return {x: bb.left, y: bb.top, left: this._orbitDiagram._svg.clientLeft, top: this._orbitDiagram._svg.clientTop};
	}

	/*
	**	Dragging
	*/
	
	cancelDragging() {
		this._moon.cancelDragging();
		this._earth.cancelDragging();
	}

	getIsDraggingAllowed() {
		return this._isDraggingAllowed;
	}

	setIsDraggingAllowed(arg) {
		this._isDraggingAllowed = Boolean(arg);
		if (!this._isDraggingAllowed) {
			this.cancelDragging();
		}
		this.updateAllDecorations();
	}

	getCanDragStart() {
		return this._isDraggingAllowed && this._dragElement === null;
	}

	getIsDraggingInProgress() {
		return this._dragElement !== null;
	}


	_onDragBegin(element) {
		// Called by an element.
		this._dragElement = element;
	}

	_onDragEnd(element) {
		// Called by an element.
		this._dragElement = null;
		this.updateAllDecorations();
	}


	getCanDragInitOnElement(element) {
		return this._isDraggingAllowed && (this._dragElement === null || this._dragElement === element);
	}


	/*
	**	Element Decorations
	*/

	updateAllDecorations() {
		this.updateRollOverHighlightForElement(this._moon);
		this.updateRollOverHighlightForElement(this._earth);
	}

	updateRollOverHighlightForElement(element) {
		// Rules for the roll-over highlight:
		//	- only appears for mouse over,
		//	- only appears when dragging is allowed, and
		//	- does not appear or dissapear during dragging. I.e. if the highlight was on
		//		when dragging began it stays on until dragging ends, even if the mouse moves off
		//		the element, and if the mouse moves over the other element the highlight will not
		//		appear on that element until dragging has ended.

		if (this._dragElement !== null) {
			// No changes during dragging.
			return;
		}
		
		if (element.getIsMouseOver() && this._isDraggingAllowed) {
			element.setIsRollOverHighlightVisible(true);
		} else {
			element.setIsRollOverHighlightVisible(false);
		}
	}


	/*
	**	Initializations and Registrations
	*/

	checkRegistrations() {
		if (this._moon === null || this._earth === null) {
			throw new Error('Incomplete registrations.');
		}
	}

	registerMoon(obj) {
		if (this._moon !== null) {
			throw new Error('Moon already registered.');
		}
		this._moon = obj;
	}

	registerEarth(obj) {
		if (this._earth !== null) {
			throw new Error('Earth already registered.');
		}
		this._earth = obj;
	}


}

