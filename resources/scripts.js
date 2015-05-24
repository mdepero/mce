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

  var faculty = { "Bob", "Billy", "Brock", "Beth" };


  // Add current faculty to the list of faculty
  $.each(faculty, function(val, text) {
    $('#faculty').append( new Option(text,val) );

  });


});// end document ready