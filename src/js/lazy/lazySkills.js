    
    <script>
    {/* // Select the lazy-loading element */}
    var lazyElement = document.getElementById("lazy-skills");
  
    // Create an intersection observer to detect when the element comes into view
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        // The element is now in view, so load the content
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          lazyElement.innerHTML = this.responseText;
        };
        xhr.open("GET", lazyElement.dataset.src);
        xhr.send();
  
        // Unsubscribe from the observer
        observer.unobserve(lazyElement);
      }
    });
  
    // Start observing the element
    observer.observe(lazyElement);
  </script>