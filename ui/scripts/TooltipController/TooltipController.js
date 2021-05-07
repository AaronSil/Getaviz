var tooltipController = (function() {
	
	var controllerConfig = {
		activated: true
	};
	
	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		
		events.hovered.on.subscribe(onEntityHover);
		events.hovered.off.subscribe(onEntityUnhover);
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
