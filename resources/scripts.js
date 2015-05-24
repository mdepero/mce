// All Code by Matt DePero Unless Noted


// Smooth Scroll Code provided by CSS Tricks https://css-tricks.com/snippets/jquery/smooth-scrolling/
$(document).ready(function(){
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


  /*+-------------------------------------+
   *|   To be retreived from database     |
   *|    End result array for testing     |
   *+-------------------------------------+
   */
  var faculty = [ "Bob", "Bill", "Brock", "Beth" ];
  var semesters = [ "Fall 2001", "Spring 2001", "Fall 2002", "Spring 2002" ];






  // Add current faculty to the list of faculty
  $.each(faculty, function(index, text) {
    $('#faculty').append( new Option(text,text) );

  });

  // Add available semesters
  $.each(semesters, function(index, text) {
    $('#semesters').append( new Option(text,text) );

  });

  $("#loading").hide();

  $("#0").fadeIn(2000);


});// end document ready