// This global variable is filled by the scripts with the student records
// when the CSV is loaded.
var theStudentRecs; // Is this used? I don't think it is. It's just helpful for debugging from the JS console. 


// Set of cluster one courses
var CLUSTER_ONE = new Set(["BUS160", "HIST150", "ISAT160", "SMAD150", "PHIL120", "PHIL150", "SCOM121", "SCOM122", "SCOM123", "WRTC103"]);

// Clears any course blocks from the svg. 
function clearCourses($svg) {
	$svg.find(".course").remove();
}

// Adds a course to the svg.
function addScheduleItem($svg, courseName, courseDescription, courseLocation, days, startTime, endTime, color, status) {
	var yval = function(time) { return 200 + 48 * (time-8); };
	var xval = function(dayIdx) { return 150 + dayIdx*220; };

	if (status == "FULL") {
		courseName = "Waiting: " + courseName;
		color = "#D3D3D3";
	}

	for (var i = 0; i < 5; i++) {
		if (days[i] === "Y") {
			var x = xval(i);
			var y = yval(startTime);
			var h = (yval(endTime) - yval(startTime));

			if (courseLocation == "Online") {
				y = 50;
				h = 50;
			}

			$svg.append(
				$("<svg class=\"course\" x=\"" +x + "\" y=\"" + y + "\" width=\"200\" height=\"" + h + "\"></svg>").append(
					"<rect width=\"200\" height=\"200\" fill=\"" + color + "\"/>"
				).append(
					'<text x="10" y="18" style="font-size: 10pt; font-weight: 800">' + courseName + '</text>'
				).append(
					'<text x="10" y="32" style="font-size: 10pt">' + courseLocation + '</text>'
				)
			);
		}
	}


	// For some reason you have to reload the svg's html from itself to get it to display (at least in Safari)
	$svg.html(function() {return this.innerHTML });
}

// Loads the CSV file. 
function loadFile(file) {
	if (!file) { alert("Failed to load file."); }
	// else if (!file.type.match('.csv')) {
	// 	alert(file.name + " is not a CSV file.");
	// } 
	else {
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function () { loadCSV(reader.result); };
	}
}

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);
	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){
			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );
		}
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){
			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);
		} else {
			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];
		}
		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}
	// Return the parsed data.
	return( arrData.filter(line => line.length > 3 && line[1] != undefined) );
}

// Parses the CSV data and
// Also generates all the various warnings. 
function loadCSV(data) {

	// Convert the CSV data to an array
	var csvData = CSVToArray(data, ",");

	var eids = [];
	
	// Grab the student records. 
	var studentRecs = csvData.slice(1, csvData.length);
	theStudentRecs = studentRecs;
	// Add the unique eids in order
	var lastEid = undefined;
	studentRecs.forEach( function(line) {
		var eid = line[1];
		if (lastEid !== eid) {
			eids.push(eid);
			lastEid = eid;
		}
	});

	// Create a dictionary of eid's to schedule lines:
	var students = {};

	studentRecs.forEach( function (line) {
		var eid = line[1];
		if (students[eid] === undefined) {
			students[eid] = [];
		}
		for (var i = 0; i < line.length; i++) {
			if (line[i] === undefined) line[i] = "";
		}
		students[eid].push(line);
	});

	$("select#students").find("option").remove().end().append('<option>---Select a student---</option>').val('');
	eids.forEach(function (eid) {
		$('<option value="' + eid + '">' + students[eid][0][2] + '</option>').appendTo($("select#students"));
	});

	$("#loadView").hide();
	$("#studentListView").addClass("noprint_show").removeClass("noprint_hidden");

	$("select#students").data("eids", eids);
	$("select#students").data("schedules", students)
	
	// Load warnings

	var students_without_schedules = [];
	var students_with_cs149_and_math155 = [];
	var students_with_no_cs_classes = [];
	var students_with_fewer_than_four = [];

	eids.forEach(function (eid) {
		var schedule = students[eid];
		var courses = new Set(schedule.map(course => course[3]));
		if (schedule.length == 1 && schedule[0][3] == "") {
			students_without_schedules.push(eid);
		} else {
			if (courses.size < 4) {
				students_with_fewer_than_four.push(eid);
			}
			if (courses.has("CS149") && courses.has("MATH155")) students_with_cs149_and_math155.push(eid);
			if (schedule.filter(course => course[3].startsWith("CS")).length == 0) students_with_no_cs_classes.push(eid);
		}
	})

	// Nested function for adding a warning category to the list of warnings. 
	function addWarningCategory(category, eids) {
		var $li = $("<li>" + category + ": </li>");
		var $ul = $("<ul></ul");
			
		eids.forEach(function (eid) {
			var aCourse = students[eid][0];
			var lastName = aCourse[2] == undefined ? "undefined" : aCourse[2].split(",")[0];
			$ul.append($("<li><a href=\"javascript:showScheduleFor('" + eid + "')\">" + lastName + " (" + eid + ")</a></li>")).append(" ");
		})
		
		$li.append($ul);
		$("#studentList-warnings").append($li);
	}

	if (students_without_schedules.length > 0) addWarningCategory("No Schedule", students_without_schedules);
	if (students_with_fewer_than_four.length > 0) addWarningCategory("Fewer than four courses", students_with_fewer_than_four);
	if ($("#csspecific").is(":checked") && students_with_cs149_and_math155.length > 0) addWarningCategory("Taking both CS149 and MATH155", students_with_cs149_and_math155);
	if ($("#csspecific").is(":checked") && students_with_no_cs_classes.length > 0) addWarningCategory("No CS Classes", students_with_no_cs_classes);
}

