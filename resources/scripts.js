/*
 * All Code by Matt DePero Unless Noted
 *
 */


// Adjust Review Options
var NUM_OF_OPTIONS = 3;
var OPTIONS_KEY = "(1) Unacceptable, (2) Acceptable, (3) Exceptional";


// URL to folder that contains serverfile.php, including '/' on the end
var serverRootURL = "http://107.10.18.206/";

var SLOW_ANI_SPEED = 1500;

var DEFAULT_ANI_SPEED = 1000;

var FAST_ANI_SPEED = 600;

// If current date is a month greater than (not inclusive) the months below, automatically jumps up to next semester. For example, if spring cutoff is 4 and the current month is 5, then the semester will default to next fall. If the fall cutoff is 11 and it is currently 12, it will default to next year's spring
// NOTE: January = 0, February = 1, etc
var SPRING_MONTH_CUTOFF = 3;// 3 = April, May starts jump to summer
var SUMMER_MONTH_CUTOFF = 6;// 6 = July, August starts jumpt to fall
var FALL_MONTH_CUTOFF = 10;// 10 = November, December starts jumpt to next year's spring


var xmlhttp;
if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari

  xmlhttp=new XMLHttpRequest();
}else{// code for IE6, IE5

  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}








// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  $('#generalError').html("Your browser is not fully compatible with this form [File API's not supported]. Please upgrade to a modern browser such as Chrome for Firefox.");
}









var returnedData;

function fetchData( callback, v1, v2 ){
  var url = serverRootURL+"serverfile.php?get=" + callback.getName() + "&v1=" +v1+ "&v2=" +v2+ "&t=" + Math.random();
  url = url.replace(" ","%20");
  console.log("SENT URL: "+url);
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            returnedData = xmlhttp.responseText;
            console.log("RECEIVED DATA: "+returnedData);
            if(returnedData == "" || returnedData == null){
              alert("ERROR: Could not connect or returned no results.");
              return;
            }

            returnedData = JSON.parse(returnedData);

            callback();
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}






$(document).ready(function(){

  // Smooth Scroll Code provided by CSS Tricks https://css-tricks.com/snippets/jquery/smooth-scrolling/
  $('a[href*=#]').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
    && location.hostname == this.hostname) {
      var $target = $(this.hash);
      $target = $target.length && $target
      || $('[name=' + this.hash.slice(1) +']');
      if ($target.length) {
        var targetOffset = $target.offset().top;
        $('html,body')
        .animate({scrollTop: targetOffset}, 1000);
       return false;
      }
    }
  });


});// end document ready



function buildInitialReviewForm(){


  // Add current faculty and semesters
  $.each(returnedData["Faculty"], function(index, text) {
    $('#faculty').append( new Option(text,index) );

  });

  $.each(returnedData["Semesters"], function(index, text) {
    $('#semester').append( new Option(text,text) );

  });

  $("#loading").hide();

  $("#0").fadeIn(SLOW_ANI_SPEED);

}



function callAddClasses(){

  $("#error").html("");
  if($("#faculty").val() == "" || $("#semester").val() == ""){
    $("#error").html("You are missing something on the current form.");
    return;
  }

  $("#addClasses").prop("disabled",true);

  fetchData(addClassList,$('#faculty').val(),$('#semester').val());
}

function addClassList(){

  $("#error").html("");
  if($.isEmptyObject(returnedData["Classes"])){ // Checks to see if the returned javascript object has any given properties or not
    $("#error").html("Sorry, no matches found. Please try again.");
    $("#addClasses").prop("disabled",false);
    return;
  }

  // Populate class list for professor
  $.each(returnedData["Classes"], function(index, text) {

    $('#classes').append( newCheckBox(index, text, "class") );

  });

  $("#0").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
    $("#1").fadeIn(DEFAULT_ANI_SPEED);
  });

}



