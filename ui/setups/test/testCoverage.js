var setup = {
	
	loadPopUp: true,
	
	controllers: [
		
		{
			name: "canvasFlyToController"
		},
		
		{
			name: "canvasHoverController",
		},
		
		{
			name: "canvasMarkController",
			markingColor: "#aa0088"
		},
		
		{
			name: "canvasSelectController",
			color: "#ffff00",
			highlightMode: true
		},
		
		{
			name: "defaultLogger",
			
			logInfoConsole: false,
			logActionConsole: false,
			logEventConsole: false
		},
		
		{
			name: "helpController",
			metaphor: "City original"
		},
		
		{
			name: "infoController",
			system: "JUnit4",
			link: "https://github.com/junit-team/junit4",
			noc: true,
			loc: 39424
		},
		
		{
			name: "menuController",
			menuMapping: [
				
				{
					title: "View",
					subMenu: true,
					items: [
						{
							title: "FlyTo",
							checkBox: true,
							checked: false,
							eventOn: canvasFlyToController.activate,
							eventOff: canvasFlyToController.deactivate
						},
						
						{
							title: "Reset Visualization",
							event: application.reset,
						},
					]
				},
				
				{
					title: "Relations",
					subMenu: true,
					items: [
						{
							title: "Relation Connectors",
							checkBox: true,
							checked: true,
							eventOn: relationConnectorController.activate,
							eventOff: relationConnectorController.deactivate,
						},
						{
							title: "Relation Transparency",
							checkBox: true,
							checked: false,
							eventOn: relationTransparencyController.toggleController,
							eventOff: relationTransparencyController.toggleController,
						},
						{
							title: "Relation Highlight",
							checkBox: true,
							checked: false,
							eventOn: relationHighlightController.toggleController,
							eventOff: relationHighlightController.toggleController
						},
					]
				},
				
				{
					title: "Code Coverage",
					subMenu: true,
					items: [
						{
							title: "Color Classes",
							checkBox: true,
							eventOn: testCoverageController.toggleColorClasses,
							eventOff: testCoverageController.toggleColorClasses
						},
						{
							title: "Color Packages",
							checkBox: true,
							checked: true,
							eventOn: testCoverageController.toggleColorPackages,
							eventOff: testCoverageController.toggleColorPackages
						},
						{
							title: "Class Spheres",
							checkBox: true,
							checked: false,
							eventOn: testCoverageController.toggleClassSpheres,
							eventOff: testCoverageController.toggleClassSpheres
						},
						{
							title: "Package Spheres",
							checkBox: true,
							checked: false,
							eventOn: testCoverageController.togglePackageSpheres,
							eventOff: testCoverageController.togglePackageSpheres
						},
						{
							title: "Coverage Type",
							subMenu: true,
							items: [
								{
									title: "Line Coverage",
									event: testCoverageController.setCoverageType.bind(this, "lineCoverage")
								},
								{
									title: "Branch Coverage",
									event: testCoverageController.setCoverageType.bind(this, "branchCoverage")
								},
								{
									title: "Method Coverage",
									event: testCoverageController.setCoverageType.bind(this, "methodCoverage")
								},
								{
									title: "Statement Coverage",
									event: testCoverageController.setCoverageType.bind(this, "statementCoverage")
								},
								{
									title: "Complexity Coverage",
									event: testCoverageController.setCoverageType.bind(this, 'complexityCoverage')
								}
							]
						}
					]
				}
			]
		},
		
		{
			name: "packageExplorerController",
			codeCoverage: true
		},
		
		{
			name: "relationConnectorController",
			
			fixPositionZ: 1,
			showInnerRelations: true,
			elementShape: "circle",
			sourceStartAtParentBorder: true,
			targetEndAtParentBorder: false,
			createEndpoints: true
		},
		
		{
			name: "relationHighlightController",
			activated: false
		},
		
		{
			name: "relationTransparencyController",
			activated: false
		},
		
		{
			name: "searchController"
		},
		
		{
			name: "sourceCodeController",
			localEnv: true
		},
		
		{
			name: "testCoverageController",
			colorClasses: true,
			colorNamespaces: true,
			classSpheres: false,
			packageSpheres: false,
			showInExplorer: true
		},
		
		{
			name: "tooltipController"
		}
	],
	
	
	uis: [
		{
			name: "UI0",
			
			navigation: {
				//examine, walk, fly, helicopter, lookAt, turntable, game
				type: "turntable",

				//turntable last 2 values - accepted values are between 0 and PI - 0.0 - 1,5 at Y-axis
				typeParams: "0.0 0.0 1.57 3.1"
			},

			area: {
				name: "top",
				orientation: "horizontal",
				resizable: false,
				collapsible: false,
				first: {
					size: "75px",
					collapsible: false,
					controllers: [
						{name: "menuController"},
						{name: "searchController"}
					]
				},
				second: {
					collapsible: false,
					area: {
						orientation: "vertical",
						name: "leftPanel",
						first: {
							size: "15%",
							area: {
								collapsible: false,
								orientation: "horizontal",
								name: "packagePanel",
								first: {
									collapsible: false,
									size: "100%",
									expanders: [
										{
											name: "packageExplorer",
											title: "Package Explorer",
											controllers: [
												{name: "packageExplorerController"}
											]
										}
									]
								},
								second: {}
							}
						},
						second: {
							collapsible: false,
							area: {
								orientation: "vertical",
								collapsible: false,
								name: "canvas",
								first: {
									size: "75%",
									collapsible: false,
									canvas: {},
									controllers: [
										{name: "canvasSelectController"},
										{name: "canvasMarkController"},
										{name: "canvasHoverController"},
										{name: "defaultLogger"},
										{name: "helpController"},
										{name: "infoController"},
										{name: "relationConnectorController"},
										{name: "relationTransparencyController"},
										{name: "relationHighlightController"}
									],
								},
								second: {
									collapsible: false,
									name: "rightPanel",
									expanders: [
										{
											name: "experiment",
											title: "Test Coverage",
											size: "50%",
											controllers: [
												{name: "testCoverageController"}
											]
										},
										{
											name: "codeViewer",
											title: "CodeViewer",
											controllers: [
												{name: "sourceCodeController"}
											]
										}
									]
								}
							}
						}
					}
				}
			}
		}
	]
};
