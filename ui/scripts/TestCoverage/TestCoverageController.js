var testCoverageController = (function() {
	
	var effects = [];
	var selectedEntity;
	var coverageBars = [];
	
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
	
	let visualization = { // without functionality so far
		COLOR_CODE: "COLOR_CODE",
		TRANSPARENCY: "TRANSPARENCY",
		SPHERES: "SPHERES"
	};
	
	//config parameters	
	var controllerConfig = {
		coverageType: coverageType.LINE,
		lowerThreshold: 0,
		upperThreshold: 80,
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
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		
		createUI(parent);
		reapplyColors();
	}
	
	function createUI(parent) {
		parent.id = "testCoverageDiv";
		parent.parentNode.style = parent.parentNode.getAttribute("style") + " overflow-y: scroll;";
		
		// "Settings"
		// Slider
		let sectionHeading = document.createElement("h3");
		sectionHeading.innerText = "Settings:"
		parent.appendChild(sectionHeading);
		let container = document.createElement("div");
		parent.appendChild(container);
		let sliderLabel = document.createElement("span");
		sliderLabel.innerText = "Highlighted code coverage range:";;
		container.appendChild(sliderLabel);
		container.appendChild(document.createElement("br"))
		let valLabel = document.createElement("span");
		valLabel.id = "sliderMinLabel";
		valLabel.innerText = controllerConfig.lowerThreshold;
		container.appendChild(valLabel);
		valLabel = document.createElement("span");
		valLabel.id = "sliderMaxLabel";
		valLabel.innerText = controllerConfig.upperThreshold;
		valLabel.style = "float: right;"
		container.appendChild(valLabel);
		let rangeSlider = document.createElement("div");
		rangeSlider.style = "margin: auto;";
		rangeSlider.id = "rangeSlider";
		container.appendChild(rangeSlider);
		$("#rangeSlider").jqxSlider({ tooltip: true, showButtons: true, height: "48px", min: 0, max: 100, step: 1, ticksFrequency: 10, mode: "fixed", values: [controllerConfig.lowerThreshold, controllerConfig.upperThreshold], rangeSlider: true, width: "100%", theme: "metro"});
		$("#rangeSlider").on("change", function(event) {
			let lower = event.args.value.rangeStart;
			let upper = event.args.value.rangeEnd;
			if(lower != controllerConfig.lowerThreshold || upper != controllerConfig.upperThreshold) {
				setThreshold(lower, upper);
			}
		});
		// Type Dropdown List
		if(controllerConfig.typeDropdown) {
			container = document.createElement("div");
			parent.appendChild(container);
			typeDescription = document.createElement("span");
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
				setCoverageType(item.value);
			});
		}
		
		// Entity name and coverage bar
		sectionHeading = document.createElement("h3");
		sectionHeading.innerText = "Selected Entity:";
		parent.appendChild(sectionHeading);
		container = document.createElement("div");
		parent.appendChild(container);
		controllerConfig.ui = true;
		let entityTypeLabel = document.createElement("span");
		entityTypeLabel.id = "entityTypeLabel";
		entityTypeLabel.innerText = "Type:";
		container.appendChild(entityTypeLabel);
		container.appendChild(document.createElement("br"));
		let entityNameLabel = document.createElement("span");
		entityNameLabel.id = "entityNameLabel";
		entityNameLabel.style = "float: right;";
		container.appendChild(entityNameLabel);
		container.appendChild(document.createElement("br"));
		let tmpLabel = document.createElement("span");
		tmpLabel.innerText = "Belongs to:";
		container.appendChild(tmpLabel);
		container.appendChild(document.createElement("br"));
		let belongsToLabel = document.createElement("span");
		belongsToLabel.id = "belongsToLabel";
		belongsToLabel.style = "float: right";
		container.appendChild(belongsToLabel);
		
		container = document.createElement("div");
		container.id = "entityCoverageDiv";
		parent.appendChild(container);
		
		let coverageOf = document.createElement("span");
		coverageOf.id = "coverageOfLabel";
		coverageOf.innerText = "Package/Class Coverage:";
		container.appendChild(coverageOf);
		container.appendChild(document.createElement("br"));
		Object.values(coverageType).forEach(function(type) {
			let innerContainer = document.createElement("div");
			container.appendChild(innerContainer);
			let coverageTypeLabel = document.createElement("span");
			coverageTypeLabel.innerText = type+":";
			container.appendChild(coverageTypeLabel);
			let elementCoverageBar = document.createElement("div");
			elementCoverageBar.id = type+"Bar";
			elementCoverageBar.style = "display: inline; float: right;";
			innerContainer.appendChild(elementCoverageBar);
			let progressBar = $("#"+type+"Bar").jqxProgressBar({
				width: "50%",
				height: "0.75rem",
				showText: true
			});
			coverageBars.push(progressBar);
			container.appendChild(document.createElement("br"));
		});
		console.debug(coverageBars);
		parent.appendChild(container);
		
		// Class and Namespace checkbox
		if(controllerConfig.coloringCheckboxes) {
			container = document.createElement("div");
			parent.appendChild(container)
			let checkboxText = document.createElement("span");
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
		}
		
		if(controllerConfig.spheresCheckboxes) {
			container = document.createElement("div");
			parent.appendChild(container)
			let checkboxText = document.createElement("span");
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
							content: "<div><div style='font-weight: bold; max-width: 200px; font-family: verdana; font-size: 12px;'>" + value.data.fqn + "</div><div style='width: 200px; font-family: verdana; font-size: 12px;'>Coverage: " + Math.round(value.data.statementCoverage * 100)+"%" + "</div></div>",
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
		selectedEntity = applicationEvent.entities[0];
		updateLabels();
		updateCoverageBars();
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
		model.getEntitiesByType("Class").forEach(function(entity) {
			colorController.removeColorFromEntity(entity, "testCoverageController");
		});
		colorByThreshold();
		drawSpheres();
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
	
	function colorByThreshold() {
		let lower = controllerConfig.lowerThreshold/100.0;
		let upper = controllerConfig.upperThreshold/100.0;
		if(controllerConfig.colorNamespaces) {
			model.getEntitiesByType("Namespace").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] !== undefined) {
					let coverage = el.testCoverage[controllerConfig.coverageType]
					if(lower <= coverage && coverage <= upper) {
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
					let coverage = el.testCoverage[controllerConfig.coverageType]
					if(lower <= coverage && coverage <= upper) {
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
	
	function drawSpheres() {
		let lower = controllerConfig.lowerThreshold/100.0;
		let upper = controllerConfig.upperThreshold/100.0;
		if(controllerConfig.packageSpheres) {
			model.getEntitiesByType("Namespace").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] !== undefined) {
					let coverage = el.testCoverage[controllerConfig.coverageType];
					if(lower <= coverage && coverage <= upper) {
						addGlyph([el], 1);
					}
				}
			});
		}
		if(controllerConfig.classSpheres) {
			model.getEntitiesByType("Class").forEach(function(el) {
				if(el.testCoverage[controllerConfig.coverageType] !== undefined) {
					let coverage = el.testCoverage[controllerConfig.coverageType];
					if(lower <= coverage && coverage <= upper) {
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
	
	function updateLabels() {
		let type = selectedEntity.type;
		document.getElementById("entityTypeLabel").innerText = type + ":";
		let name = selectedEntity.name;
		if(type == "Method") {
			var re = /\w+\./g;
			name = selectedEntity.signature.replace(re, "");
		}
		document.getElementById("entityNameLabel").innerText = name;
		document.getElementById("belongsToLabel").innerText = selectedEntity.belongsTo.qualifiedName;
		if(selectedEntity.type == "Namespace") {
			document.getElementById("coverageOfLabel").innerText = "Package coverage:"; 
		} else {
			document.getElementById("coverageOfLabel").innerText = "Class coverage:"; 
		}
	}
	
	function updateCoverageBars() {
		let entityWithCoverage = selectedEntity;
		if(selectedEntity.type != "Class" && selectedEntity.type != "Namespace") {
			entityWithCoverage = selectedEntity.belongsTo;
		}
		Object.values(coverageBars).forEach(function(bar) {
			let type = bar[0].id.replace("Bar", "");
			if(entityWithCoverage.testCoverage[type] !== undefined) {
				let color = calculateColor(entityWithCoverage.testCoverage[type]);
				let hexString = rgbToHex(color);
				let colorRanges = [ { stop: 100, color: hexString } ];
				$("#"+type+"Bar").jqxProgressBar({value: parseInt(100 * entityWithCoverage.testCoverage[type]), colorRanges: colorRanges, disabled: false});
			} else {
				$("#"+type+"Bar").jqxProgressBar({disabled: true});
			}
		});
	}
	
	function setCoverageType(typeOrIndex) {
		if(typeof typeOrIndex == "number") {
			typeOrIndex = Object.values(coverageType)[typeOrIndex];
		}
		controllerConfig.coverageType = typeOrIndex;
		let typeDropdown = $("#typeDropdown");
		if(typeDropdown.length != 0) {
			let selected = 0;
			selected = ($("#typeDropdown").jqxDropDownList("getItemByValue", typeOrIndex));
			selected = selected.index;
			$("#typeDropdown").jqxDropDownList("selectIndex", selected);
		}
		reapplyColors();
		updateCoverageBars();
		return "Code coverage type set to " + typeOrIndex;
	}
	
	function setThreshold(lower, upper) {
		if(lower < 0 || 100 < upper || upper < lower) {
			events.log.error.publish({ text: "Unaccepted threshold inputs." });
			return;
		}
		let inputField = $("#thresholdInput");
		controllerConfig.lowerThreshold = lower;
		controllerConfig.upperThreshold = upper;
		$("#rangeSlider").jqxSlider({ values: [lower, upper] });
		document.getElementById("sliderMinLabel").innerText = lower;
		document.getElementById("sliderMaxLabel").innerText = upper;
		reapplyColors();
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
		
		setCoverageType: setCoverageType,
		setThreshold: setThreshold,
		toggleColorClasses: toggleColorClasses,
		toggleColorPackages: toggleColorPackages,
		toggleClassSpheres: toggleClassSpheres,
		togglePackageSpheres: togglePackageSpheres
	};
})();
