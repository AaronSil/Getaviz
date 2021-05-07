var tooltipController = (function() {
	
	var controllerConfig = {
		activated: true
	};
	
	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
	}
	
	function toggleController() {
		controllerConfig.activated = !controllerConfig.actived;
	}
	
	return {
		initialize: initialize,
		
		toggleController: toggleController
	};
})();