function callAddStudents(){

  $("#error").html("");
  if ($("#1 input:checkbox:checked").length == 0){
    $("#error").html("You are missing something on the current form.");
    return;
  }



  var classList = "[";
  var first = true;
  $.each($('input[type="checkbox"][name="class"]:checked').map(function() { return this.value; }), function(index, value){
    if(first)
      first = false;
    else
      classList += ",";

    classList += value;
  });
  classList += "]";

  $("#addStudents").prop("disabled",true);

  fetchData(addStudents,classList,"");
}

function addStudents(){


  for(var i = 0;i<returnedData.length;i++){

    var Row = returnedData[i];

    $("#studentListClasses").append(' <h4 id="'+Row.Class["ID"]+'name">'+Row.Class["Name"]+'</h4>');

    $("#studentListClasses").append(' <table class="form checkboxes" id="'+ Row.Class["ID"] +'">');


      $.each(Row.Students, function(index, text) {

        $('#'+Row.Class["ID"]).append( newCheckBox(index, text, Row.Class["ID"]) );

      });


    $("#studentListClasses").append(' </table>');

  }


  $("#1").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
    $("#2").fadeIn(DEFAULT_ANI_SPEED);
  });

}





var formCheckBoxes,formNumber,headerNumber,questions;

function callAddForms(){

  formCheckBoxes = $("#studentListClasses input:checkbox:checked");

  $("#error").html("");
  if(formCheckBoxes.length == 0){
    $("#error").html("You are missing something on the current form.");
    return;
  }

  $("#addForms").prop("disabled",true);

  // get the list of questions and question IDs
  fetchData(startForms,"","");


}


var toggleFinalSubmit = -1;



function startForms(){

  questions = returnedData;

  formNumber = -1;

  headerNumber = -1;

  // Build the forms
  $.each($("#studentListClasses h4"), function(index, value) {

    $('#forms').append( '<h2 id="header_'+index+'">'+value.innerHTML+'</h2>');
  });

  $.each(formCheckBoxes, function(index, value) {

    $('#forms').append( '<h3 id="name_'+index+'">'+$('label[for="'+value.id+'"]').html()+'</h3>');

    $('#forms').append( '<div id="key_'+index+'" style="display:none;">'+OPTIONS_KEY+'</div>');

    $('#forms').append( '<table id="form_'+index+'" class="radios"></table>' );

      
      // Top Buttons
      var buffer = "";
      for(var i = 1;i<=NUM_OF_OPTIONS;i++){
        buffer += "<td></td>";
      }

      if(index < formCheckBoxes.length-1){

        $('#form_'+index).append( '<tr>'+buffer+'<td><button class="btn btn-primary" id="submit" onclick="javascript:nextForm(this);">Next Student</button></td></tr>' );
      }else{

        $('#form_'+index).append( '<tr>'+buffer+'<td><button class="btn btn-success" id="submit" onclick="javascript:submitForm(this);">Submit</button></td></tr>' );
      }
      // End Top Buttons

      $.each(questions, function(index2, value2) {

        newQuestionSet(value.value, value.name, value2["ID"], value2["Question"], $('#form_'+index)[0], index2 );

      });

      var row = $('#form_'+index)[0].insertRow(0);
      for(var i = 1;i <= NUM_OF_OPTIONS; i++){
        row.insertCell().innerHTML = i;
      }

      row.insertCell().innerHTML = "";

      if(index < formCheckBoxes.length-1){

        $('#form_'+index).append( '<tr>'+buffer+'<td><button class="btn btn-primary" id="submit" onclick="javascript:nextForm(this);">Next Student</button></td></tr>' );
      }else{

        $('#form_'+index).append( '<tr>'+buffer+'<td><button class="btn btn-success" id="submit" onclick="javascript:submitForm(this);">Submit</button></td></tr>' );
      }

  });


  $("#2").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
    $("#3").show();
    $("#forms h2,h3,table").hide();
    $("#forms").promise().done(function() { nextForm(null); });// Wait until all of the inner elements of forms have been hidden, then begin nextForm
  });

}

