
function loadPage() {
    var audio = document.getElementById("myaudio");
    audio.volume = 0.3;
    setTimeout(loadintro, 1);
    setTimeout(loadAfterTime, 31333);
    setTimeout(loadAfterTime2, 63000);
    setTimeout(loadAfterTime3, 159000);
    setTimeout(loadAfterTime4, 224000);
    setTimeout(loadAfterTime5, 262000);
    //setTimeout(loadAfterTime3, 294934)
    //setTimeout(loadAfterTime3, 557934)
    };
    function loadAfterTime5() 
    {
      document.querySelector('bgvid').defaultPlaybackRate = 0.25
    }
    function loadAfterTime4() 
    {
      var video = document.getElementById('bgvid');
      video.setAttribute('src', './src/video/inf.mp4');
      video.load();
      video.play();
    }
    function loadAfterTime3() 
    {
      var video = document.getElementById('bgvid');
      video.setAttribute('src', './src/video/glb.mp4');
      video.load();
      video.play();
    }
    function loadAfterTime2() 
    {
      var video = document.getElementById('bgvid');
      video.setAttribute('src', './src/video/redeye2.mp4');
      video.load();
      video.play();
    }
    function loadAfterTime() 
    {
      var video = document.getElementById("bgvid");
      video.play();
      // code you need to execute goes here. 
    }