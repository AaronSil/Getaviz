var setup = {
		
	controllers: [	

		{ name: 	"defaultLogger",
			logActionConsole	: false,
			logEventConsole		: false
		},
		
		{	name: 	"sourceCodeController"
		},
		
		{ name: "canvasHoverController"
		},
		
		{	name: 	"canvasSelectController" 
		},
		
		{	name: 	"canvasMarkController",
			selectionMode: "DURATION",
			selectionDurationSeconds: 0.5,
			selectionMoveAllowed: false,
			showProgressBar: true, 
		},
		
		{ name: "canvasResetViewController" 
		},
		
		{ name: "relationConnectorController",
			sourceStartAtBorder: true,
			targetEndAtBorder: true
		},
		
		{
			name: "testCoverageController"
		}
	],
		

	uis: [
		{
			name: "UI0",
			navigation: {
				type:	"turntable"
			},
			
			area: {
				name: "left",
				orientation: "vertical",
				
				first: {
					size: "30%"	,
					
					area: {
						name: "top0",
						orientation: "horizontal",
						collapsible: false,
						
						first: {
							size: "60%",
							
							controllers: [
								{ name: "testCoverageController" }
							]
						},
						second: {
							controllers: [
								{ name: "sourceCodeController" }
							]
						}
					}
				},
				second: {
					size: "70%",
					min: "200",
					collapsible: false,
						
					size: "85%",	
					collapsible: false,
					canvas: { },
					controllers: [
						{ name: "defaultLogger" },
						{ name: "canvasHoverController" },
						{ name: "canvasSelectController" },
						{ name: "canvasMarkController" },
						{ name: "relationConnectorController" }
					]
				}
			}	
			
		}
	
	]
};