var lastClass = "";
function nextForm(button){

  if(button != null){
    button.disabled = true;

  }


  // new class, move to next class header
  if(headerNumber == -1){
    // just show the header
    console.log("Just showing new header");
    headerNumber++;
    $('#header_'+headerNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
    lastClass = formCheckBoxes[0].name;
  }else{
    console.log("Comparison ("+(formNumber+1)+"): "+lastClass +", "+formCheckBoxes[formNumber+1].name);
    if(lastClass != formCheckBoxes[formNumber+1].name){
      console.log("Next class, getting rid of old header and showing new header: "+headerNumber);
      $('#header_'+headerNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED, function() {
        headerNumber++;
        $('#header_'+headerNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
      });
      lastClass = formCheckBoxes[formNumber+1].name;
    }
  }


  var first = false;


  // new class, move to next class header
  if(formNumber == -1){

    first = true;

    console.log("Just showing new name and form");
    formNumber++;
    $('#name_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
    $('#key_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
    $('#form_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
  }else{
    console.log("Getting rid of old form and showing new form: "+ formNumber);
    $('#name_'+formNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED);
    $('#key_'+formNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED);
    $('#form_'+formNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED, function(){
      formNumber++;
      $('#name_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
      $('#key_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
      $('#form_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
    });
  }


  // submit on each next. By toggling the above int, detect if last submit or just one.
  if(!first){
    toggleFinalSubmit *= -1;
    console.log("toggled flipped to " + toggleFinalSubmit);
    submitForm(null);
  }

}




function submitForm(button){

  if(button != null){
    button.disabled = true;

  }

  // submit on each query. By toggling the above int, detect if last submit or just one
  toggleFinalSubmit *= -1;
  console.log("toggled flipped to on submit " + toggleFinalSubmit);

  var checkedResponses = $('#form_'+(formNumber)+' input:radio:checked, #form_'+(formNumber)+' .shortAnswers');
  var responseJSON = '[[';

  var first = true;
  var lastStudentID = "";
  var lastClassID = "";
  $.each(checkedResponses, function(index,value){



    // Correct for short answer add on
    if(value.value.indexOf('"StudentID":') == -1){

      // was a short answer response, change value to combine previous system into short answer
      value.value = value.name.replace("INSERT_VALUE_OF_SHORT_ANSWER",value.value).replace("'","''");
    }


    if(first){
      first = false;

      lastStudentID = JSON.parse(value.value)["StudentID"];
      lastClassID = JSON.parse(value.value)["ClassID"];

    }else{
        if(JSON.parse(value.value)["StudentID"] != lastStudentID || JSON.parse(value.value)["ClassID"] != lastClassID){

          lastStudentID = JSON.parse(value.value)["StudentID"];
          lastClassID = JSON.parse(value.value)["ClassID"];

          responseJSON += '], [';
        }else{
          responseJSON += ', ';
        }
      
    }

    responseJSON += value.value;

  });

  responseJSON += ']]';

  //alert(responseJSON);

  // don't submit on the first nextForm to allow first form to load
  console.log("FormNumber on submit: "+formNumber)
  if(formNumber>=0)
    fetchData(sendForm, responseJSON, "");

}

function sendForm(){

  if(returnedData[0] == "Success"){


    if(toggleFinalSubmit == 1){

      // last form was the last one, display final page
      $("#success").html("Your forms were successfully submitted.");
        $("#3").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
          $("#4").fadeIn(DEFAULT_ANI_SPEED);
        });

    }else{

      // not the final submit

    }

  }else{

    $("#error").html("ERROR: An error occured attempting to submit the previous form.");
  }

}




function nextClass(id){

  $("#section").val("");
  $("#studentDataFile").val("");
  $("#classTypeInfo").html("");
  $("#studentData").html("");


  $("#"+id).fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
    $("#2").fadeIn(DEFAULT_ANI_SPEED);
  });

}











// =================================================================================================================================================
// =================================================================================================================================================





function getReviews(){

  $.each(returnedData, function(index, value) {

    var ret = '<h2 id="'+ value['StudentID'] +'" onclick="$(\'#reviewsFor\'+this.id).fadeIn();">'+ value['Student'] +"</h2>"+'<div id="reviewsFor'+value['StudentID']+'">';

    $.each(value['Reviews'], function(index2, review) {

      ret += '<h3 id="review'+review['ReviewID']+'" style="display:none;">'+review['Class']+'</h3>';

      ret += '<div id="answersFor'+review['ReviewID']+'"><table><tr><th>Question</th><th>Value</th></tr>';

      $.each(review['Answers'], function(index3, answer) {

        ret += '<tr><td>'+answer['Question']+'</td><td>'+answer['Value']+'</td></tr>';

      });

      ret += '</table></div>';



    });

    ret += '</div>';

    $('#reviews').append( ret );

  });

}













// =================================================================================================================================================
// =================================================================================================================================================


function getFirstElement( data ) {
        for (elem in data ) 
            return data[elem];
   }


function getItemList(){

  var ret = "<table>";

  $.each(returnedData, function(index, value) {

      ret += '<tr>';
      var primary = "";
      var notFirst = false;
      $.each(value, function(index2, value2) {
        if(!notFirst)
          primary = value2;
        notFirst = true;

        if(index2 == 'ID'){
          ret += '<td><button type="button" class="btn-danger" onclick="retireListItemCall('+value['ID']+',\''+getFirstElement(value)+'\');">X</button></td></tr>';
        }else{

          if(index2.indexOf("NOEDIT") >= 0){
            ret += '<td onclick="alert(\'This field cannot be edited. Please edit it\'s associated course, or delete it and create a new one.\');">'+value2+'</td>';

          }else{

            ret += '<td onclick="updateListItemCall(\''+value['ID']+'\',\''+index2+'\',\''+value2+'\');">'+value2+'</td>';
          }
        }
      });


      ret += '</tr>';
  });

  ret += "</table>";

  $('#currentItems').html(ret);

}





function addListItem(){

  $('#serverResponse').html("");

  // Allow for some inputs to be blank on some forms, also really bad formatting/logic but I don't care because it's late and this is going to work
  if(!(
    ( $('#listItem1').val() != "" && $('#listItem2').val() != "" && $('#listItem3').val() != "") || 
    ( $('#tableName').val() == 'tl_classlist' && ($('#listItem1').val() != "" && $('#listItem2').val() != "") ) ||
    ( $('#tableName').val() == 'tl_questionlist' && $('#listItem1').val() != "" )
    )) {
    $('#serverResponse').html("<b style='color:red;'>You are missing something on the current form.</b><br/>");
    return;
  }

  fetchData( addListItemReturn , '["'+$('#listItem1').val()+'","'+$('#listItem2').val()+'","'+$('#listItem3').val()+'"]', $('#tableName').val() );

}

function addListItemReturn(){
  $('#serverResponse').html("");
  if(returnedData[0]=='success'){
      $('#serverResponse').html("<b>Successfully added "+returnedData[1]+"</b><br/>");
      $('#listItem1').val("");
      $('#listItem2').val("");
      $('#listItem3').val("");
      fetchData( getItemList , $('#tableName').val(), "" );

  }else{
    if(returnedData[0] = "error"){
      $('#serverResponse').html("<b style='color:red;'>ERROR: "+returnedData[1]+"</b><br/>");
    }else{
      alert("Error: sever returned an error inserting item into database");
    }
  }
}


function retireListItemCall( ID, NAME ){

  if(confirm("Are you sure you want to delete "+NAME.replace("</td><td>","-")+"?")){
    fetchData( retireListItem , '["'+ID+'","'+NAME+'","'+$('#tableName').val()+'"]', "" );
  }
}

function retireListItem(){

  $('#serverResponse').html("");
  $('#serverResponse2').html("");
  
  if(returnedData[0] == 'success'){
    $('#serverResponse2').html("<b>Successfully retired  "+returnedData[1]+"</b><br/>");
    fetchData( getItemList , $('#tableName').val(), "" );

  }else{
    
    ('#serverResponse2').html("<b style='color:red;'>ERROR: Server returned an error updating database</b><br/>");

  }


}



function updateListItemCall( ROW, COL, OLD_VALUE){

  var updateValue = prompt("What would you like to change this value to?\n\nWarning: This cannot be undone.",OLD_VALUE);

  if(updateValue == "" || updateValue === null){
    return;
  }

  fetchData( updateListItem, '["'+$('#tableName').val()+'","'+ROW+'","'+COL+'","'+OLD_VALUE+'","'+updateValue+'"]', "");
}


function updateListItem(){

  $('#serverResponse').html("");
  $('#serverResponse2').html("");
  
  if(returnedData[0] == 'success'){
    $('#serverResponse2').html("<b>Successfully updated field from "+returnedData[1]+" to "+returnedData[2]+"</b><br/>");
    fetchData( getItemList , $('#tableName').val(), "" );

  }else{
    
    $('#serverResponse2').html("<b style='color:red;'>ERROR: Server returned an error updating database</b><br/>");

  }


}



















// ===================================================================================================================================
// ===================================================================================================================================


var facultyID, semester, classTypeID, section, studentData;


function getFacultyID(){
  $('#serverResponse').html("");
  if($('#facultyUniqueID').val() == ""){
    $('#serverResponse').html("<b style='color:red;'>You are missing something on the current form.</b><br/>");
    return;
  }

  fetchData( returnFacultyID , $('#facultyUniqueID').val(), "" );

}

function returnFacultyID(){
  $('#serverResponse').html("");
  if(returnedData[0] != 'success'){
    if(returnedData[0] == 'error'){
      $('#serverResponse').html("<b style='color:red;'>"+returnedData[1]+"</b><br/>");
    }else{
      alert("ERROR: Server returned an error. Code: 'returnFacultyID'");
    }
    return;
  }



    // returned faculty ID successfully, ask for current semester and store for future class additions
    $('#serverResponse').html("");
    facultyID = returnedData[1];

    $("#0").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
      $('#facultyInfo').html(returnedData[2]);
      $('#facultyInfo').fadeIn(DEFAULT_ANI_SPEED);

      var year = new Date().getFullYear();
      var month = new Date().getMonth();

      var term = 0;

      if(month > SPRING_MONTH_CUTOFF){
        term += 1;
      }
      if(month > SUMMER_MONTH_CUTOFF){
        term += 1;
      }
      if(month > FALL_MONTH_CUTOFF){
        term = 0;
        year++;
      }

      //alert(year + ' ' + term);
      var currentYear = year;
      var currentTerm = term;

      // Include next semester in list, but default to current semester
      term += 3;
      if(term > 3){
        year++;
        term -= 4;
      }
      ret = "";
      while (year > 2015 || (year == 2015 && term >= 2) ){
        //alert("year = "+year+" and term = "+term);
        var termText = "";
        switch(term){
          case 0:
            termText = "Spring";
            break;
          case 1:
            termText = "Summer";
            break;
          case 2:
            termText = "Fall";
            break;
          case 3:
            termText = "Winter";
            break;
          default:
            alert("Error in semester generation. Code: 'Attempted to make a semester out of year = "+year+" & term = "+term+"'");
            break;
        }
        var selected = "";
        if( currentYear == year && currentTerm == term) 
          selected = " selected";

        ret += '<option value="'+termText+' '+year+'"'+selected+'>'+termText+' '+year+'</option>';

        term--;
        if(term<0){
          year--;
          term = 3;
        }


      }
      $('#semester').html(ret);

      $("#1").fadeIn(DEFAULT_ANI_SPEED);
    });
  


}



function setSemester(){
  semester = $('#semester').val();
  $('#semesterInfo').html(semester);
  
  fetchData( getClassListForAddAClass , "", "" );

}

function getClassListForAddAClass(){
  if(returnedData.length == 0){
    $('#serverResponse').html("<b style='color:red;'>No active classes are in the class list. Please have an admin add classes.</b><br/>");
    return;
  }
  $("#1").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
      
      $('#semesterInfo').fadeIn(DEFAULT_ANI_SPEED);

      // Set class list options to pick from
      var ret = "";
      $.each(returnedData, function(index, value) {

        ret += '<option value="'+value['ClassTypeID']+'" id="'+value['ClassTypeID']+'">'+value['ShortName']+' - '+value['LongName']+'</option>';
      });

      $('#class').html(ret);

      $("#2").fadeIn(DEFAULT_ANI_SPEED);
  });
}



