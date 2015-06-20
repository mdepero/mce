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

function fetchData( callback ){
  var url = serverRootURL+"serverfile.php?get=" + callback.getName + "&t=" + Math.random();
  alert(url);
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            returnedData = xmlhttp.responseText;
            if(returnedData == "" || returnedData == null){
              alert("ERROR: Could not retreive data or database is empty");
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


  fetchData( buildInitialReviewForm );


});// end document ready



function buildInitialReviewForm(){


  // Add current faculty to the list of faculty
  $.each(returnedData.faculty, function(index, text) {
    $('#faculty').append( new Option(text,index) );

  });

  $("#loading").hide();

  $("#0").fadeIn(2000);

}



function addStudents(){

  $("#error").html("");
  if($("#faculty").val() == "" || $("#semester").val() == ""){
    $("#error").html("You are missing something on the current form.");
    return;
  }

  $.each(facultyToStudents[$("#faculty").val()], function(index, text) {
    $('#students').append( '<input type="checkbox" name="students" value="' + text + '" id="' + text + '">&nbsp;<label for="' + text + '"">' + students[text] + "</label><br/>" );

  });

  $("#addStudents").prop("disabled",true);

  $("#0").fadeOut(1000, "swing", function(){
    $("#1").fadeIn(1000);
  });

}


function addForms(){

  $.each( $('input[name="students"]:checked'), function(index, text) {

    $("#forms").append(
        "<p><h2>" + students[$(text).val()] + "</h2>"+'<input type="hidden" name="id[]" value="'+$(text).val()+'"'+'<p><table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td></td></tr><br /><tr><td><input type="radio" name="1[]" value="1"></td><td><input type="radio" name="1[]" value="2"></td><td><input type="radio" name="1[]" value="3"></td><td><input type="radio" name="1[]" value="4"></td><td><input type="radio" name="1[]" value="5"></td><td>Test Field Number One</td></tr><tr><td><input type="radio" name="1[]" value="1"></td><td><input type="radio" name="1[]" value="2"></td><td><input type="radio" name="1[]" value="3"></td><td><input type="radio" name="1[]" value="4"></td><td><input type="radio" name="1[]" value="5"></td><td>Test Field Number Two</td></tr><tr><td><input type="radio" name="1[]" value="1"></td><td><input type="radio" name="1[]" value="2"></td><td><input type="radio" name="1[]" value="3"></td><td><input type="radio" name="1[]" value="4"></td><td><input type="radio" name="1[]" value="5"></td><td>Test Field Number Three</td></tr></table>'
      );



  $("#1").fadeOut(1000, "swing", function(){
    $("#2").fadeIn(1000);
  });

  });

}



/*  This is used to get the name of a callback function (or any function) as a string. 
    Credit to: http://stackoverflow.com/questions/10624057/get-name-as-string-from-a-javascript-function-reference
*/
Function.prototype.getName = function(){
  // Find zero or more non-paren chars after the function start
  return /function ([^(]*)/.exec( this+"" )[1];
};