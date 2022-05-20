window.addEventListener("load", function () {
  const data = require("./data.json");

  const template = require("./templates/report.hbs");
  const content = this.document.createElement("div");
  content.innerHTML = template(data);
  this.document.body.appendChild(content)

  // document.body.appendChild(template({ name: "Andrew Gray" }));
  // const data = require("./data.json");
  // const { Container, Image, BlockJs } = require("./blockJS/block.js");
  // const blockjs = new BlockJs();
  // Container([Image("./images/HDMK.png", { alt: "hdmk logo" })], {
  //   class: "logo",
  //   target: "header",
  // });
  // blockjs.header(
  //   Image("./images/HDMK.png", { alt: "hdmk logo", class: "logo" })
  // );
  // new Wrapper({
  //   class: "logo",
  //   target: "header",
  //   blocks: new Image("./images/HDMK.png", { alt: "hdmk logo" }).image,
  // });
  // let header = document.querySelector("header").getBoundingClientRect();
  // let spacer = document.querySelector("hr");
  // let page = document.querySelector(".page");
  // let matchMedia = window.matchMedia("print");
  // spacer.setAttribute("style", `height:${header.height}px;opacity:0;`);
  // matchMedia.onchange = function (e) {
  //   page.setAttribute("style", `margin-top:${header.height}px`);
  //   console.log(e);
  // };
});