function setClass(){

  classTypeID = $('#class').val();
  section =  $('#section').val().toUpperCase();
  $('#classTypeInfo').html($('#'+classTypeID).html()+' - '+section);
  
  $("#2").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){

    $('#classTypeInfo').fadeIn(DEFAULT_ANI_SPEED);

    $("#3").fadeIn(DEFAULT_ANI_SPEED);
      
  });

}


var fileUploadData,studentRawData;
var studentData = [];

function setStudents(){

  if(!studentData || studentData.length<1){
    $('#serverResponse').html();
    $('#serverResponse').html("<b style='color:red;'>No student data to send. Please upload a valid .txt file with the student data.</b><br/>");
    return;
  }

  var fullClassData = {
    "Section":section,
    "ClassTypeID":classTypeID,
    "FacultyID":facultyID,
    "Semester":semester,
    "Students":studentData
  }


  fetchData( setStudentsReturn, JSON.stringify(fullClassData) , "");

}


function setStudentsReturn(){
  $('#serverResponse').html("");
  if(returnedData[0] != 'success'){
    if(returnedData[0] == 'error'){
      $('#serverResponse').html("<b style='color:red;'>"+returnedData[1]+"</b><br/>");
    }else{
      alert("ERROR: Server returned an error. Code: 'returnFacultyID'");
    }
    return;
  }

  // Server successfully added a class
  $("#3").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){

    $("#4").fadeIn(DEFAULT_ANI_SPEED);
      
  });

}



