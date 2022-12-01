var quoteArray = [];
var index = 0; 
var textPosition = 0; 
var flag = true;

var statements = ['print', 'system.out.println', 'console.log', " cout << "];
var rand = Math.floor(Math.random() * statements.length);
var endings = ['', ';', ';', ';'];

loadQuote = () => {
  const url = 'https://api.quotable.io/random';
  fetch(url)

  .then(response => {
    if (!response.ok) throw Error(response.statusText);
      return response.json();
   })

   .then(data => {
      quoteArray[index] = '<span style="color:white">' + 
      statements[rand] + 
      '<span style="color:lightblue">' + 
      "(" 
      + '<span style="color:lightsalmon">'
      + "'"
      + data.content
      + "'"
      + '<span style="color:lightblue">'
      + ")"
      + '<span style="color:white">'
      + endings[rand];
   })

   .catch(error => console.log(error));
}

typewriter = () => {
  if(flag){
    loadQuote();
    quoteArray[index] += ""; 
    flag = false;
  }

  document.querySelector("#quote").innerHTML = quoteArray[index].substring(0, textPosition) + '<span style="color:white">\u25AE</span>';


  if(textPosition++ != quoteArray[index].length){
    setTimeout("typewriter()", 42.666);
  }
  else{
    quoteArray[index] = ' ';
    setTimeout("typewriter()", 10000);
    textPosition = 10;
    flag = true;
  }   
}

window.addEventListener('load', typewriter);
