var tooltipController = (function() {
	
	var tooltipContainer;
	var registeredDivs = [];
	
	var domRect;
	
	var controllerConfig = {
		activated: true,
		
		qualifiedName: false,
		belongsTo: false,
		displayRegisteredDivs: true
	};
	
	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		
		events.hovered.on.subscribe(onEntityHover);
		events.hovered.off.subscribe(onEntityUnhover);
		
		var cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = "scripts/TooltipController/tooltip.css";
		document.getElementsByTagName("head")[0].appendChild(cssLink);
		
		createContainer();
	}
	
	function createContainer() {
		tooltipContainer = document.createElement("div");
		tooltipContainer.id = "tooltipDiv";
		AFRAME.scenes[0].appendChild(tooltipContainer);
		
		let stdContentDiv = document.createElement("div");
		stdContentDiv.id = "tooltipStdContentDiv";
		tooltipContainer.appendChild(stdContentDiv);
		
		let container = document.createElement("div");
		container.classList += "modularDiv";
		stdContentDiv.appendChild(container);
		// Type
		let field = document.createElement("p");
		field.id  = "tooltipType";
		field.classList += "tooltipLeft";
		container.appendChild(field);
		// Name
		let value = document.createElement("p");
		value.id = "tooltipName";
		value.classList += "tooltipRight";
		container.appendChild(value);
		// Belongs To
		container = document.createElement("div");
		container.classList += "modularDiv";
		stdContentDiv.appendChild(container);
		field = document.createElement("p");
		field.id  = "tooltipBelongsTo";
		field.classList += "tooltipLeft";
		container.appendChild(field);
		value = document.createElement("p");
		value.id = "tooltipParentName";
		value.classList += "tooltipRight";
		container.appendChild(value);
	}
	
	function onEntityHover(applicationEvent) {
		if(controllerConfig.activated) {
			let entity = applicationEvent.entities[0];
			
			if(domRect == undefined) {
				domRect = AFRAME.scenes[0].getBoundingClientRect();
			}
			
			let tooltip = $("#tooltipDiv");
			tooltip.css("display", "block");
			
			if(controllerConfig.qualifiedName) {
				$("#tooltipName").text(entity.qualifiedName);
			} else {
				$("#tooltipName").text(entity.name);
			}
			if(entity.type == "Method") {
				$("#tooltipName").text(entity.signature);
			}
			$("#tooltipType").text(entity.type + ":");
			
			if(controllerConfig.belongsTo) {
				$("#tooltipParentName").parent().css("display", "inline-block");
				if(entity.belongsTo) {
					$("#tooltipBelongsTo").text("Belongs to:");
					let parent = model.getEntityById(entity.belongsTo.id);
					$("#tooltipParentName").text(parent.qualifiedName);
				} else {
					$("#tooltipParentName").text("-");
				}
			} else {
				$("#tooltipParentName").parent().css("display", "none");
			}
			
			registeredDivs.forEach(function(el) {
				let div = el.callback.apply(document, [el.element, applicationEvent]);
			});
			
			let posX = Math.min(domRect.right - 600, applicationEvent.posX + 50);
			let posY = Math.min(domRect.bottom - 250, applicationEvent.posY + 50);
			tooltip.css("top", posY + "px");
			tooltip.css("left", posX +  "px");
		}
	}
	
	function onEntityUnhover(applicationEvent) {
			$("#"+tooltipDiv.id).css("display", "none");
	}
	
	function register(callback) {
		let registeredDiv = document.createElement("div");
		$("#"+tooltipContainer.id).append(registeredDiv);
		registeredDivs.push({
			callback: callback,
			element:  registeredDiv
		});
	}
	
	function unregister(callback) {
		let index = registeredDiv.findIndex(function(el) {
			return el.callback == callback;
		});
		tooltipContainer.removeChild(registeredDivs[index].element)
		let rmEl = registeredDivs.splice(index, 1);
		console.debug("Removed element at "+index+". New length = "+registeredDivs.length);
	}
	
	function toggleController() {
		controllerConfig.activated = !controllerConfig.actived;
	}
	
	return {
		initialize: initialize,
		
		toggleController: toggleController,
		
		register: register,
		unregister: unregister
	};
})();
