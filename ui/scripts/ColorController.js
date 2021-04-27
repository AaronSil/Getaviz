var colorController = (function() {
	// coloredEntities[entity] => {[{owner: blaController, color: "#234561"},]
	
	var colorOwners = [
		"canvasHoverController",
		"canvasMarkController",
		"canvasSelectController"
	];
	
	var coloringMap = new Map();
	var highlightingMap = new Map();
	
	let controllerConfig = {
	}
	
	function initialize() {
	}
	
	function activate() {
	}
	
	function reset() {
		
	}
	
	function addColorToEntity(entity, color, owner) {
		if(entity) {
			let entityColoring = coloringMap.get(entity.id);
			if(!entityColoring) {
				entityColoring = {};
			}
			entityColoring[owner] = color;
			coloringMap.set(entity.id, entityColoring);
			
			updateVisibleColor(entity.id);
		} else {
			events.log.error.publish({ text: "Entity is undefined." });
		}
	}
	
	function removeColorFromEntity(entity, owner) {
		if(entity) {
			let entityColoring = coloringMap.get(entity.id);
			if(entityColoring == undefined) {
				entityColoring = {};
			}
			entityColoring[owner] = undefined;
			coloringMap.set(entity.id, entityColoring);
			
			updateVisibleColor(entity.id);
		} else {
			events.log.error.publish({ text: "Entity is undefined." });
		)
	}
	
	function updateVisibleColor(entityId) {
		let entityColoring = coloringMap.get(entityId);
		for(const [i, colorOwner] of Object.entries(colorOwners)) {
			let color = entityColoring[colorOwner];
			if(color != undefined) {
				canvasManipulator.changeColorOfEntities([model.getEntityById(entityId)], color);
				break;
			}
			canvasManipulator.resetColorOfEntities([model.getEntityById(entityId)]);
		}
	}
	
	function registerColorOwner(colorOwner) {
		colorOwners.push(colorOwner);
	}
	
// 	function
	
	return {
		initialize: initialize,
		activate: activate,
		reset: reset,
		
		addColorToEntity: addColorToEntity,
		removeColorFromEntity: removeColorFromEntity,
		registerColorOwner: registerColorOwner
	};
})();