// Text File Handling

var openFile = function(event) {
  var input = event.target;

  var reader = new FileReader();
  reader.onload = function(){

    fileUploadData = reader.result;

    $('#serverResponse').html("");

    if(!fileUploadData || fileUploadData == "" || fileUploadData.length < 10 || fileUploadData.substring(1,5) != 'Name'){
      $('#serverResponse').html("<b style='color:red;'>No file uploaded, or file uploaded is not a class list.</b><br/>");
      return;
    }

    $('#studentCount').html("");
    $('#studentData').html("");

    studentRawData = fileUploadData.split("\n");
    studentData = [];
    studentRawData.splice(0,1);
    studentRawData.splice(studentRawData.length-1,studentRawData.length);// remove the extra array off the end caused by text file formatting
    if(studentRawData.length<1){
      $('#serverResponse').html("<b style='color:red;'>Student data file either contains no students or is corrupted.</b><br/>");
      return;
    }
    for(var i = 0;i < studentRawData.length; i++){
      studentRawData[i]=studentRawData[i].split("\t");
      studentData.push({
        "FirstName":studentRawData[i][1].split(", ")[0],
        "LastName":studentRawData[i][1].split(", ")[1],
        "UniqueID":studentRawData[i][3].replace("@miamioh.edu",""),
        "Major":studentRawData[i][4]
      });
    }

    console.log("Text File Uploaded Successfully" );

    displayCurrentStudentData();


  };// END reader.onload

  // Note: this code is run before the file is read in. Any code pertaining to the text file must go in the code block for "reader.onload" above
  reader.readAsText(input.files[0]);
};


