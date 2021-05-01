var testCoverageController = (function() {
	
	var effects = [];
	var entityEffectMap = new Map();
	var selectedEntity;
	
	var treeMapData = [];
	
	var colorRanges = [
		{ start: 0.0, color: "#ff2222" },
		{ start: 0.5, color: "#ffcc55" },
		{ start: 1.0, color: "#77ff33" }
	];
	
	let highlightModes = {
		THRESHOLD: "THRESHOLD"
	};
	
	let coverageType = {
		STATEMENT: "statementCoverage",
		BRANCH: "branchCoverage",
		LINE: "lineCoverage",
		COMPLEXITY: "complexityCoverage",
		METHOD: "methodCoverage"
	};
	
	let visualization = {
		COLOR_CODE: "COLOR_CODE"
	};
	
	//config parameters	
	var controllerConfig = {
		highlightOn: highlightModes.THRESHOLD,
		coverageType: coverageType.COMPLEXITY,
		threshold: 80,
		visualization: visualization.COLOR_CODE,
		// if any of the following is true a dedicated ui element is being created in the view.
		hmDropdown: false, // refers to highlightModeDropdown
		typeDropdown: true,
		ui: true,
		visDropdown: false,
		treemap: true,
		colorClasses: false,
		colorNamespaces: true,
		spheresCheckboxes: true,
		classSpheres: false,
		packageSpheres: true
	};
	
	
	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		colorController.registerOwner("testCoverageController");
	}
	
	function activate(parent) {
		let eventFunction;
		switch(controllerConfig.visualization) {
			case "COLOR_CODE":
				eventFunction = colorEntity;
				break;
		}
		let entities;
		switch(controllerConfig.highlightOn) {
			case "ALWAYS":
				// color all entities
				colorByThreshold(100);
				break;
			case "HOVER":
				// subscribe for hover events
				actionController.actions.mouse.hover.subscribe(onEntityHover);
				actionController.actions.mouse.unhover.subscribe(onEntityUnhover);
				break;
			case "SELECTED":
				actionController.actions.mouse.key[controllerConfig.selectionMouseKey].up.subscribe(onEntityClicked);
				break;
			case "THRESHOLD":
				// color below threshold
				colorByThreshold(controllerConfig.threshold);
				break;
		}
		if(controllerConfig.spheres) {
			
		}
		createUI(parent);
	}
	
	function createUI(parent) {
		parent.id = "testCoverageDiv";
		parent.style = "margin: 1rem;";
		parent.parentNode.style = parent.parentNode.getAttribute("style") + " overflow-y: scroll;";
		
		// Entity name and coverage bar
		let container = document.createElement("div");
		parent.appendChild(container);
		controllerConfig.ui = true;
		// class name - class cov
		let elementNameText = document.createElement("span");
		elementNameText.id = "elementNameText";
		elementNameText.style = "font-size: 1rem;";
		elementNameText.innerText = "-element name-";
		container.appendChild(elementNameText);
		
		let elementCoverageBar = document.createElement("div");
		elementCoverageBar.id = "elementCoverageBar";
		elementCoverageBar.style = "display: inline; float: right;";
		container.appendChild(elementCoverageBar);
		$("#elementCoverageBar").jqxProgressBar({
			width: "50%",
			height: "1rem",
			showText: true});
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		
		// Threshold
		container = document.createElement("div");
		parent.appendChild(container);
		let thresholdText = document.createElement("span");
		thresholdText.style = "font-size: 0.75rem;";
		thresholdText.innerText = "Display code coverages below: "
		container.appendChild(thresholdText);
		let thresholdInput = document.createElement("input");
		thresholdInput.id = "thresholdInput";
		thresholdInput.type = "Number";
		thresholdInput.setAttribute("value", "contstraints: {minimum: '0.0', maximum: '1.0'}");
		thresholdInput.style = "display: inline; float: right; text-align: center; margin: 0 0.5rem; padding: 0.1rem 0.25rem;";
		container.appendChild(thresholdInput);
		
		$("#thresholdInput").jqxInput({
			width: "3rem",
			height: "1rem",
			value: controllerConfig.threshold
		});
		
		$("#thresholdInput").on("change", function(event) {
			if(typeof(event.args) != "undefined") {
				if(typeof(Number(event.args.value)) != "NaN") {
					controllerConfig.threshold = event.args.value;
					reapplyColors();
				}
			}
		});
		
		// input menu 1-3 + input text for threshold
		if(controllerConfig.hmDropdown) {
			container = document.createElement("div");
			parent.appendChild(container);
			hmDescription = document.createElement("span");
			hmDescription.style = "font-size: 0.75rem;";
			hmDescription.innerText = "Highlight mode:";
			container.appendChild(hmDescription);
			let hmDropdownDiv = document.createElement("div");
			hmDropdownDiv.id = "hmDropdown";
			hmDropdownDiv.style = "display: inline; float: right;";
			container.appendChild(hmDropdownDiv);
			
			let items = [];
			let selected = 0;
			Object.values(highlightModes).forEach(function(el, index) {
				items.push(el.toLowerCase());
				if(controllerConfig.highlightOn.toLowerCase() == items[index]) {
					selected = index;
				}
			});
			$div = $("#hmDropdown").jqxDropDownList({
				width: "50%",
				height: "1rem",
				source: items,
				selectedIndex: selected
			});
			
			$("#hmDropdown").on("select", function(event) {
				let item = $("#hmDropdown").jqxDropDownList("getSelectedItem");
				controllerConfig.highlightOn = highlightModes[item.value.toUpperCase()];
				if(controllerConfig.highlightOn == highlightModes.THRESHOLD) {
					$("#thresholdInput").jqxInput("disabled", false);
				} else {
					$("#thresholdInput").jqxInput({disabled: true});
				}
				reapplyColors();
			});
		}
		if(controllerConfig.typeDropdown) {
			container = document.createElement("div");
			parent.appendChild(container);
			typeDescription = document.createElement("span");
			typeDescription.style = "font-size: 0.75rem;";
			typeDescription.innerText = "Coverage type:";
			container.appendChild(typeDescription);
			let typeDropdownDiv = document.createElement("div");
			typeDropdownDiv.id = "typeDropdown";
			typeDropdownDiv.style = "display: inline; float: right;";
			container.appendChild(typeDropdownDiv);
			
			let items = [];
			let selected = 0;
			Object.values(coverageType).forEach(function(el, index) {
				items.push(el);
				if(controllerConfig.coverageType.toLowerCase == el) {
					selected = index;
				}
			});
			$div = $("#typeDropdown").jqxDropDownList({
				width: "50%",
				height: "1rem",
				source: items,
				selectedIndex: selected
			});
			
			$("#typeDropdown").on("select", function(event) {
				let item = $("#typeDropdown").jqxDropDownList("getSelectedItem");
				switch(item.value) {
					case "statementCoverage":
						controllerConfig.coverageType = coverageType.STATEMENT;
						reapplyColors();
						break;
					case "branchCoverage":
						controllerConfig.coverageType = coverageType.BRANCH;
						reapplyColors();
						break;
					case "lineCoverage":
						controllerConfig.coverageType = coverageType.LINE;
						reapplyColors();
						break;
					case "complexityCoverage":
						controllerConfig.coverageType = coverageType.COMPLEXITY;
						break;
					case "methodCoverage":
						controllerConfig.coverageType = coverageType.METHOD;
						reapplyColors();
						break;
					default:
						console.debug("Unknown coverage type.");
						break;
				}
				let coverage = selectedEntity.testCoverage[controllerConfig.coverageType];
				let color = calculateColor(coverage);
				let hexString = rgbToHex(color);
				let colorRanges = [ { stop: 100, color: hexString } ];
				$("#elementCoverageBar").jqxProgressBar({value: parseInt(100 * coverage), colorRanges: colorRanges});
				$("#elementCoverageBar").jqxProgressBar({value: parseInt(100 * coverage), colorRanges: colorRanges});
				reapplyColors();
			});
		}
		
		// Class and Namespace checkbox
		container = document.createElement("div");
		parent.appendChild(container)
		let checkboxText = document.createElement("span");
		checkboxText.style = "font-size: 0.75rem;";
		checkboxText.innerText = "Apply colors to: ";
		container.appendChild(checkboxText);
		let classesCheckbox = document.createElement("div");
		classesCheckbox.id = "classesCheckbox";
		classesCheckbox.style = "display: inline-block; float: right;";
		classesCheckbox.innerText = "Classes";
		container.appendChild(classesCheckbox);
		$("#classesCheckbox").jqxCheckBox({ checked: controllerConfig.colorClasses });
		$("#classesCheckbox").bind('change', function (event) {
			toggleColorClasses();
		});
		let packagesCheckbox = document.createElement("div");
		packagesCheckbox.id = "packagesCheckbox";
		packagesCheckbox.style = "display: inline-block; float: right;";
		packagesCheckbox.innerText = "Packages";
		container.appendChild(packagesCheckbox);
		$("#packagesCheckbox").jqxCheckBox({ checked: controllerConfig.colorNamespaces });
		$("#packagesCheckbox").bind('change', function (event) {
			toggleColorNamespaces();
		});
		
		if(controllerConfig.spheresCheckboxes) {
			container = document.createElement("div");
			parent.appendChild(container)
			let checkboxText = document.createElement("span");
			checkboxText.style = "font-size: 0.75rem;";
			checkboxText.innerText = "Show spheres around: ";
			container.appendChild(checkboxText);
			
			let classSpheresCheckbox = document.createElement("div");
			classSpheresCheckbox.id = "classSpheresCheckbox";
			classSpheresCheckbox.style = "display: inline-block; float: right;";
			classSpheresCheckbox.innerText = "Classes";
			container.appendChild(classSpheresCheckbox);
			$("#classSpheresCheckbox").jqxCheckBox({ checked: controllerConfig.colorClasses });
			$("#classSpheresCheckbox").bind('change', function (event) {
				toggleClassSpheres();
			});
			
			let packageSpheresCheckbox = document.createElement("div");
			packageSpheresCheckbox.id = "packageSpheresCheckbox";
			packageSpheresCheckbox.style = "display: inline-block; float: right;";
			packageSpheresCheckbox.innerText = "Packages";
			container.appendChild(packageSpheresCheckbox);
			$("#packageSpheresCheckbox").jqxCheckBox({ checked: controllerConfig.packageSpheres });
			$("#packageSpheresCheckbox").bind('change', function (event) {
				togglePackageSpheres();
			});
		}
		
		if(controllerConfig.visDropdown) {
		}
		if(controllerConfig.treemap) {
			let treeMapDiv = document.createElement("div");
			treeMapDiv.id = "treeMap";
			parent.append(treeMapDiv);
			generateTreeMapData();
			$("#treeMap").jqxTreeMap({
				width: "100%",
				height: 300,
				source: treeMapData,
				colorRange: 50,
				hoverEnabled: true,
				renderCallbacks: {
					"*": function(element, value) {
						element.click(function(ev) {
							let entity = model.getEntityById(value.data.id);
							canvasManipulator.flyToEntity(entity);
							let applicationEvent = {
								sender: testCoverageController,
								entities: [entity]
							}
							events.selected.on.publish(applicationEvent);
						});
						element.jqxTooltip({
							content: "<div><div style='font-weight: bold; max-width: 200px; font-family: verdana; font-size: 13px;'>" + value.data.fqn + "</div><div style='width: 200px; font-family: verdana; font-size: 12px;'>Coverage: " + Math.round(value.data.statementCoverage * 100)+"%" + "</div></div>",
							position: "mouse",
							autoHideDelay: 6000
						});
					}
				}
			});
		}
	}
	
	function onEntityHover(applicationEvent) {
		var entity = model.getEntityById(applicationEvent.target.id);
		
		if(entity === undefined) {
			events.log.error.publish({ text: "Entity is not defined"});
		}
		
		if(entity.isTransparent === true) {
			return;
		}

		if(entity.type === "text") {
			return;
		}

		if(entity.marked && entity.selected) {
			colorController.removeColorFromEntity(entity, "testCoverageController");
		} else if(controllerConfig.highlightOn == "HOVER") {
			colorEntity(entity);
		}
	}
	
	function onEntityUnhover(applicationEvent) {
		var entity = model.getEntityById(applicationEvent.target.id);
		
		if(entity.marked && entity.selected) {
		} else if(!entity.selected) {
			colorController.removeColorFromEntity(entity);
		}
		if(entity.type === "Namespace") {
			colorController.removeColorFromEntity(entity);
		}
	}
	
	function onEntitySelected(applicationEvent) {
		var entity = applicationEvent.entities[0];
		
		if(entity.type !== "Class" && entity.type !== "Namespace") {
 			entity = model.getEntityById(entity.belongsTo.id);
			
			
		}
		if(typeof(entity.testCoverage[controllerConfig.coverageType]) !== "undefined" && controllerConfig.ui) {
			selectedEntity = entity;
			document.getElementById("elementNameText").innerText = entity.qualifiedName;
			let color = calculateColor(entity.testCoverage[controllerConfig.coverageType]);
			let hexString = rgbToHex(color);
			let colorRanges = [ { stop: 100, color: hexString } ];
			$("#elementCoverageBar").jqxProgressBar({value: parseInt(100 * entity.testCoverage[controllerConfig.coverageType]), colorRanges: colorRanges});
		}	
	}
	
	function onEntityUnselected(applicationEvent) {
	}
	
	function reapplyColors() {
		effects.forEach(function(el) {
			let parent = el.parentElement;
			parent.removeChild(el);
		});
		effects = [];
		model.getEntitiesByType("Namespace").forEach(function(entity) {
			colorController.removeColorFromEntity(entity, "testCoverageController");
		});
		switch(controllerConfig.highlightOn) {
			case "ALWAYS":
				controllerConfig.highlightOn = highlightModes.ALWAYS;
				colorByThreshold(100);
				drawSpheres();
				break;
			case "HOVER":
				controllerConfig.highlightOn = highlightModes.HOVER;
				break;
			case "SELECTED":
				controllerConfig.highlightOn = highlightModes.SELECTED;
				break;
			case "THRESHOLD":
				controllerConfig.highlightOn = highlightModes.THRESHOLD;
				colorByThreshold(controllerConfig.threshold);
				drawSpheres();
				break;
		}
	}
		
	function calculateColor(coverage) {
		let startColorRange = colorRanges[0];
		let endColorRange = colorRanges[0];
		if(1 < colorRanges.length) {
			for(let i=1; i<colorRanges.length; i++) {
				if(Number(coverage) <= colorRanges[i].start) {
					startColorRange = colorRanges[i-1];
					endColorRange = colorRanges[i];
					break;
				}
			}
		}
		let range = endColorRange.start - startColorRange.start;
		let factor = (coverage - startColorRange.start) / range;
		let color1 = hexToRGB(startColorRange.color);
		let color2 = hexToRGB(endColorRange.color);
		let color = {
			r: Math.round(color1.red*(1-factor)+color2.red*factor),
			g: Math.round(color1.green*(1-factor)+color2.green*factor),
			b: Math.round(color1.blue*(1-factor)+color2.blue*factor)
		};
		return color;
	}
	
	function colorEntity(e) {
		let entity = e;
		if(e.entities) {
			entity = e.entities[0];
		}
		if(entity.testCoverage[controllerConfig.coverageType] !== undefined) {
			let color = calculateColor(entity.testCoverage[controllerConfig.coverageType]);
			let hexString = "#";
			for(el in color) {
				if(color[el].toString(16).length == 1) {
					hexString += 0;
				}
				hexString += color[el].toString(16);
			}
			colorController.addColorToEntity(entity, hexString, "testCoverageController");
		}
	}
	
	function colorByThreshold(threshold) {
		threshold /= 100;
		if(controllerConfig.colorNamespaces) {
			model.getEntitiesByType("Namespace").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] !== undefined) {
					if(el.testCoverage[controllerConfig.coverageType] <= threshold) {
						colorEntity(el);
					} else {
						colorController.removeColorFromEntity(el, "testCoverageController");
					}
				}
			});
		} else {
			model.getEntitiesByType("Namespace").forEach(function(entity) {
				colorController.removeColorFromEntity(entity, "testCoverageController");
			});
		}
		if(controllerConfig.colorClasses) {
			model.getEntitiesByType("Class").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] !== undefined) {
					if(el.testCoverage[controllerConfig.coverageType] <= threshold) {
						colorEntity(el);
						if(controllerConfig.spheres) {
							addGlyph([el]);
						}
					} else {
						colorController.removeColorFromEntity(el, "testCoverageController");
					}
				}
			});
		} else {
			model.getEntitiesByType("Class").forEach(function(entity) {
				colorController.removeColorFromEntity(entity, "testCoverageController");
			});
		}
	}
	
	function drawSpheres(threshold = controllerConfig.threshold) {
		threshold /= 100;
		if(controllerConfig.packageSpheres) {
			model.getEntitiesByType("Namespace").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] <= threshold) {
					addGlyph([el], 1);
				}
			});
		}
		if(controllerConfig.classSpheres) {
			model.getEntitiesByType("Class").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] <= threshold) {
					if(controllerConfig.spheresCheckboxes) {
						addGlyph([el]);
					}
				}
			});
		}
	}
	
	function addGlyph(e, yScale) {
		let scene = document.querySelector("a-scene");
		var glyph = document.createElement("a-sphere");
		scene.appendChild(glyph);
		glyph.addEventListener("loaded", function() {
			let entity = e[0];
			let element = document.getElementById(entity.id);
			if(entity.testCoverage[controllerConfig.coverageType] !== undefined) {
				let color = calculateColor(entity.testCoverage[controllerConfig.coverageType]);
				let threeMesh = this.object3DMap.mesh;
				let entityCenter = canvasManipulator.getCenterOfEntity(entity);
				glyph.object3D.position.set(entityCenter.x, entityCenter.y, entityCenter.z);
				let size = element.getAttribute("geometry");
				let radius = Math.sqrt(2*Math.pow(size.width/2.0, 2))
				glyph.setAttribute("radius", radius);
				if(typeof(yScale) == "undefined") {
					yScale = size.height/radius;
				}
				threeMesh.scale.set(1, yScale,1);
				threeMesh.material.color.setRGB(color.r, color.g, color.b);
				threeMesh.material.transparent = true;
				threeMesh.material.opacity = 0.5;
				threeMesh.material.side = 2;
				threeMesh.material.color.setRGB(color.r/255, color.g/255, color.b/255);
			}
		});
		
		effects.push(glyph);
	}
	
	function removeTestCoverageGlyph() {
		
	}
	
	function hexToRGB(hexString) {
		let r = 0, g = 0, b = 0;
		if(hexString.length == 4) {
			r = "0x" + hexString[1] + hexString[1];
			g = "0x" + hexString[2] + hexString[2];
			b = "0x" + hexString[3] + hexString[3];
		} else if (hexString.length == 7) {
			r = "0x" + hexString[1] + hexString[2];
			g = "0x" + hexString[3] + hexString[4];
			b = "0x" + hexString[5] + hexString[6];
		}
		let color = { red: +r, green: +g, blue: +b };
		return color;
	}
	
	function rgbToHex(rgb) {
		hexString = "#";
		Object.values(rgb).forEach(function(component) {
			if(component.toString(16).length == 1) {
				hexString += "0";
			}
			hexString += component.toString(16);
		});
		return hexString;
	}
	
	function generateTreeMapData() {
		let packages = model.getEntitiesByType("Namespace");
		packages.forEach(function(pkg) {
			let dataObj = {};
			dataObj.label = pkg.name;
			dataObj.value = pkg.testCoverage.lineCount;
			dataObj.data = pkg.testCoverage;
			dataObj.color = rgbToHex(calculateColor(pkg.testCoverage.statementCoverage));
			dataObj.data.id = pkg.id;
			dataObj.data.fqn = pkg.qualifiedName;
			if(typeof(dataObj.label) !== "undefined" && typeof(dataObj.value) !== "undefined") {
				treeMapData.push(dataObj);
			} else {
				console.debug("Values undefined in:");
				console.debug(pkg);
			}
		});
	}
	
	function toggleColorClasses() {
		controllerConfig.colorClasses = !controllerConfig.colorClasses;
		reapplyColors();
	}
	
	function toggleColorPackages() {
		controllerConfig.colorNamespaces = !controllerConfig.colorNamespaces;
		reapplyColors();
	}
	
	function toggleClassSpheres() {
		controllerConfig.classSpheres = !controllerConfig.classSpheres;
		reapplyColors();
	}
	
	function togglePackageSpheres() {
		controllerConfig.packageSpheres = !controllerConfig.packageSpheres;
		reapplyColors();
	}
	
	
	return {
		initialize: initialize,
		activate: activate,
	}
})();
