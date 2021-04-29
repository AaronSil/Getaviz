var colorController = (function() {
	// coloredEntities[entity] => {[{owner: blaController, color: "#234561"},]
	
	var colorOwners = [
		"canvasHoverController",
		"canvasSelectController",
		"canvasMarkController"
	];
	
	var coloringMap = new Map();
	var highlightingMap = new Map();
	
	let controllerConfig = {
		brightnessFactor: 0.2,
		lightColorFactor: 0.2
	}
	
	function initialize() {
	}
	
	function activate() {
	}
	
	function reset() {
		
	}
	
	function addColorToEntity(entity, color, owner) {
		if(entity) {
			let entityColoring = coloringMap.has(entity.id) ? coloringMap.get(entity.id) : {};
			entityColoring[owner] = color;
			coloringMap.set(entity.id, entityColoring);
			
			updateVisibleColor(entity.id);
		} else {
			events.log.error.publish({ text: "Entity is undefined." });
		}
	}
	
	function removeColorFromEntity(entity, owner) {
		if(entity) {
			let entityColoring = coloringMap.has(entity.id) ? coloringMap.get(entity.id) : {};
			entityColoring[owner] = undefined;
			coloringMap.set(entity.id, entityColoring);
			
			updateVisibleColor(entity.id);
		} else {
			events.log.error.publish({ text: "Entity is undefined." });
		}
	}
	
	function addHighlightToEntity(entity, highlightColor, owner) {
		if(entity) {
			let entityHighlights = highlightingMap.has(entity.id) ? highlightingMap.get(entity.id) : {};
			entityHighlights[owner] = highlightColor;
			highlightingMap.set(entity.id, entityHighlights);
			
			updateVisibleColor(entity.id);
		} else {
			events.log.error.publish({ text: "Entity is undefined." });
		}
	}
	
	function removeHighlightFromEntity(entity, owner) {
		if(entity) {
			let entityHighlights = highlightingMap.has(entity.id) ? highlightingMap.get(entity.id) : {};
			entityHighlights[owner] = undefined;
			highlightingMap.set(entity, entityHighlights);
			
			updateVisibleColor(entity.id);
		} else {
			events.log.error.publish({ text: "Entity is undefined." });
		}
	}
	
	function updateVisibleColor(entityId) {
		let entityColoring = coloringMap.has(entityId) ? coloringMap.get(entityId) : {};
		let entityHighlights = highlightingMap.has(entityId) ? highlightingMap.get(entityId) : {};
		let activeColor = "";
		let activeHighlight = "";
		let entity = model.getEntityById(entityId);
		for(const [i, owner] of Object.entries(colorOwners)) {
			if(activeColor == "" && entityColoring[owner]) {
				activeColor = entityColoring[owner];
			}
			if(activeHighlight == "" && entityHighlights[owner]) {
				activeHighlight = entityHighlights[owner];
			}
		}
		if(activeColor == "") {
			activeColor = entity.originalColor;
		}
		let visibleColor = highlightColor(activeColor, activeHighlight);
		canvasManipulator.changeColorOfEntities([entity], visibleColor);
	}
	
	function highlightColor(activeColor, activeHighlight) {
		if(activeHighlight == "") {
			return activeColor;
		}
		let mixedColor = chroma.scale([activeColor, activeHighlight]).mode('lab')(controllerConfig.lightColorFactor);
		mixedColor = mixedColor.brighten(controllerConfig.brightnessFactor);
		return mixedColor.hex();
	}
	
	function registerColorOwner(colorOwnerName) {
		colorOwners.push(colorOwnerName);
	}
	
	return {
		initialize: initialize,
		activate: activate,
		reset: reset,
		
		addColorToEntity: addColorToEntity,
		removeColorFromEntity: removeColorFromEntity,
		registerColorOwner: registerColorOwner,
		
		addHighlightToEntity: addHighlightToEntity,
		removeHighlightFromEntity: removeHighlightFromEntity
	};
})();
