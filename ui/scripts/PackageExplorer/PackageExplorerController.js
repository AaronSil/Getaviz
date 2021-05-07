var packageExplorerController = (function() {
    
	let packageExplorerTreeID = "packageExplorerTree";
	let jQPackageExplorerTree = "#packageExplorerTree";
	
	let tree;
	
	let codeCovDivs = new Map();

	let controllerConfig = {
		projectIcon: "scripts/PackageExplorer/images/project.png",
		packageIcon: "scripts/PackageExplorer/images/package_icon.png",
		typeIcon:    "scripts/PackageExplorer/images/type_icon.png",
		fieldIcon:   "scripts/PackageExplorer/images/field_icon.png",
		methodIcon:  "scripts/PackageExplorer/images/method_icon.png",
		codeCoverage: true,
		codeCovImg:  "scripts/PackageExplorer/images/colorable_shield.png",
		elementsSelectable: true
	};
	
	function initialize(setupConfig){
        application.transferConfigParams(setupConfig, controllerConfig);
    }
	
	function activate(rootDiv){
		// create “collapseAll” button
		let btnContainer = document.createElement("div");
		btnContainer.style = "width: 100%; margin-left: -1rem; border-bottom: solid 1px #e5e5e5; background-color: #f4f4f4; padding: 0.5rem; position: absolute; top: 1.5rem";
		rootDiv.appendChild(btnContainer);
		let collapseBtn = document.createElement("div");
		collapseBtn.id = "collapseZTreeBtn";
		collapseBtn.innerText = "Collapse All";
		btnContainer.appendChild(collapseBtn);
		$("#collapseZTreeBtn").jqxButton({ theme: "metro" });
		$("#collapseZTreeBtn").on("click", function(event) {
			tree.expandAll(false);
		});
		
		//create zTree div-container
		let zTreeDiv = document.createElement("DIV");
		zTreeDiv.id = "zTreeDiv";
		zTreeDiv.style = "margin-top: 2.5rem";
		
		let packageExplorerTreeUL = document.createElement("UL");
		packageExplorerTreeUL.id = packageExplorerTreeID;
		packageExplorerTreeUL.setAttribute("class", "ztree");
				
		zTreeDiv.appendChild(packageExplorerTreeUL);
		rootDiv.appendChild(zTreeDiv);
				
		//create zTree
		prepareTreeView();
		events.selected.on.subscribe(onEntitySelected);
    }
	
	function reset(){
		prepareTreeView();
	}
    
    function prepareTreeView() {
        
        let entities = model.getCodeEntities();
        let items = [];
		
		//build items for ztree
		entities.forEach(function(entity) {
			
			var item;
			
			if(entity.belongsTo === undefined){
				//rootpackages
				if(entity.type !== "issue" && entity.type !== "Macro"
				&& entity.type !== "And" && entity.type !== "Or"
				&& entity.type !== "Negation") {
					if(entity.type === "Namespace" || entity.type === "TranslationUnit") {
                        item = {
                            id: entity.id,
                            open: false,
                            checked: true,
                            parentId: "",
                            name: entity.name,
                            icon: controllerConfig.packageIcon,
                            iconSkin: "zt"
                        };
                    } else {
                        item = {
                            id: entity.id,
                            open: true,
                            checked: true,
                            parentId: "",
                            name: entity.name,
                            icon: controllerConfig.projectIcon,
                            iconSkin: "zt"
                        };
                    }
                }
            } else {	
				switch(entity.type) {
					case "Project":
						item = { id: entity.id, open: true, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.projectIcon, iconSkin: "zt"};
						break;
					case "Namespace":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.packageIcon, iconSkin: "zt"};
						break;
					case "Class":
                        if(entity.id.endsWith("_2") || entity.id.endsWith("_3")){
                            break;
                        };
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt"};
						break;
					case  "ParameterizableClass":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt"};
						break;
					case "Enum":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt"};
						break;
					case "EnumValue":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.fieldIcon, iconSkin: "zt"};
						break;
					case "Attribute":
					case "Variable":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.fieldIcon, iconSkin: "zt"};
						break;
					case "Method":
					case "Function":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.methodIcon, iconSkin: "zt"};
						break;
					case "Struct":
					case "Union":
						item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt"};
						break;
					default: 
						events.log.warning.publish({ text: "FamixElement not in tree: " + entity.type});

						return;
				}
           }
			if(item !== undefined) {
                items.push(item);
            }
		});
		
		var item;
		
		if(entity.belongsTo === undefined){
			//rootpackages
			if(entity.type !== "issue" && entity.type !== "Macro"
			&& entity.type !== "And" && entity.type !== "Or"
			&& entity.type !== "Negation") {
				if(entity.type === "Namespace" || entity.type === "TranslationUnit") {
					item = {
						id: entity.id,
						open: false,
						checked: true,
						parentId: "",
						name: entity.name,
						icon: controllerConfig.packageIcon,
						iconSkin: "zt",
						type: entity.type
					};
				} else {
					item = {
						id: entity.id,
						open: true,
						checked: true,
						parentId: "",
						name: entity.name,
						icon: controllerConfig.projectIcon,
						iconSkin: "zt",
						type: entity.type
					};
				}
			}
		} else {	
			switch(entity.type) {
				case "Project":
					item = { id: entity.id, open: true, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.projectIcon, iconSkin: "zt", type: entity.type};
					break;
				case "Namespace":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.packageIcon, iconSkin: "zt", type: entity.type};
					break;
				case "Class":
					if(entity.id.endsWith("_2") || entity.id.endsWith("_3")) {
						break;
					};
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt", type: entity.type};
					break;
				case  "ParameterizableClass":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt", type: entity.type};
					break;
				case "Enum":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt", type: entity.type};
					break;
				case "EnumValue":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.fieldIcon, iconSkin: "zt", type: entity.type};
					break;
				case "Attribute":
				case "Variable":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.fieldIcon, iconSkin: "zt", type: entity.type};
					break;
				case "Method":
				case "Function":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.methodIcon, iconSkin: "zt", type: entity.type};
					break;
				case "Struct":
				case "Union":
					item = { id: entity.id, open: false, checked: true, parentId: entity.belongsTo.id, name: entity.name, icon: controllerConfig.typeIcon, iconSkin: "zt", type: entity.type};
					break;
				default: 
					events.log.warning.publish({ text: "FamixElement not in tree: " + entity.type});

				if (sortStringA < sortStringB){
					return -1;
				}
				if (sortStringA > sortStringB){
					return 1;
				}			
				
				return 0;
			}
		);

		//zTree settings
		var settings = {
			check: {
				enable: controllerConfig.elementsSelectable,
				chkboxType: {"Y": "ps", "N": "s"}
			},
			data: {
				simpleData: {
					enable:true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: ""
				}
			},
			callback: {
				onCheck: zTreeOnCheck,
				onClick: zTreeOnClick
			},
			view:{
				showLine: false,
				showIcon: true,
				selectMulti: false,
				addDiyDom: appendCodeCov
			}
		};
		
		//create zTree
        tree = $.fn.zTree.init( $(jQPackageExplorerTree), settings, items);
    }
    
	
	function zTreeOnCheck(event, treeId, treeNode) {
        var nodes = tree.getChangeCheckedNodes();
        
		var entities = [];
		nodes.forEach(function(node){
			node.checkedOld = node.checked; //fix zTree bug on getChangeCheckedNodes	
			entities.push(model.getEntityById(node.id));
		});
								
		var applicationEvent = {			
			sender: 	packageExplorerController,
			entities:	entities
		};
		
		if (!treeNode.checked){
			events.filtered.on.publish(applicationEvent);
		} else {
			events.filtered.off.publish(applicationEvent);
		}
		
    }

    function zTreeOnClick(treeEvent, treeId, treeNode) {
        var applicationEvent = {
			sender: packageExplorerController,
			entities: [model.getEntityById(treeNode.id)]
		};
		events.selected.on.publish(applicationEvent);
    }
	
	function onEntitySelected(applicationEvent) {
        if(applicationEvent.sender !== packageExplorerController) {
			var entity = applicationEvent.entities[0];
			var item = tree.getNodeByParam("id", entity.id, null);            
			tree.selectNode(item, false);
        }
	}
	
	function appendCodeCov(treeId, treeNode) {
		let item = $("#" + treeNode.tId + "_a");
		if ($("#diyBtn_"+treeNode.id).length>0) return;
		if(controllerConfig.codeCoverage && (treeNode.type == "Namespace" || treeNode.type == "Class")) {
			let codeCovDiv = document.createElement("div");
			codeCovDiv.id = treeNode.id + "CodeCov";
			if(controllerConfig.codeCovImg == null) {
				codeCovDiv.classList += "coloredCircle";
				codeCovDiv.style = "background-color: black;";
			} else {
				codeCovDiv = document.createElement("img");
				codeCovDiv.setAttribute("src", controllerConfig.codeCovImg);
				codeCovDiv.classList += "coloredImg";
				codeCovDiv.style += "background-color: black;";
			}
			codeCovDivs.set(treeNode.id, codeCovDiv);
			item.append(codeCovDiv);
		}
	}
	
	
	
	
	
	/*
    function zTreeOnCheck(event, treeId, treeNode) {
        		
		var treeObj = $.fn.zTree.getZTreeObj("packageExplorerTree");
        var nodes = treeObj.getChangeCheckedNodes();
        
		var entityIds = [];
		for(var i = 0; i < nodes.length;i++) {
			nodes[i].checkedOld = nodes[i].checked; //Need for the ztree to set getChangeCheckedNodes correct
			entityIds.push(nodes[i].id);
		}
		
		publishOnVisibilityChanged(entityIds, treeNode.checked, "packageExplorerTree");
		
    }

    function zTreeOnClick(event, treeId, treeNode) {        
		publishOnEntitySelected(treeNode.id, "packageExplorerTree");
    }
    
	
    function onEntitySelected(event, entity) {
        if(event.sender != "packageExplorerTree") {
			var tree = $.fn.zTree.getZTreeObj("packageExplorerTree");   
            var item = tree.getNodeByParam("id", entity.id, null);
            tree.selectNode(item, false);         
        }   
		interactionLogger.logManipulation("PackageExplorerTree", "highlight", entity.id);
    }
    
    function onVisibilityChanged(event, ids, visible) {
        if(event.sender != "packageExplorerTree") {            
			var tree = $.fn.zTree.getZTreeObj("packageExplorerTree");
            
			for(var i = 0; i < ids.length;i++) {
				var item = tree.getNodeByParam("id", ids[i], null);
				tree.checkNode(item, visible, false, false);
				item.checkedOld = item.checked;
			}
        }
		
    }
    
    function onRelationsVisibilityChanged(event, entities, visible) {
        var tree = $.fn.zTree.getZTreeObj("packageExplorerTree");
        for(var i = 0; i < entities.length; i++) {
            var id = entities[i];
            
			var item = tree.getNodeByParam("id", id, null);
            tree.checkNode(item, visible, false, false);
            item.checkedOld = item.checked;
			interactionLogger.logManipulation("PackageExplorerTree", "uncheck", id);
        }
    }
	*/
    
    return {
			initialize: initialize,
			activate: activate,
			reset: reset,
			
			codeCovDivs: codeCovDivs
    };
})();