function displayCurrentStudentData(){

  var ret = "<tr><th>Name</th><th>UniqueID</th><th>Major</th><th>Remove</th></tr>";

    $.each(studentData, function(index, value) {
      ret += '<tr id="studentDataRow_'+index+'"><td>'+value['FirstName']+' '+value['LastName']+'</td><td>'+value['UniqueID']+'</td><td>'+value['Major']+'</td><td><button type="button" class="btn-danger" onclick="removeStudent(' + index +'">X</button></td></tr>';
    });
    $('#studentData').html(ret);
    $('#studentCount').html('('+studentData.length+')');
    $('#studentDataHeader').fadeIn(DEFAULT_ANI_SPEED);
    $('#studentData').fadeIn(DEFAULT_ANI_SPEED);
}



function removeStudent( i ){

  studentData.splice(i, 1);

  displayCurrentStudentData();


}


function addManStudent(){
  studentData.push({
      "FirstName":$('#Man_FirstName').val(),
      "LastName":$('#Man_LastName').val(),
      "UniqueID":$('#Man_UniqueID').val().replace("@miamioh.edu","").toLowerCase(),
      "Major":$('#Man_Major').val()
    });

  displayCurrentStudentData();
  
}


















/*
 * This function creates sets of radio buttons for each review question
 */
