/*
 * All Code by Matt DePero Unless Noted
 *
 */



// URL to folder that contains serverfile.php, including '/' on the end
var serverRootURL = "http://107.10.18.206/";


var xmlhttp;
if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari

  xmlhttp=new XMLHttpRequest();
}else{// code for IE6, IE5

  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}



function setData( data ){
  var url = serverRootURL+"serverfile.php?set="+data+"&t=" + Math.random();
  xmlhttp.open("GET",url,true);
  xmlhttp.send();
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


  fetchData( buildInitialReviewForm ,"", "" );


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

  $("#0").fadeIn(2000);

}

function callAddClasses(){
  fetchData(addClassList,$('#faculty').val(),$('#semester').val());
}

function addClassList(){

  $("#error").html("");
  if($("#faculty").val() == "" || $("#semester").val() == ""){
    $("#error").html("You are missing something on the current form.");
    return;
  }


  if($.isEmptyObject(returnedData["Classes"])){ // Checks to see if the returned javascript object has any given properties or not
    alert("Sorry, no matches found. Try again");
    return;
  }

  // Populate class list for professor
  $.each(returnedData["Classes"], function(index, text) {

    $('#classes').append( newCheckBox(index, text, "class") );

  });

  $("#addClasses").prop("disabled",true);

  $("#0").fadeOut(1000, "swing", function(){
    $("#1").fadeIn(1000);
  });

}

function callAddStudents(){
  var classList = "[";
  var first = true;
  $.each($('input[type="checkbox"][name="class\\[\\]"]:checked').map(function() { return this.value; }), function(index, value){
    if(first)
      first = false;
    else
      classList += ",";

    classList += value;
  });
  classList += "]";
  fetchData(addStudents,classList,"");
}

function addStudents(){

  if ($("#1 input:checkbox:checked").length == 0){
    $("#error").html("You are missing something on the current form.");
    return;
  }

  
  for(var i = 0;i<returnedData.length;i++){

    var Row = returnedData[i];

    $("#studentListClasses").append(' <h4>'+Row.Class["Name"]+'</h4>');

    $("#studentListClasses").append(' <table class="form checkboxes" id="'+ Row.Class["ID"] +'">');


      $.each(Row.Students, function(index, text) {

        $('#'+Row.Class["ID"]).append( newCheckBox(index, text, Row.Class["ID"]) );

      });


    $("#studentListClasses").append(' </table>');

  }


  $("#addStudents").prop("disabled",true);

  $("#1").fadeOut(1000, "swing", function(){
    $("#2").fadeIn(1000);
  });

}


function addForms(){

  $.each( $('input[name="students"]:checked'), function(index, text) {

    $("#forms").append(
        "<p><h2>" + students[$(text).val()] + "</h2>"+'<input type="hidden" name="id[]" value="'+$(text).val()+'"'+'<p><table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td></td></tr><br /><tr><td><input type="radio" name="1[]" value="1"></td><td><input type="radio" name="1[]" value="2"></td><td><input type="radio" name="1[]" value="3"></td><td><input type="radio" name="1[]" value="4"></td><td><input type="radio" name="1[]" value="5"></td><td>Test Field Number One</td></tr><tr><td><input type="radio" name="1[]" value="1"></td><td><input type="radio" name="1[]" value="2"></td><td><input type="radio" name="1[]" value="3"></td><td><input type="radio" name="1[]" value="4"></td><td><input type="radio" name="1[]" value="5"></td><td>Test Field Number Two</td></tr><tr><td><input type="radio" name="1[]" value="1"></td><td><input type="radio" name="1[]" value="2"></td><td><input type="radio" name="1[]" value="3"></td><td><input type="radio" name="1[]" value="4"></td><td><input type="radio" name="1[]" value="5"></td><td>Test Field Number Three</td></tr></table>'
      );



  $("#2").fadeOut(1000, "swing", function(){
    $("#3").fadeIn(1000);
  });

  });

}





/*
 * This function is for quickly creating check boxes with labels
 */
function newCheckBox( value, label, name){

  var randID = Math.floor(Math.random()*1000000);

  return '<tr><td><input type="checkbox" name="' + name + '[]" value="'+ value + '" id="' +randID+ '"></td><td><label for="'+randID+'">'+label+'</label></td></tr>';

}


/*  This is used to get the name of a callback function (or any function) as a string. 
    Credit to: http://stackoverflow.com/questions/10624057/get-name-as-string-from-a-javascript-function-reference
*/
Function.prototype.getName = function(){
  // Find zero or more non-paren chars after the function start
  return /function ([^(]*)/.exec( this+"" )[1];
};