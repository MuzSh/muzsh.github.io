function scrollToSection(id) {
  // Find the element with the specified id
  var element = $('#' + id);

  // Check if the element exists
  if (element.length > 0) {
    // Scroll to the element
    $('html, body').animate({
      scrollTop: element.offset().top
    }, 1242);
  }
}