function newQuestionSet( StudentID, ClassID, QuestionID, Question, table, qNumber){

  var row = table.insertRow();

  for(var i=1; i<=NUM_OF_OPTIONS; i++){

    if(i==((NUM_OF_OPTIONS+1)/2)  &&  Question.substring(0,13).toLowerCase() != "short answer:")
      var cell = row.insertCell().innerHTML= "<input type='radio' name='"+StudentID+"_"+ClassID+"_"+QuestionID+"' value='{\"StudentID\": \""+StudentID+"\",\"ClassID\": \""+ClassID+"\",\"QuestionID\": \""+QuestionID+"\", \"Value\":\""+i+"\"}' checked>";
    else if(Question.substring(0,13).toLowerCase() != "short answer:")
      var cell = row.insertCell().innerHTML= "<input type='radio' name='"+StudentID+"_"+ClassID+"_"+QuestionID+"' value='{\"StudentID\": \""+StudentID+"\",\"ClassID\": \""+ClassID+"\",\"QuestionID\": \""+QuestionID+"\", \"Value\":\""+i+"\"}'>";
    else
      var cell = row.insertCell();

  }

  if(Question.substring(0,13).toLowerCase() == "short answer:"){
    Question = Question.substring(13,Question.length).trim();
    row.insertCell().innerHTML = (qNumber+1)+". "+Question+"<br /><textarea class=\"shortAnswers\" maxlength=\"1000\" name='{\"StudentID\": \""+StudentID+"\",\"ClassID\": \""+ClassID+"\",\"QuestionID\": \""+QuestionID+"\", \"Value\":\"INSERT_VALUE_OF_SHORT_ANSWER\"}'></textarea>";

  }else{
    row.insertCell().innerHTML = (qNumber+1)+". "+Question;
  }

}


/*
 * This function is for quickly creating check boxes with labels
 */
 var checkID = 0
function newCheckBox( value, label, name){

  checkID++;

  var checkDisable = "";
  var disabledClass = "";

  if(label.indexOf("&&DISABLE&&") > -1){

    checkDisable = "disabled";
    disabledClass = ' class="disabledCheck" '
    label = label.replace("&&DISABLE&&","");

  }

  return '<tr><td><input type="checkbox" name="' + name + '" value="'+ value + '" id="check_' +checkID+ '" '+checkDisable+'></td><td><label for="check_'+checkID+'"'+disabledClass+'>'+label+'</label></td></tr>';

}


/*  This is used to get the name of a callback function (or any function) as a string. 
    Credit to: http://stackoverflow.com/questions/10624057/get-name-as-string-from-a-javascript-function-reference
*/
Function.prototype.getName = function(){
  // Find zero or more non-paren chars after the function start
  return /function ([^(]*)/.exec( this+"" )[1];
};