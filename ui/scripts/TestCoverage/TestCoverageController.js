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
		reapplyColors();
	}
	
	function createUI(parent) {
		parent.id = "testCoverageDiv";
		parent.style = "margin: 1rem;";
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
				setCoverageType(item.value);
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
		updateCoverageBar(entity);
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
	
	function updateCoverageBar(entity) {
		if($("#elementCoverageBar").length != 0) {
			if(entity == undefined) entity = model.getEntityById(Array.from(events.selected.getEntities())[0][0]);
			if(entity == undefined) return;
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
		updateCoverageBar();
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
