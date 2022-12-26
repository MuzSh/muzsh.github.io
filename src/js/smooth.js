function smoothScroll(target) {
    const targetPosition = target.getBoundingClientRect().top;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 500;
    let start = null;
  
    window.requestAnimationFrame(step);
  
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      window.scrollTo(0, distance * (progress / duration) + startPosition);
      if (progress < duration) window.requestAnimationFrame(step);
    }
  }
  
  // usage:
  const link = document.querySelector('a[href="#target"]');
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(event.target.getAttribute('href'));
    smoothScroll(target);
  });