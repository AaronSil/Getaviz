var experimentController = (function() {
	
	var initialTime;
	
	var stepOrder;
	var stepOrderIterator = 0;
	
	var steps;
	var currentStep;
	
	var stepTime = 0;
	var stepTextTime = 0;
	
	var controllerConfig = {
		serverURL : "http://" + window.location.host + "/scripts/InteractionLogger/index.php",
		showBackButton: false,
		showSureButton: true,
		showPopup: false,
		displayAsPopover: true
	};
	
	
	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		
		var cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = "scripts/Experiment/ec.css";
		document.getElementsByTagName("head")[0].appendChild(cssLink);
		
		//interactionLogger.logConfig(config.clickConnector, config.clickTransparency, config.taskOrder.toString());
		
		stepOrder = setupConfig.stepOrder;
		steps = setupConfig.steps;
		
		stepTextTime = setupConfig.taskTextButtonTime;
		stepTime = setupConfig.taskTime;
		
		//events
		events.marked.on.subscribe(onEntityMarked);
		events.marked.off.subscribe(onEntityMarked);
	}
	
	
	function activate(parent){
		initialTime = Date.now();
		
		let experimentDiv = document.createElement("div");
		experimentDiv.id = "experimentDiv";
		document.body.appendChild(experimentDiv);
		//taskFieldText and solvedButton
		var experimentHeaderDiv = document.createElement("div");
		experimentHeaderDiv.id = "taskField";
		experimentDiv.appendChild(experimentHeaderDiv);
		
		var taskFieldTextDiv = document.createElement("div");
		taskFieldTextDiv.id = "taskFieldText";
		taskFieldTextDiv.innerHTML = "Step";
		experimentHeaderDiv.appendChild(taskFieldTextDiv);
		
		var buttonDiv = document.createElement("div");
		buttonDiv.id = "taskButtonDiv";
		experimentHeaderDiv.appendChild(buttonDiv);
		
		var taskSolvedButton = document.createElement("input");
		taskSolvedButton.id = "taskSolvedButton";
		taskSolvedButton.value = "Next";
		taskSolvedButton.type = "button";
		buttonDiv.appendChild(taskSolvedButton);
		
		if(controllerConfig.showBackButton) {
			var backButton = document.createElement('input');
			backButton.id = 'backButton';
			backButton.value = 'Back';
			backButton.type = 'button';
			experimentHeaderDiv.appendChild(backButton);
		}
		
		//taskdialog
		var taskDialogDiv = document.createElement("div");
		taskDialogDiv.id = "taskDialog";
		taskDialogDiv.style = "display:none";
		experimentDiv.appendChild(taskDialogDiv);
		
		var taskDialogTitleDiv = document.createElement("div");
		taskDialogTitleDiv.innerHTML = "Step";
		taskDialogDiv.appendChild(taskDialogTitleDiv);
		
		var taskDialogTextDiv = document.createElement("div");
		taskDialogDiv.appendChild(taskDialogTextDiv);
		
		var taskDialogTextH3 = document.createElement("h3");
		taskDialogTextH3.id = "taskText";
		taskDialogTextH3.innerHTML = "TestText";
		taskDialogTextDiv.appendChild(taskDialogTextH3);
		
		var taskDialogOkButton = document.createElement("input");
		taskDialogOkButton.id = "button_ok";
		taskDialogOkButton.value = "OK";
		taskDialogOkButton.type = "button";
		taskDialogTextDiv.appendChild(taskDialogOkButton);
		
		//taskFieldText and solvedButton
		$('#taskSolvedButton').jqxButton({ theme: 'metro' });
		$('#taskSolvedButton').click(taskSolvedButtonClick);

		if(controllerConfig.showBackButton) {
						$('#backButton').jqxButton({theme: 'metro'});
						$('#backButton').click(backButtonClick);
				}
		
		//taskdialog
		$("#taskDialog").jqxWindow({ height: 1000, width: 700, theme: 'metro', isModal: true, autoOpen: false, resizable: false, showCloseButton: false, okButton: $('#button_ok') });
		$("#button_ok").jqxButton({ theme: "metro", width: "50px" });
		$("#button_ok").click(function () {
			if(stepTime != 0){
				startTaskTimer(stepTime);
			}
			$("#taskDialog").jqxWindow('close');
		});
		let menu = $("ul.jqx-menu-ul")
		if(menu.length != 0) parent = menu[0];
		if(controllerConfig.displayAsPopover) {
			let popoverButton = document.createElement("button");
			popoverButton.id = "experimentPopOverButton";
			popoverButton.style = "float: right;";
			popoverButton.innerText = "Experiment";
			parent.appendChild(popoverButton);
			$("#experimentPopOverButton").jqxToggleButton({
				theme: "metro",
				width: 100,
				height: 25,
				textImageRelation: "imageBeforeText",
				textPosition: "left",
				imgSrc: "scripts/Experiment/assignment.png",
				toggled: true
			});
			
			$("#experimentDiv").jqxPopover({ title:"Experiment", showCloseButton: true, selector: $("#experimentPopOverButton"), arrowOffsetValue: 100, height: 500, width: 500, offset: { left: -100, top: 0 } });
			$("#experimentDiv").on("close", function(event) {
				$("#experimentPopOverButton").jqxToggleButton("unCheck");
			});
			$("#experimentDiv").jqxPopover("open");
			taskFieldTextDiv.style = "width: 100%";
		} else {
			parent.parentNode.style.overflowY = "scroll";
			parent.appendChild(experimentDiv);
		}
		//initialize first step
		setNextStep();
		setStepTexts(currentStep.text, 100, 100, 1000, 300, stepTextTime);
		
		setTimeout(taskTimer, 1000);
	}
	
	
	function taskSolvedButtonClick(event) {
		if ($("#taskSolvedButton")[0].value == "Next" && controllerConfig.showSureButton) {
				$("#taskSolvedButton")[0].value = "Sure?"
				setTimeout(resetSolvedButton, 3000);
		} else {
			nextStep();
		}
		logResult(currentStep.text);
		
		// Unmark all marked entties.
		const unmarkEvent = {
			sender: experimentController,
			entities: events.marked.getEntities()
		};
		events.marked.off.publish(unmarkEvent);
	}
	
	function backButtonClick(event) {
		previousStep();
	}
	
	function resetSolvedButton() {
		if ($('#taskSolvedButton')[0].value !== 'Next') $('#taskSolvedButton')[0].value = 'Next';
	}
	
	function nextStep(){
		
		stopTaskTimer();
		
		setNextStep();
		
		setStepTexts(currentStep.text, 100, 100, 1000, 300, stepTextTime);
	}
	
	function previousStep() {
		stopTaskTimer();
		
		setPreviousStep();
		
		setStepTexts(currentStep.text, 100, 100, 1000, 300, stepTextTime);
	}
	
	function setNextStep(){
		
		stepOrderIterator = stepOrderIterator + 1;
		
		var nextStepByStepOrder = stepOrder[stepOrderIterator-1];
		
		steps.forEach(function(step){
			if(step.number == nextStepByStepOrder){
				currentStep = step;
				return;
			}
		});
	}
	
	function setPreviousStep() {
		if (stepOrderIterator > 1) {
			stepOrderIterator = stepOrderIterator - 1;
			var nextStepByStepOrder = stepOrder[stepOrderIterator - 1];
			
			steps.forEach(function(step) {
				if (step.number == nextStepByStepOrder) {
					currentStep = step;
					return;
				}
			});
		}
	}
	
	function setStepTexts(textArray, posx, posy, width, height, time){
		
		var fullText = "";
		
		textArray.forEach(function(text){
			fullText = fullText + text + "<br/>";
		});
		if(controllerConfig.showPopup) {
						showPopup(fullText, posx, posy, width, height, time);
				}
		setText(fullText);
	}
	
	function showPopup(text, posx, posy, width, height, time){
		//open task dialog
		$("#taskText").html(text);
		
		if(time != 0){
			$("#button_ok").jqxButton({ disabled: true });
			setTimeout(timeoutButton, 1000);
			timeout = time;
		}
		
		$("#taskDialog").jqxWindow({ position: { x: posx, y: posy }});
		$("#taskDialog").jqxWindow({ height: height, width: width, maxWidth: width});
		$("#taskDialog").jqxWindow('open');
	}
	
	var timeout = 1;
	
	function timeoutButton(){
		if(timeout == 0){
			$("#button_ok").jqxButton({disabled: false});
			$("#button_ok")[0].value = "OK";
		} else {
			timeout = timeout - 1;
			$("#button_ok")[0].value = timeout;
			setTimeout(timeoutButton, 1000);
		}
	}
	
	
	function setText(text){
		//set task field
		$("#taskFieldText").html(text);	
		$("#taskFieldText").css("text-transform", "none");
	}
	
	
	//function resetSolvedButton(){
	//	$("#taskSolvedButton")[0].value = "Next";
	//}
	
	
	
	
	
	
	
	//timout after task time
	//**********************
	
	var taskTimerOn = false;
	var timeOutTime = 0;
	
	function taskTimer(){
		
		setTimeout(taskTimer, 1000);
		
		if(!taskTimerOn){
			return;
		}
		var timeNow = Date.now();
		if(timeNow >  timeOutTime){
			nextStep();
		}
	}
	
	
	function startTaskTimer(timeoutInMin){
		timeOutTime = Date.now() + ( timeoutInMin * 60 * 1000);
		taskTimerOn = true;
	}
	
	function stopTaskTimer(){
		taskTimerOn = false;
	}
	
	
	
	
	
	
	
	//log task states
	//***************
	function onEntityMarked(applicationEvent) {	
		if(!currentStep.entities){
			return;
		}
		
		var taskState = getTaskState();

		var entity = applicationEvent.entities[0];
		
		events.log.controller.publish({ text: "experimentController", var1: currentStep.number, var2: taskState.missingMarks, var3: taskState.falseMarks, var4: entity.qualifiedName });
	}
	
	function getTaskState(){
		
		var markedEntites = events.marked.getEntities();
		
		var taskEntitiesIds = currentStep.entities;
		
		var correctMarks = 0;
		var falseMarks = 0;
		var missingMarks = 0;
		
		for(var i = 0; i < taskEntitiesIds.length; i++) {
			if(markedEntites.has(taskEntitiesIds[i])){
				correctMarks++;
			} else {
				missingMarks++;
			}
		}
		
		falseMarks = markedEntites.size - correctMarks;
		
		return {
			missingMarks: missingMarks,
			falseMarks: falseMarks
		};
	
	}
	
	function logResult(taskText) {
		var post = "logFile=" + initialTime + "_ExpResults.txt" + "&" + "logText=";
		
		var timeStamp = new Date();
		
		var year  = timeStamp.getFullYear();
		var month = timeStamp.getMonth() + 1;
		var day   = timeStamp.getDate();
		
		var seconds = timeStamp.getSeconds();
		var minutes = timeStamp.getMinutes();
		var hours   = timeStamp.getHours();
		
		var timeString = day + "." + month + "." +year + " " + hours + ":" + minutes + ":" + seconds;
		
		post += "Time: " + timeString + "\n";
		post += "Task: " + taskText + "\n";
		post += "Marked:\n"
		Array.from(events.marked.getEntities().entries()).forEach(function(el) {
			post += el[1].type + ","+ el[1].id + "," + el[1].qualifiedName + "\n";
		});
		post += "\n";
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("POST", controllerConfig.serverURL, true);
		xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlHttp.send(post);
		
		logStrings = [];
	}
	
	return {
		initialize: initialize,
		activate: activate
	};
}
)();


