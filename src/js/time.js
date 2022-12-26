function timeTick() {
<style>

</style>
  const element = (
    <div>
      <h1>Hello World!</h1>
      <h2>{new Date().toLocaleTimeString()}</h2>
      <h2>{new Date().toDateString()}</h2>
    </div>
  );
  ReactDOM.render(element, document.getElementById("root"));
}

setInterval(timeTick, 1000);
