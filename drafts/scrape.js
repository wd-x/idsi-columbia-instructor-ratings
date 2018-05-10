
var firData;

var filterGlobalCore = false;
var filterTechnical = false;
var filterNonTechnical = false;
var minLevel = 1000;
var maxLevel = 4000;
var filterGold = false;
var filterSilver = false;

var tableData = [];
var pageNumber = 0;

var leftPageEnabled = false;
var rightPageEnabled = false;

var firstRun = true;

var ipAddress = "";
var userIDset = false;

var showProfs = false;
var queryNum = "s6"
var threshholdNum = 0;

var isLooking = false;

var qChoices = ["s1","s2","s3","s4","s5","s6","s7","s9",]



function ab(b){
	if (b) {
		return "O";
	}
	return "X";
}

function filter(){
	isLooking = true;
	document.getElementById('searchbar').value = "";
	//console.log("started filter");
	document.getElementById("submitquery").disabled = true;
	setTimeout(function(){document.getElementById("submitquery").disabled = false;}, 700);
	var textParam = null;//retrieveElement("textparam");
	if (!textParam) {textParam = "";}
	var lastSunday = dateOfLastSunday();
	writeData("PrivateStatistics/Searches/" + lastSunday + "/" + Date.now() + " " + $.cookie('userID'), "T: " + ab(filterTechnical) + ", NT: " + ab(filterNonTechnical) + 
		", GC: " + ab(filterGlobalCore) + ", Min: " + (minLevel/1000) + ", Max: " + (maxLevel/1000) + ", SN: " + ab(filterSilver) + ", GN: " + ab(filterGold));

	var datArr = substrSearch(textParam,queryNum,showProfs);
	datArr = filterList(datArr);
	datArr = sortList(datArr);

	d = []
	for (var i = 0; i < qChoices.length; i++) {
		if (filterList(substrSearch(textParam,qChoices[i],showProfs)).length > 0)
			d.push(qChoices[i]);
	}
	console.log(d);

		//console.log(datArr);
		setTable(0,datArr);
		$("#searchres").html("<font color=\"grey\"><b>("+ datArr.length +" Results)</b></font>");

		if (datArr.length > 0){
			$("#tableerror").html("");
		} else {
			$("#tableerror").html("<b>No results matched your search</b>");
		}

		return firebase.database().ref().child("Statistics").once('value').then(function(snapshot) {
			if (window.location.protocol == 'https:'){
				var data = snapshot.val();
				var toWrite = data["Search-Queries"];
				writeData("Statistics/Search-Queries",toWrite+1);
			}
		});
	}

	function sortList(datArr){
		datArr.sort(function(a,b) { 

			if (a["query"] < b["query"])
				return 1;
			else if (b["query"] < a["query"])
				return -1
			else {
				if (showProfs && a["Instructor_Quality"] < b["Instructor_Quality"])
					return 1;
				else if (showProfs && b["Instructor_Quality"] < a["Instructor_Quality"])
					return -1;
				else
					return 0;
			}

		} );

		return datArr;
	}

	function filterList(datArr){
		if (showProfs){ 
			if (filterGold || filterSilver){
				datArr = datArr.filter(function(e){
					var name = e["Instructor"];
					if (filterGold){
						for (var i = 0; i < goldNuggets["professors"].length; i++) {
							var firstName = goldNuggets["professors"][i]["first_name"];
							var lastName = goldNuggets["professors"][i]["last_name"];
							if (name.indexOf(firstName) >= 0 && name.indexOf(lastName) >= 0){
								return true;
							} 
						}
					} 
					if (filterSilver){
						for (var i = 0; i < silverNuggets["professors"].length; i++) {
							var firstName = silverNuggets["professors"][i]["first_name"];
							var lastName = silverNuggets["professors"][i]["last_name"];
							if (name.indexOf(firstName) >= 0 && name.indexOf(lastName) >= 0){
								return true;
							} 
						}
					}
					return false;
				});
			}
		} 
		if (filterGlobalCore){
			datArr = datArr.filter(function(e){
				for (var i = 0; i < globalCores.length; i++) {
					var gcID = globalCores[i].split(' ');
					if (e["course_ID"].includes(gcID[0]) && e["course_ID"].includes(gcID[1].substring(gcID[1].length-4))){
						return true;
					} 
				}
				return false;
			});
		}
		if (filterTechnical){
			datArr = datArr.filter(function(e){
				return $.inArray(e["course_ID"].substring(0,4), techs) != -1;
			});
		}
		if (filterNonTechnical){
			datArr = datArr.filter(function(e){
				return $.inArray(e["course_ID"].substring(0,4), nontechs) != -1;
			});
		}
		if (document.getElementById('levelcheckboxmin').checked) {
			datArr = datArr.filter(function(e){
				var sig = e["course_ID"];
				return Number(sig.charAt(sig.length-4))*1000 >= minLevel;
			});
		}
		if (document.getElementById('levelcheckboxmax').checked) {
			datArr = datArr.filter(function(e){
				var sig = e["course_ID"];
				return Number(sig.charAt(sig.length-4))*1000 <= maxLevel;
			});
		}

	//console.log("Done!");
	datArr = datArr.filter(function(e) { return e["query"][2] >= threshholdNum; });

	return datArr;
}

	function nextPage() {
		if (rightPageEnabled){
			pageNumber++;
			setTable(pageNumber,tableData);
		}
	}

	function lastPage() {
		if (leftPageEnabled){
			pageNumber--;
			setTable(pageNumber,tableData);
		}
	}

	function resize() { 
		$('.popover').popover('hide')
	}

	function mapQueryNumToSymbol(qn){
		switch(qn) {
			case "s1":
				return "W1"
			case "s2":
				return "W2"
			case "s3":
				return "W3"
			case "s4":
				return "R1"
			case "s5":
				return "R2"
			case "s6":
				return "Q1"
			case "s7":
				return "Q2"
			case "s9":
				return "Q3"
			default:
				alert("error");
		} 
	}

	function setTable(page,data) {

		var coursesPerPage = 16;

		if (rightPageEnabled = (data.length > coursesPerPage*(page+1))){
			$("#rightarrow").html("<img src=\"assets/rightpage.png\" style=\"height:20px;\">");
		} else {
			$("#rightarrow").html("<img src=\"assets/rightpagedis.png\" style=\"height:20px;\">");
		}
		if (leftPageEnabled = (page != 0)){
			$("#leftarrow").html("<img src=\"assets/leftpage.png\" style=\"height:20px;\">");
		} else {
			$("#leftarrow").html("<img src=\"assets/leftpagedis.png\" style=\"height:20px;\">");
		}
		tableData = data;
		pageNumber = page;
		$("#pagenum").html("Page " + (page+1));
		var str = "<thead>";
		str += "<tr class=\"active\">";
		str += "<th>#</th>";
		if (showProfs){
			str += "<th>Inst. Quality</th>";
			str += "<th>Instructor</th>";
		} else {
			str += "<th></th><th></th>"
		}
		str += "<th>Course ID</th>";
		str += "<th>Course Name</th>"
		str += "<th>Answer (" + mapQueryNumToSymbol(queryNum) + ")</th>"
		str += "</tr>"
		str += "</thead>"
		str += "<tbody>";
		var maxProfLen = 22;
		var maxCourseLen;
		if (showProfs)
		 	maxCourseLen = 25;
		 else
		 	maxCourseLen = 50;
		for (var i=page*coursesPerPage; i<coursesPerPage*(page+1); i++){
			if (i < data.length){				
				str += "<tr>";
				str += "<td>" + (i+1) + "</td>";

				if (showProfs){
					str += "<td>"+data[i]["Instructor_Quality"][0].toString().substring(0,4) + " &plusmn " + data[i]["Instructor_Quality"][1].toString().substring(0,4) + "<sub> ("+data[i]["Instructor_Quality"][2]+")<sub>" + "</a>" + "</td>";

					if (data[i]["Instructor"].length < maxProfLen){
						str += "<td>" + data[i]["Instructor"] + "</td>";
					} else {
						str += "<td>" + data[i]["Instructor"].substring(0,maxProfLen-2) + "...</td>";
					}
				} else {
					str += "<td></td><td></td>"
				}
				str += "<td>" + data[i]["course_ID"] + "</td>";
				if (data[i]["course_name"].length < maxCourseLen){
					str += "<td>" + cleanStr(data[i]["course_name"]) + "</td>";
				} else {
					str += "<td>" + cleanStr(data[i]["course_name"].substring(0,maxCourseLen-2)) + "...</td>";
				}
				var percentageStr = data[i]["query"][0].toString().substring(0,4) + " &plusmn " + data[i]["query"][1].toString().substring(0,4)
				percentageStr += "<sub> ("+data[i]["query"][2]+")<sub>";
				
				str += "<td>"+percentageStr + "</a>" + "</td>";
				str += "</tr>";
			} else {
				str += "<tr>";
				str += "<td><img src=\"assets/whiteRect.png\" id=\"nuggetimg\"></td>";
				str += "<td></td>";
				str += "<td></td>";
				str += "<td></td>";
				str += "<td></td>";
				str += "<td></td>";
				str += "</tr>";
			}
		}
		str += "</tbody>";

		$(document).ready(function(){
			$('[data-toggle="popover"]').popover().click(function(e) {
				e.preventDefault();
			});
		});


		document.getElementById('datatable').innerHTML = str;
	}	 


	function round(nums,dec)
	{
		return [Number( nums[0].toString().substring(0,dec+2)),Number( nums[1].toString().substring(0,dec+2)),Number(nums[2])]
	}

	function cleanStr(str){
		var preoutput = str.trim();
		preoutput = preoutput.toLowerCase();
		var arr = preoutput.split(' ');
		var output = "";
		for (var i=0;i<arr.length;i++){
			if (arr[i].toLowerCase() == "i" || arr[i].toLowerCase() == "ii" || arr[i].toLowerCase() == "iii" || arr[i].toLowerCase() == "iv"//  CS
				|| arr[i].toLowerCase() == "i:" || arr[i].toLowerCase() == "ii:" || arr[i].toLowerCase() == "iii:" || arr[i].toLowerCase() == "iv:" || 
				arr[i].toLowerCase() == "3d" || arr[i].toLowerCase() == "ui" || arr[i].toLowerCase() == "cs"){
				output += " " + arr[i].toUpperCase();
		} else if (arr[i] == "or" || arr[i] == "and" || arr[i] == "to" || arr[i] == "for" || arr[i] == "in" || arr[i] == "with" || arr[i] == "of" || arr[i] == "on"){
			output += " " + arr[i].toLowerCase();
		} else {
			output += " " + arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
		}
	}
	return output.trim();
}


