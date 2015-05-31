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

var returnedData = "";
function fetchData(){
  var url = serverRootURL+"serverfile.php?get&t=" + Math.random();
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            returnedData = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


var faculty,semesters,students,facultyToStudents;

function getCurrentData(){

  //fetchData();

  returnedData = 'Bob*SPLIT*Bill*SPLIT*Barry*SPLIT*Beth*ARRAY*Fall 2001*SPLIT*Spring 2001*SPLIT*Fall 2002*SPLIT*Spring 2002*ARRAY*{"1001": "Matt","1101": "Todd","1002": "Ed","1003": "Norm","1004": "Mike","1104": "Joe","1105": "Jill","1005": "Samantha","1006": "Steven","1007": "Marco","1008": "Elaine","1009": "Kate","1010": "Hailey"}*ARRAY*[ [1001,1002,1101], [1003,1004,1104,1105], [1005,1006,1009], [1007,1008,1010] ]';

  var raw = returnedData.split("*ARRAY*");
  faculty = raw[0].split("*SPLIT*");
  semesters = raw[1].split("*SPLIT*");
  students = JSON.parse(raw[2]);
  facultyToStudents = JSON.parse(raw[3]);

}

/*
  Bob*SPLIT*Bill*SPLIT*Barry*SPLIT*Beth*ARRAY*Fall 2001*SPLIT*Spring 2001*SPLIT*Fall 2002*SPLIT*Spring 2002*ARRAY*{1001: "Matt",1101: "Todd",1002: "Ed",1003: "Norm",1004: "Mike",1104: "Joe",1105: "Jill",1005: "Samantha",1006: "Steven",1007: "Marco",1008: "Elaine",1009: "Kate",1010: "Hailey}
  


  var faculty = [ "Bob", "Bill", "Barry", "Beth" ];
  var semesters = [ "Fall 2001", "Spring 2001", "Fall 2002", "Spring 2002" ];
  var students = {
      1001: "Matt",
      1101: "Todd",
      1002: "Ed",
      1003: "Norm",
      1004: "Mike",
      1104: "Joe",
      1105: "Jill",
      1005: "Samantha",
      1006: "Steven",
      1007: "Marco",
      1008: "Elaine",
      1009: "Kate",
      1010: "Hailey"
    };
  var facultyToStudents = [ [1001,1002,1101], [1003,1004,1104,1105], [1005,1006,1009], [1007,1008,1010] ];
*/





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


  getCurrentData();



  // Add current faculty to the list of faculty
  $.each(faculty, function(index, text) {
    $('#faculty').append( new Option(text,index) );

  });

  // Add available semesters
  $.each(semesters, function(index, text) {
    $('#semester').append( new Option(text,text) );

  });

  $("#loading").hide();

  $("#0").fadeIn(2000);


});// end document ready


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
        "<p><h2>" + students[$(text).val()] + "</h2>"+'<input type="hidden" name="id[]" value="'+$(text).val()+'"'+'<p>1 2 3 4 5<input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="2"><input type="radio" name="1[]" value="3"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="4"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="5"> Test Field Number One<br /><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="2"><input type="radio" name="1[]" value="3"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="4"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="5"> Test Field Number Two<br /> <input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="2"><input type="radio" name="1[]" value="3"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="4"><input type="radio" name="1[]" value="1"><input type="radio" name="1[]" value="5">Test Field Number Three<br /></p></p>'
      );



  $("#1").fadeOut(1000, "swing", function(){
    $("#2").fadeIn(1000);
  });

  });

}