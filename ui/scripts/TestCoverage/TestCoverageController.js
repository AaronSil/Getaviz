var testCoverageController = (function() {
	
	var effects = [];
	var entityEffectMap = new Map();
	
	let highlightModes = {
		THRESHOLD: "THRESHOLD",
		HOVER: "HOVER",
		SELECTED: "SELECTED",
		ALWAYS: "ALWAYS"
	}
	
	let coverageType = {
		STATEMENT: "statementCoverage",
		BRANCH: "branchCoverage",
		LINE: "lineCoverage",
		COMPLEXITY: "complexityCoverage",
		METHOD: "methodCoverage"
	}
	
	let visualization = {
		COLOR_CODE: "COLOR_CODE",
		GLYPHS: "GLYPHS"
	}
	
	//config parameters	
	var controllerConfig = {
		highlightOn: highlightModes.ALWAYS,
		coverageType: coverageType.STATEMENT,
		threshold: 0.7,
		visualization: visualization.COLOR_CODE
	};
	
	
	function initialize(setupConfig){
		application.transferConfigParams(setupConfig, controllerConfig);
	}
	
	function activate() {
		let eventFunction;
		console.debug(controllerConfig.visualization);
		switch(controllerConfig.visualization) {
			case "COLOR_CODE":
				eventFunction = colorEntity;
				break;
			case "GLYPHS":
				eventFunction = addGlyph;
				break;
		}
		events.selected.on.subscribe(colorEntity);
		events.selected.off.subscribe();
	}
	
	function calculateColor(coverage) {
		console.debug("Coverage: "+coverage);
		let red, green, blue;
		if(Number(coverage) < 0.5) {
			// red to yellow
			red = parseInt(255 * 1.0);
			green = parseInt(255 * coverage * 2);
			blue = parseInt(255 * 0.0);
		} else {
			// yellow to green
			red = parseInt(255 * (1 - coverage) * 2);
			green = parseInt(255 * 1.0);
			blue = parseInt(255 * 0.0);
		}
		console.debug(red+", "+green+", "+blue);
		return { r: red, g: green, b: blue };
	}
	
	function colorEntity(e) {
		let entity = e.entities[0];
		if(!(entity.testCoverage[controllerConfig.coverageType] == undefined)) {
			let color = calculateColor(entity.testCoverage[controllerConfig.coverageType]);
			canvasManipulator.changeColorOfEntities([entity], color);
		}
	}
	
	function addGlyph(e) {
		let scene = document.querySelector("a-scene");
		var glyph = document.createElement("a-box");
		glyph.addEventListener("loaded", function() {
			let entity = e.entities[0];
			console.debug(entity);
			if(!(entity.testCoverage[controllerConfig.coverageType] == null)) {
				let color = calculateColor(entity.testCoverage[controllerConfig.coverageType]);
				let threeMesh = this.object3DMap.mesh;
				let entityCenter = canvasManipulator.getCenterOfEntity(entity)
				threeMesh.position.set(entityCenter.x, entityCenter.y + 10, entityCenter.z);
	// 			threeMesh.position.set(0, 0, 0);
				threeMesh.scale.set(10, 10, 10);
				threeMesh.material.color.setRGB(color.r, color.g, color.b);
			}
		});
		//glyph.setAttribute("flat-shading", true);
		glyph.setAttribute("rotation", "45 45 45");
		glyph.setAttribute("shader", "flat");
		glyph.setAttribute("animation", "property: rotation; dur: 3000; to: 0 360 0; loop: true; easing: linear;");
		
		scene.appendChild(glyph);
		effects.push(glyph);
	}
	
	function removeTestCoverageGlyph() {
		
	}
	
	return {
		initialize: initialize,
		activate: activate,
	}
})();
