var setup = {
	
	loadPopUp: true,
	
	
	controllers: [
		{
			name: "defaultLogger",
			
			logInfoConsole: false,
			logActionConsole: false,
			logEventConsole: false
		},
		
		{
			name: "generationFormController",
		},
		
		{
			name: "canvasHoverController",
		},
		
		{
			name: "canvasMarkController",
		},
		
		{
			name: "canvasSelectController"
		},
		
		{
			name: "canvasFilterController"
		},
		
		{
			name: "experimentController",
			showSureButton: false,
			showPopup: false,
			displayAsPopOver: true,
		
			stepOrder:	[ 10, 20, 30, 40, 50, 60, 70, 80 ],
						
			steps: [
				{
					number:	10,
					text: [
						"<h3>Willkommen zum Experiment.</h3>",
						"In dieser Interface-Konfiguration können Sie die Codeabdeckung des Softwareprojekts erforschen.",
						"Klassen und Pakete werden dazu entsprechend ihrer Codeabdeckung eingefärbt oder sind von farbigen Spheren umgeben.",
						"Über den Punkt „Code Coverage“ in der Menüleiste können Sie die Einstellungen der Anzeige verändern.",
						"Im Unterfenster „Code Coverage“ auf der rechten Seite, wird die Codeabdeckung der derzeit ausgewählten Entität angezeigt.",
						"Nehmen Sie sich einen Moment Zeit, um sich mit den neuen Funktionen vertraut zu machen.",
						"Starten Sie das Experiment über den „Next“-Button sobald sie soweit sind."
					],
					ui: 	"UI0"
				},
				
				{
					number:	20,
					text: [
						"<h3>Aufgabe 1</h3>",
						"Markieren Sie zwei Klassen mit einer absolut betrachtet hohen Anzahl ungetesteter Zeilen (Line Coverage)."
					],
					ui: 	"UI1"
				},
				
				{
					number: 30,
					text: [
						"<h3>Aufgabe 2</h3>",
						"Markieren Sie die zwei Pakete mit der niedrigsten Methodenabdeckung (methodCoverage)."
					],
					ui: "UI2"
				},
				
				{
					number: 40,
					text: [
						"<h3>Aufgabe 3</h3>",
						"Markieren Sie im Paket „org.junit.internal.builders“ alle Klassen mit einer unvollständigen (d.h. <100%) zyklischen Komplexitätsabdeckung (Complexity Coverage)."
					],
					ui: "UI2"
				},
				
				{
					number: 50,
					text: [
						"<h3>Aufgabe 4</h3>",
						"Markieren Sie alle Klassen mit einer Codeabdeckung zwischen 10% und 40%."
					],
					ui: "UI2"
				},
				
				{
					number: 60,
					text: [
						"<h3>Aufgabe 5</h3>",
						"Markieren Sie alle Klassen die von der Klasse „org.junit.runners.ParentRunner“ erben und eine Codeabdeckung von weniger als 90% besitzen."
					],
					ui: "UI2"
				},
				
				{
					number: 70,
					text: [
						"<h3>Aufgabe 6</h3>",
						"In ihrem Projekt streben Sie eine Zeilenabdeckung (lineCoverage) von mindestens 50% pro Klasse an.",
						"In einer Bemühung die Anzahl der unzureichend getesteten Klassen zu reduzieren sollen zuerst die Pakete überarbeitet werden, in denen der Anteil dieser unzureichend getesteten Klassen am größten ist.",
						"Markieren Sie die zwei Pakete, welche das höchste Verhältnis von Klassen mit unzureichender zu Klassen mit ausreichender Codeabdeckung aufweisen." 
					],
					ui: "UI2"
				},
				
				{
					number: 80,
					text: [
						"<h3>Vielen Dank für Ihre Teilnamhe</h3>",
						"Sie haben alle Aufgaben des Experiments abgeschlossen.",
						"Bitte wenden Sie sich an die Experimentsleitung."
					],
					ui: "UI2"
				}
			]
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
			name: "canvasFlyToController"
		},
		
		
		
		{
			name: "packageExplorerController",
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
			name: "relationTransparencyController",
			activated: false
		},
		
		{
			name: "relationHighlightController",
			activated: false
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
		}
	],
	
	
	uis: [
		
		
		{
				name: "UI0",

				navigation: {
						//examine, walk, fly, helicopter, lookAt, turntable, game
						type: "turntable",

						//turntable last 2 values - accepted values are between 0 and PI - 0.0 - 1,5 at Y-axis
						typeParams: "0.0 0.0 1.57 3.1",

						//speed: 10
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
							],
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
																	],
															}
													]
											},
											second: {},
									},
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
										{name: "defaultLogger"},
										{name: "canvasSelectController"},
										{name: "canvasMarkController"},
										{name: "canvasHoverController"},
										{name: "canvasFilterController"},
										//{name: "canvasFlyToController"},
										{name: "helpController"},
										{name: "infoController"},
										{name: "experimentController"},
										{name: "tooltipController"},
										{name: "relationConnectorController"},
										{name: "relationTransparencyController"},
										{name: "relationHighlightController"},
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
												{
													name: "testCoverageController",
												}
											],
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
