window.addEventListener("load", function () {
  const data = require("./data.json");
  

  const template = require("./templates/report.hbs");
  const body = this.document.querySelector("body");
  body.innerHTML = template(data);

  // let matchMedia = window.matchMedia("print");

  // matchMedia.onchange = function (e) {
  //   page.setAttribute("style", `margin-top:${header.height}px`);
  //   console.log(e);
  // };
});
