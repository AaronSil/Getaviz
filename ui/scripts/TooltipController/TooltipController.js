var tooltipController = (function() {
	
	var controllerConfig = {
		activated: true
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
	}
	
	function onEntityHover(applicationEvent) {
		if(controllerConfig.activated) {
			
		}
	}
	
	function onEntityUnhover(applicationEvent) {
		if(controllerConfig.activated) {
			
		}
	}
	
	function toggleController() {
		controllerConfig.activated = !controllerConfig.actived;
	}
	
	return {
		initialize: initialize,
		
		toggleController: toggleController
	};
})();