var didRecordSearch = false;
var numBackspace = 0;
var previousSearch = "nil";
var searchSavedBeforeBS = "nil";

$( "#searchbar" ).keydown(function(event) {
	var input = retrieveElement('searchbar');
	var key = event.which;

	//console.log(input);
	
	if (previousSearch != "nil" && input.length < previousSearch.length && !didRecordSearch && key != 8){
		didRecordSearch = true;
		if (previousSearch.length >= 3){
			//console.log("print: " + previousSearch)
			var lastSunday = dateOfLastSunday();
			writeData("PrivateStatistics/Searches/" + lastSunday + "/" + Date.now() + " " + $.cookie('userID'),previousSearch);
		}
	} else if (numBackspace == 2  && !didRecordSearch){
		didRecordSearch = true;
		if (searchSavedBeforeBS.length >= 3){
			//console.log("print: " + searchSavedBeforeBS)
			var lastSunday = dateOfLastSunday();
			writeData("PrivateStatistics/Searches/" + lastSunday + "/" + Date.now() + " " + $.cookie('userID'),searchSavedBeforeBS);
		}
	}

	isLooking = ((key != 8 && input.length >= 0) || (key == 8 && input.length > 1));
	//console.log(isLooking);


	if (key != 8){
		previousSearch = input;
		didRecordSearch = false;
		numBackspace=0
	} else {
		numBackspace++;
		if (numBackspace == 1)
		searchSavedBeforeBS = input
	}

	
});

