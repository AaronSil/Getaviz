var relationHighlightController = function(){
		
	var relatedEntities = new Array();
	var activated = false;

    var controllerConfig = {
        color : "#000000",
        unfadeOnHighlight : true
    };
	
	function initialize(setupConfig){
		application.transferConfigParams(setupConfig, controllerConfig);
		
		events.selected.on.subscribe(onRelationsChanged);
		
		colorController.registerOwner("relationHighlightController");
	}
	
	function activate(){	
		
		activated = true;
		if(relatedEntities.length != 0){
			highlightRelatedEntities();
		}
	}

	function deactivate(){	
		reset();
		activated = false;
	}
	
	function reset(){
		relatedEntities.forEach(function(entity) {
			colorController.removeColorFromEntity(entity, "relationHighlightController");
		});
	}
	
	
	function resetColor(){
		if(relatedEntities.length == 0){	
			return;
		}

		var relatedEntitiesMap = new Map();
		
		//highlight related entities
		relatedEntities.forEach(function(relatedEntity){		
			if(relatedEntity.marked){
				return;
			}
			
			if(relatedEntitiesMap.has(relatedEntity)){
				return;
			}

			relatedEntitiesMap.set(relatedEntity, relatedEntity);
		});

		Array.from(relatedEntitiesMap.keys()).forEach(function(entity) {
			colorController.removeColorFromEntity(entity, "relationHighlightController");
		});
	}
		
	
	function onRelationsChanged(applicationEvent) {
		
		resetColor();
		
		
		//get related entities
		var entity = applicationEvent.entities[0];	
		
		relatedEntities = new Array();
		
		switch(entity.type) {
			case "Class":
				relatedEntities = relatedEntities.concat(entity.superTypes);
				relatedEntities = relatedEntities.concat(entity.subTypes);
				break;
			case  "ParameterizableClass":
				relatedEntities = relatedEntities.concat(entity.superTypes);
				relatedEntities = relatedEntities.concat(entity.subTypes);
				break;			
			case "Attribute":
				relatedEntities = entity.accessedBy;
				break;
			case "Method":
			case "Function":
				relatedEntities = entity.accesses;
				relatedEntities = relatedEntities.concat( entity.calls );
				relatedEntities = relatedEntities.concat( entity.calledBy );			
				break;
			
			default: 				
				return;
		}


		if(relatedEntities.length == 0){
			return;
		}
		
		if(activated){
			highlightRelatedEntities();
		}
		
	}

	function highlightRelatedEntities(){
		var relatedEntitiesMap = new Map();
		
		//highlight related entities
		relatedEntities.forEach(function(relatedEntity){		
			if(relatedEntity.marked){
				return;
			}
			
			if(relatedEntitiesMap.has(relatedEntity)){
				return;
			}

			relatedEntitiesMap.set(relatedEntity, relatedEntity);
		});

		if(controllerConfig.unfadeOnHighlight) {
			canvasManipulator.resetTransparencyOfEntities(Array.from(relatedEntitiesMap.keys()));
		}
		Array.from(relatedEntitiesMap.keys()).forEach(function(entity) { colorController.addColorToEntity(entity, controllerConfig.color, "relationHighlightController");
		});
	}

		

	return {
        initialize	: initialize,
		reset		: reset,
		activate	: activate,
		deactivate	: deactivate
    };    

}();
