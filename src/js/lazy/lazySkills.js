  
  <script>
  var lazyElement = document.getElementById("lazy-skills");

  // Create an intersection observer to detect when the element comes into view
  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        lazyElement.innerHTML = this.responseText;
      };
      xhr.open("GET", lazyElement.dataset.src);
      xhr.send();
      
      observer.unobserve(lazyElement);
    }
  });

  // Start observing the element
  observer.observe(lazyElement);
</script>