// Shows the schedule for the student given by the currently selected item
// in the select box. 
function showSchedule(select) {
	showScheduleFor($(select).val());
}

// Shows the schedule for the student with the given eid. 
function showScheduleFor(eid) {
	var $select = $("#students");

	var schedule = $select.data("schedules")[eid];
	
	$("#summary").html("");

	$("#scheduleView").show();

	$("#summary").append(
		$("<strong style=\"font-size: 14pt\">" + schedule[0][2].replace(",", ", ") + "</strong>")
	).append(
		$("<em style=\"margin-left:3em;\">(eid " + schedule[0][1] + ")</em>")
	);

	clearCourses($("svg#schedule_template"));
	schedule.forEach(function (course) {
		addScheduleItem($("svg#schedule_template"), course[3], course[5], course[13], course.slice(8,13), timeToDecimal(course[6]), timeToDecimal(course[7]), getColor(course[3]), course[15]);
	});

	var $coursesUl = $("<ul></ul>");

	var courses = new Set(schedule.map(course => course[3]));

	courses.forEach(function (course) {
		var entries = schedule.filter( c => c[3] == course )
		$coursesUl.append("<li>" + course + ": " + entries[0][5] + "</li>");
	})

	$("#summary").append($("<br><br><p><strong>Schedule Overview</strong></p>"))
	$("#summary").append($coursesUl);

	var warnings = $('<ul id="warnings"></ul>');
	
	// Check that there is enough time scheduled for the walk between classes
	schedule.forEach(function (course1) {
		schedule.forEach(function (course2) {
			if (course1 != course2) {
				var end_of_first = timeToDecimal(course1[7]);
				var start_of_second = timeToDecimal(course2[6]);

				if ((Math.abs(start_of_second - end_of_first) < 0.3) && !walkable(course1[13], course2[13]) && sameDay(course1, course2)) {
					warnings.append(
						$("<li>There is not enough time scheduled for the walk between " + course1[3] + " in " + course1[13] + " (" + areaForRoom(course1[13]) + " Area) and " + course2[3] + " in " + course2[13] + " (" + areaForRoom(course2[13]) + " Area).</li>")
					)
				}
			}
		})
	});

	// Check for other warnings.
	var has_cs_course = false;
	var has_cluster_one_course = false; 
	var has_math_155 = false; 
	var has_cs_149 = false; 
	var has_cs_101 = false;
	var has_no_schedule = false;

	schedule.forEach(function (course) {
		var courseNum = course[3];
		if (courseNum.startsWith("CS")) has_cs_course = true;
		if (courseNum == "MATH155") has_math_155 = true; 
		if (courseNum == "CS149") has_cs_149 = true; 
		if (courseNum == "CS101") has_cs_101 = true; 
		if (courseNum == "") has_no_schedule = true; 
		if (CLUSTER_ONE.has(courseNum)) has_cluster_one_course = true;
	});

	if ($("#csspecific").is(":checked") && !has_cs_course) {
		warnings.append($("<li>You have no CS courses!</li>"));
	}

	if (!has_cluster_one_course) {
		warnings.append($("<li>You have no cluster one course.</li>"));
	}

	if ($("#csspecific").is(":checked") && has_math_155 && has_cs_149) {
		warnings.append($("<li>You have both MATH 155 and CS 149, but they should not be taken together.</li>"));
	}

	if ($("#csspecific").is(":checked") && !has_cs_101) {
		warnings.append($("<li>You need to enroll in CS 101!</li>"));
	}

	if (has_no_schedule) {
		warnings.append($("<li>You have no schedule! Sign up for classes immediately!</li>"));
	}

	if (schedule.length < 4) {
		warnings.append($("<li>This do not have a full schedule. You must have at least 12 hours of credit (4 courses).</li>"));
	}

	if (warnings.children().length > 0) {
		$("#summary").append($("<p>&#160;</p><p><strong>Warnings: </strong></p>"))
		$("#summary").append(warnings);
	}
}

// Convert times to decimal numbers for offsetting graphics based on hour.
function timeToDecimal(time) {
	if (time == undefined) return 0;
	var timeParts = time.split(".");
	return Number(timeParts[0]) + (timeParts[1] / 60.0);
}

// Return the color of a course based on its course number
function getColor(courseNumber) {
	
	if (CLUSTER_ONE.has(courseNumber)) return "#88EEFF";
	else if (courseNumber.startsWith("CS")) return "#88FFEE";
	else if (courseNumber.startsWith("MATH")) return "#FF88EE";
	return "#FFEE88";
}

// Determine whether two courses occur on the same day.
function sameDay(course1, course2) {
	return	(course1[8] == "Y" && course2[8] == "Y") ||
			(course1[9] == "Y" && course2[9] == "Y") ||
			(course1[10] == "Y" && course2[10] == "Y") ||
			(course1[11] == "Y" && course2[11] == "Y") ||
			(course1[12] == "Y" && course2[12] == "Y");
}
