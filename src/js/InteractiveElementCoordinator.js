



export default class InteractiveElementCoordinator {


	constructor(orbitDiagram) {

		this._orbitDiagram = orbitDiagram;

		this._earth = null;
		this._moon = null;

		this._isDraggingAllowed = true;
		this._isDraggingInProgress = false;

		this._rollOverElement = null;
		this._dragElement = null;

		// The _cursorRequests set holds requests to set the cursor. Each request
		//	is identified with a key (a string) that must be uniquely associated with
		//	the source of the request. 
		// Each object in _cursorRequests has these properties:
		//	priority - a number
		//	cursor - a string
		this._cursorRequests = {};
		this._DEFAULT_CURSOR = 'auto';
		this._currCursor = this._DEFAULT_CURSOR;
		this._nextCursorPriority = 1;
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
//		this.updateAllDecorations();
	}


	getCanDragInitOnElement(element) {
		return this._isDraggingAllowed && (this._dragElement === null || this._dragElement === element);
	}

	getCanDragStartOnElement(element) {
		return this._isDraggingAllowed && this._dragElement === null;
	}

	setCursor(key, cursor) {

		if (typeof cursor !== 'string') {
			// The request associated with the given key will be withdrawn.
			if (this._cursorRequests.hasOwnProperty(key)) {
				delete this._cursorRequests[key];
			} else {
				// Probably a redundant call.
				console.error('setCursor called with unknown key');
			}
		} else if (this._cursorRequests.hasOwnProperty(key)) {
			// An active request already exists for the key, so update it.
			this._cursorRequests[key].priority = this._nextCursorPriority++;
			this._cursorRequests[key].cursor = cursor;

		} else {
			// There is no active request associated with the key, so create it.
			this._cursorRequests[key] = {
				priority: this._nextCursorPriority++,
				cursor: cursor,
			};
		}	

		// Find the cursor request with the highest priority, or fall back to
		//	the default cursor if there are no requests.
		let newCursor = this._DEFAULT_CURSOR;
		let newCursorPriority = Number.NEGATIVE_INFINITY;
		for (let x in this._cursorRequests) {
			let request = this._cursorRequests[x];
			if (request.priority >= newCursorPriority) {
				newCursorPriority = request.priority;
				newCursor = request.cursor;
			}
		}

		if (newCursor === this._cursor) {
			return;
		}

		this._cursor = newCursor;
		document.body.style.cursor = this._cursor;
	}


	/*
	**	Element Decorations
	*/

	updateAllDecorations() {
		this._moon.updateHighlight();
		this._earth.updateHighlight();
		this._moon.updateCursor();
		this._earth.updateCursor();
	}

//	updateRollOverHighlightForElement(element) {
//		if (this._dragElement !== null) {
//			// No changes during dragging.
//			return;
//		}
//		
//		if (element.getIsMouseOver() && this._isDraggingAllowed) {
//			element.setIsRollOverHighlightVisible(true);
//		} else {
//			element.setIsRollOverHighlightVisible(false);
//		}
//	}


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

