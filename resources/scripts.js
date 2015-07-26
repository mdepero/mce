/*
 * All Code by Matt DePero Unless Noted
 *
 */



// URL to folder that contains serverfile.php, including '/' on the end
var serverRootURL = "http://107.10.18.206/";

var SLOW_ANI_SPEED = 1500;

var DEFAULT_ANI_SPEED = 1000;

var FAST_ANI_SPEED = 600;


var xmlhttp;
if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari

  xmlhttp=new XMLHttpRequest();
}else{// code for IE6, IE5

  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
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

    $('#forms').append( '<table id="form_'+index+'" class="radios"></table>' );

      $.each(questions, function(index2, value2) {

        newQuestionSet(value.value, value.name, value2["ID"], value2["Question"], $('#form_'+index)[0] );

      });

      var row = $('#form_'+index)[0].insertRow(0);
      row.insertCell().innerHTML = "1";
      row.insertCell().innerHTML = "2";
      row.insertCell().innerHTML = "3";
      row.insertCell().innerHTML = "4";
      row.insertCell().innerHTML = "5";
      row.insertCell().innerHTML = "";

      if(index < formCheckBoxes.length-1){

        $('#form_'+index).append( '<tr><td></td><td></td><td></td><td></td><td></td><td><button class="btn btn-primary" id="submit" onclick="javascript:nextForm();">Next Student</button></td></tr>' );
      }else{

        $('#form_'+index).append( '<tr><td></td><td></td><td></td><td></td><td></td><td><button class="btn btn-success" id="submit" onclick="javascript:submitForm();">Submit</button></td></tr>' );
      }

  });


  $("#2").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
    $("#3").show();
    $("#forms h2,h3,table").hide();
    $("#forms").promise().done(function() { nextForm(); });// Wait until all of the inner elements of forms have been hidden, then begin nextForm
  });

}

var lastClass = "";
function nextForm(){


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
      console.log("Getting rid of old header and showing new: "+headerNumber);
      $('#header_'+headerNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED, function() {
        headerNumber++;
        $('#header_'+headerNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
      });
      lastClass = formCheckBoxes[formNumber].name;
    }
  }




  // new class, move to next class header
  if(formNumber == -1){

    console.log("Just showing new name and form");
    formNumber++;
    $('#name_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
    $('#form_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
  }else{
    console.log("Getting rid of old form and old name: "+ formNumber);
    $('#name_'+formNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED);
    $('#form_'+formNumber).hide('slide', {direction: 'left'}, FAST_ANI_SPEED, function(){
      formNumber++;
      $('#name_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
      $('#form_'+formNumber).show('slide', {direction: 'right'}, FAST_ANI_SPEED);
    });
  }


}




function submitForm(){

  var checkedResponses = $('#forms input:radio:checked');
  var responseJSON = '[[';

  var first = true;
  var lastStudentID = "";
  var lastClassID = "";
  $.each(checkedResponses, function(index,value){

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

  fetchData(sendForm, responseJSON, "");

}

function sendForm(){

  if(returnedData[0] == "Success"){

    $("#success").html("Your forms were successfully submitted :)");

  }else{

    $("#error").html("An error occured attempting to submit your forms.");
  }

  $("#3").fadeOut(DEFAULT_ANI_SPEED, "swing", function(){
    $("#4").fadeIn(DEFAULT_ANI_SPEED);
  });

}











// =================================================================================================================================================
// =================================================================================================================================================





function getReviews(){

  $.each(returnedData, function(index, value) {

    $('#reviews').append( '<h2 id="student'+ value['StudentID'] +'">'+ value['Student'] +"</h2>"+'<div id="reviewsFor'+value['StudentID']+'">');

    $.each(value['Reviews'], function(index, review) {

       var ret = '<h3 id="review'+review['ReviewID']+'">'+review['Class']+'</h3>';

       ret += '<div id="answersFor'+review['ReviewID']+'">';

       $('#reviews').append( ret );

    });

    $('#reviews').append( '</div>' )

  });

}





















































/*
 * This function creates sets of radio buttons for each review question
 */
function newQuestionSet( StudentID, ClassID, QuestionID, Question, table){

  var row = table.insertRow();

  for(var i=1; i<=5; i++){

    if(i==3)
      var cell = row.insertCell().innerHTML= "<input type='radio' name='"+StudentID+"_"+ClassID+"_"+QuestionID+"' value='{\"StudentID\": \""+StudentID+"\",\"ClassID\": \""+ClassID+"\",\"QuestionID\": \""+QuestionID+"\", \"Value\":\""+i+"\"}' checked>";
    else
      var cell = row.insertCell().innerHTML= "<input type='radio' name='"+StudentID+"_"+ClassID+"_"+QuestionID+"' value='{\"StudentID\": \""+StudentID+"\",\"ClassID\": \""+ClassID+"\",\"QuestionID\": \""+QuestionID+"\", \"Value\":\""+i+"\"}'>";

  }

  row.insertCell().innerHTML = Question;
}


/*
 * This function is for quickly creating check boxes with labels
 */
function newCheckBox( value, label, name){

  var randID = Math.floor(Math.random()*1000000);

  return '<tr><td><input type="checkbox" name="' + name + '" value="'+ value + '" id="' +randID+ '"></td><td><label for="'+randID+'">'+label+'</label></td></tr>';

}


/*  This is used to get the name of a callback function (or any function) as a string. 
    Credit to: http://stackoverflow.com/questions/10624057/get-name-as-string-from-a-javascript-function-reference
*/
Function.prototype.getName = function(){
  // Find zero or more non-paren chars after the function start
  return /function ([^(]*)/.exec( this+"" )[1];
};