function dateOfLastSunday(){
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var now = new Date();
	var day = days[ now.getDay() ];
	var daysAhead = days.indexOf(day);
	var sunday = new Date();
	sunday.setDate(sunday.getDate()-daysAhead);
	sunday.setHours(0,0,0,0);
	return (sunday.getYear()+1900) + " (" + sunday.getWeekNumber() + ") " + months[sunday.getMonth()] + " " + sunday.getDate();
}

Date.prototype.getWeekNumber = function(){
	var d = new Date(+this);
	d.setHours(0,0,0,0);
	d.setDate(d.getDate()+4-(d.getDay()||7));
	return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

function searchChange(){
	var searchText = retrieveElement("searchbar")
	if (searchText.length == 0) {
		$("#tableerror").html("");
		setTable(0,[]);
		$("#searchres").html("<font color=\"grey\"><b>Search Results</b></font>");
	} else if (searchText.length < 3){
		$("#tableerror").html("<b>Search must be at least 3 characters long</b>");
		setTable(0,[]);
		$("#searchres").html("<font color=\"grey\"><b>Search Results</b></font>");
	} else {
		var matching = substrSearch(searchText,queryNum,showProfs);
		matching = matching.filter(function(e) { return e["query"][2] >= threshholdNum; });

		d = []
		for (var i = 0; i < qChoices.length; i++) {
			if (substrSearch(searchText,qChoices[i],showProfs).filter(function(e) { return e["query"][2] >= threshholdNum; }).length > 0)
				d.push(qChoices[i]);
		}
		console.log(d);

		// matching.sort(function(a,b) { return (a["query"] < b["query"]) ? 1 : ((b["query"] < a["query"]) ? -1 : 0);} );
		matching = sortList(matching);
		// matching.sort(function(a,b) { 

		// 	if (a["query"] < b["query"])
		// 		return 1;
		// 	else if (b["query"] < a["query"])
		// 		return -1
		// 	else {
		// 		if (showProfs && a["Instructor_Quality"] < b["Instructor_Quality"])
		// 			return 1;
		// 		else if (showProfs && b["Instructor_Quality"] < a["Instructor_Quality"])
		// 			return -1;
		// 		else
		// 			return 0;
		// 	}

		// } );
		setTable(0,matching);
		$("#searchres").html("<font color=\"grey\"><b>("+ matching.length +" Results)</b></font>");
		if (matching.length > 0){
			$("#tableerror").html("");
		} else {
			$("#tableerror").html("<b>No results matched your search</b>");
		}
	}
}

function participantThreshhold(){
	var threshholdText = retrieveElement("threshhold")
	if (threshholdText.length == 0)
		threshholdNum = 0;
	else 
		threshholdNum = Number(threshholdText);
	
}

function init(){
	console.log("Build 301");
	var config = {
		apiKey: "AIzaSyCbrQzainAk71S-KJByf8GdMs7zNPxm03g",
		authDomain: "scorecu-93fcb.firebaseapp.com",
		databaseURL: "https://scorecu-93fcb.firebaseio.com",
		projectId: "scorecu-93fcb",
		storageBucket: "scorecu-93fcb.appspot.com",
		messagingSenderId: "1076861733660"
	};


	firebase.initializeApp(config);	
	
	document.getElementById("submitquery").disabled = true;
	document.getElementById("searchbar").disabled = true;
	setTimeout(function(){document.getElementById("submitquery").disabled = false;}, 1100);

	var ref = firebase.database().ref();
	ref.child("Data").on("value", function(snapshot) {
		this.firData = snapshot.val();
		document.getElementById("searchbar").disabled = false;
	});

	ref.child("Z-Message").on("value", function(snapshot) {
		var mes = snapshot.val();
		$("#message").html("<b>" + mes + "</b>");
	});

	window.onresize = resize;

	setTable(0,[]);

	document.getElementById("silvernuggetbtn").disabled = true;
	document.getElementById("goldnuggetbtn").disabled = true;

	jQuery("button").click(function(e){
	 	//console.log(e.target.id);
	 	switch (e.target.id) {
	 		case "showprofs":
	 		if (showProfs){
	 			document.getElementById("showprofs").className = "btn btn-lg col-xs-12";
	 			document.getElementById("silvernuggetbtn").disabled = true;
	 			document.getElementById("silvernuggetbtn").className = "btn btn-lg col-xs-5 col-xs-push-0";
	 			filterSilver = false;
	 			document.getElementById("goldnuggetbtn").disabled = true;
	 			document.getElementById("silvernuggetbtn").className = "btn btn-lg col-xs-5 col-xs-push-0";
	 			filterGold = false;

	 		} else {
	 			document.getElementById("showprofs").className = "btn btn-lg col-xs-12 glowingwhite";
	 			document.getElementById("silvernuggetbtn").disabled = false;
	 			document.getElementById("goldnuggetbtn").disabled = false;
	 		}
	 		showProfs = !showProfs;
	 		if (isLooking && retrieveElement("searchbar").length == 0)
				filter();
			else if (isLooking && retrieveElement("searchbar").length > 0)
				searchChange();
			else
				setTable(0,[]);
	 		//console.log("showProfs: "+showProfs)
	 		break;
	 		case "technical":
	 		if (filterTechnical){
	 			document.getElementById("technical").className = "btn btn-lg col-xs-12";
	 		} else {
	 			document.getElementById("technical").className = "btn btn-lg col-xs-12 glowing";
	 		}
	 		filterTechnical = !filterTechnical;
	 		filterNonTechnical = false;
	 		document.getElementById("nontechnical").className = "btn btn-lg col-xs-12 top15";
	 		filterGlobalCore = false;
	 		document.getElementById("globalcore").className = "btn btn-lg col-xs-12 top15";
	 		break;
	 		case "nontechnical":
	 		if (filterNonTechnical){
	 			document.getElementById("nontechnical").className = "btn btn-lg col-xs-12 top15";
	 		} else {
	 			document.getElementById("nontechnical").className = "btn btn-lg col-xs-12 top15 glowing";
	 		}
	 		filterNonTechnical = !filterNonTechnical;
	 		filterTechnical = false;
	 		document.getElementById("technical").className = "btn btn-lg col-xs-12";
	 		filterGlobalCore = false;
	 		document.getElementById("globalcore").className = "btn btn-lg col-xs-12 top15";
	 		break;
	 		case "globalcore":
	 		if (filterGlobalCore){
	 			document.getElementById("globalcore").className = "btn btn-lg col-xs-12 top15";
	 		} else {
	 			document.getElementById("globalcore").className = "btn btn-lg col-xs-12 top15 glowing";
	 		}
	 		filterGlobalCore = !filterGlobalCore;
	 		filterTechnical = false;
	 		document.getElementById("technical").className = "btn btn-lg col-xs-12";
	 		filterNonTechnical = false;
	 		document.getElementById("nontechnical").className = "btn btn-lg col-xs-12 top15";
	 		break;
	 		case "goldnuggetbtn":
	 		case "goldnuggetimg":
	 		if (filterGold){
	 			document.getElementById("goldnuggetbtn").className = "btn btn-lg col-xs-5 col-xs-push-2";
	 		} else {
	 			document.getElementById("goldnuggetbtn").className = "btn btn-lg col-xs-5 col-xs-push-2 glowing";
	 		}
	 		filterGold = !filterGold;
	 		break;
	 		case "silvernuggetbtn":
	 		case "silvernuggetimg":
	 		if (filterSilver){
	 			document.getElementById("silvernuggetbtn").className = "btn btn-lg col-xs-5 col-xs-push-0";
	 		} else {
	 			document.getElementById("silvernuggetbtn").className = "btn btn-lg col-xs-5 col-xs-push-0 glowing";
	 		}
	 		filterSilver = !filterSilver;
	 		break;
	 		default:
	 	}
	 });

	jQuery(".dropBtn").click(function(e){
		e.preventDefault();
		switch (e.target.id) {
			case "onekmin": 
			minLevel = 1000;
			break;
			case "twokmin": 
			minLevel = 2000;
			break;
			case "threekmin": 
			minLevel = 3000;
			break;
			case "fourkmin": 
			minLevel = 4000;
			break;
			case "fivekmin": 
			minLevel = 5000;
			break;
			case "sixkmin": 
			minLevel = 6000;
			break;
			case "onekmax": 
			maxLevel = 1000;
			break;
			case "twokmax": 
			maxLevel = 2000;
			break;
			case "threekmax": 
			maxLevel = 3000;
			break;
			case "fourkmax": 
			maxLevel = 4000;
			break;
			case "fivekmax": 
			maxLevel = 5000;
			break;
			case "sixkmax": 
			maxLevel = 6000;
			break;
			default:
			alert("The target id is: " + e.target.id + ". This shouldn't happen.");

		}
		$("#minCover").html(minLevel + "   <span class=\"caret\"></span>");
		$("#maxCover").html(maxLevel + "   <span class=\"caret\"></span>");
	});

	jQuery(".dropQueryBtn").click(function(e){
		e.preventDefault();
		queryNum = e.target.id;
		
		//console.log(queryNum);

		var queryText = ""
		var answerChoices = "On each evaluation, students had five answer choices:<br/><br/>"

		switch (e.target.id) {
			case "s1": //exact
			queryText += "W1) How did the workload of this course <br/>compare to that of other courses you've <br/>taken in Computer Science?";
			answerChoices += "1) Much heavier<br/>2) Slightly heavier<br/>3) About the same<br/>4) A bit easier<br/>5) Much easier"
			break;
			case "s2": //ignored 1, reportin 2-6
			queryText += "W2) How does the workload in this course <br/>compare to Columbia courses with a similar <br/>structure (e.g. a lecture, seminar, <br/>laboratory, or language course)?";
			answerChoices += "1) Much heavier workload<br/>2) Heavier workload<br/>3) Comparable workload<br/>4) Lighter workload<br/>5) Heavier workload<br/><br/><small>Note: Originally, 1 was \"no basis for comparison\" and 2-6 were the other choices, so we threw out the data for 1 and shifted the other answers</small>"
			break;
			case "s3": //exact
			queryText +="W3) How did the workload of this course <br/>compare to that of other courses you've <br/>taken in other departments?";
			answerChoices += "1) Much heavier<br/>2) Slightly heavier<br/>3) About the same<br/>4) A bit easier<br/>5) Much easier"
			break;
			case "s4": //exact
			queryText += "R1) If this was not a required course,<br/> would you recommend <br/>it to another student?";
			answerChoices += "1) Definitely not recommend<br/>2) Probably not recommend<br/>3) I'm not sure I'd recommend<br/>4) Yes, probably recommend<br/>5) Yes, definitely recommend'"
			break;
			case "s5": //exact
			queryText += "R2) Would you recommend <br/>this course to another student?";
			answerChoices += "1) Definitely not recommend<br/>2) Probably not recommend<br/>3) I'm not sure I'd recommend<br/>4) Yes, probably recommend<br/>5) Yes, definitely recommend"
			break;
			case "s6": //exact
			queryText += "Q1) Course: Overall Quality";
			answerChoices += "1) Poor<br/>2) Fair<br/>3) Good<br/>4) Very Good<br/>5) Excellent"
			break;
			case "s7": //exact
			queryText += "Q2) What is your overall <br/>assessment of this course?";
			answerChoices += "1) Poor<br/>2) Fair<br/>3) Good<br/>4) Very Good<br/>5) Excellent"
			break;
			case "s9": //exact. FLIPPED KINDA??
			queryText += "Q3) Of all the CS courses you have <br/>taken, how does this course rank?";
			answerChoices += "1) Very low<br/>2) Worse than average <br/>3) Average<br/>4) Better than average<br/>5) Very high <br/><br/><small>Note: Originally the answer choices were in the opposite order, but we flipped them so that 5 is the best</small>"
			break;
			default:
			alert("The target id is: " + e.target.id + ". This shouldn't happen.");
		}

		document.getElementById('queryexplanation').setAttribute("data-original-title",queryText);
		document.getElementById('queryexplanation').setAttribute("data-content",answerChoices);

		queryText += " <span class=\"caret\"></span>"

		document.getElementById('questiondropdown').innerHTML = queryText;

		if (isLooking && retrieveElement("searchbar").length > 0)
			searchChange();
		else
			filter();
		
	});

	

	window.addEventListener("beforeunload", function(e){
		var searchBarText = retrieveElement("searchbar");
		if (searchBarText.length > 3){
			var lastSunday = dateOfLastSunday();
			writeData("PrivateStatistics/Searches/" + lastSunday + "/" + Date.now() + " " + $.cookie('userID'),searchBarText);
		}
	}, false);

	return firebase.database().ref().child("Statistics").once('value').then(function(snapshot) {
		var data = snapshot.val();		
		if (window.location.protocol == 'https:'){
			var cookies = $.cookie();
			if ('userID' in cookies && $.cookie('userID') in data["Users"]){
				var currentID = $.cookie('userID');
				console.log("Old user:", currentID);
				var count = data["Users"][currentID];
				writeData("Statistics/Users/" + currentID,count+1);
				if (currentID != "JHCeM4" && currentID != "aOv6WZ"){
					writeData("Statistics/Visits",data["Visits"]+1);
				}
			} else {
				console.log("New user");	
				var newID = makeid(6);
				$.cookie('userID', newID, { expires: 1000 });
				writeData("Statistics/Users/" + newID,1);
				writeData("Statistics/Visits",data["Visits"]+1);
			}
			userIDset = true;
		} else {
			console.log("Running Locally");
		}
	});

}

function getCourseData(tree, courseID, question){
	var courseData = tree["CourseIDs"][courseID]
	var output = {"course_name":courseData["course_name"], "course_ID":courseID}
	for (var key in courseData) {
		if (courseData.hasOwnProperty(key)) {

			if (key == question){
				output["query"] = courseData[key];
			}

		}
	}

	return output;
}

function robustIncludes(str, substr){
	var substrings = substr.split(' ');
	var output = true;
	for (var i=0;i<substrings.length;i++){
		if (!(str.includes(substrings[i])))
			output = false;
	}
	return output;
}

function substrSearch(substr, question, showProfs){

		var tree = firData

		//console.log("QUESTION: "+question);

		substr = substr.toLowerCase();

		var output = [];

		for (var courseID in tree["CourseIDs"]) {
			if (tree["CourseIDs"].hasOwnProperty(courseID)) {

				if (robustIncludes(courseID.toLowerCase(),substr) || robustIncludes(tree["CourseIDs"][courseID]["course_name"].toLowerCase(),substr)){


					if (!showProfs){
						if (question in tree["CourseIDs"][courseID])
							output.push(getCourseData(tree,courseID, question));
					} else {
						var profsForThisClass = tree["CourseIDs"][courseID]["professors"];
						// console.log(courseID);
						// console.log(profsForThisClass);
						if (profsForThisClass){
							for (var i=0; i<profsForThisClass.length;i++){
								if (question in tree["CourseIDs"][courseID]){
									var d = getCourseData(tree,courseID, question)
									d["Instructor"] = profsForThisClass[i]
									d["Instructor_Quality"] = tree["Profs"][profsForThisClass[i]][courseID]
									output.push(d);
								}
							}
						}
					}
				}



			}
		}

		if (showProfs){

			for (var profName in tree["Profs"]) {
				if (tree["Profs"].hasOwnProperty(profName)) {

					if (robustIncludes(profName.toLowerCase(),substr)){

						for (var courseID in tree["Profs"][profName]) {
							if (tree["Profs"][profName].hasOwnProperty(courseID)) {
								if (question in tree["CourseIDs"][courseID]){
									var d = getCourseData(tree,courseID, question)
									d["Instructor"] = profName
									d["Instructor_Quality"] = tree["Profs"][profName][courseID]
									output.push(d);
								}
							}
						}
					}
				}
			}
		}

		var curObs = [] 

		output = output.filter(function(e){
			var s = JSON.stringify(e);
			if (curObs.includes(s)){
				return false
			}
			curObs.push(s);
			return true;
		});
	

		return output;


	}
	

		$("#searchForm").submit(function() {
			return false;
		});

		$("#filterform").submit(function() {
			return false;
		});




     function retrieveElement(id) {
     	var txtbox = document.getElementById(id);
     	return txtbox.value;
     }

     function writeData(path,obj) {
     	firebase.database().ref().child(path).set(obj);
     }


     function makeid(length)
     {
     	var text = "";
     	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

     	for( var i=0; i < length; i++ )
     		text += possible.charAt(Math.floor(Math.random() * possible.length));

     	return text;
     }
