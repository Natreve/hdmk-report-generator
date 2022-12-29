window.addEventListener("load", async function () {
  const data = require("./data.json");
  const template = require("./templates/home-inspection-current.hbs");
  // const template = require("./templates/uniform-mitigation.hbs");
  const html = this.document.querySelector("html");

  html.innerHTML = template({ ...data, title: "Report" });

  function resizeImage(image, width, height) {
    return new Promise((res, rej) => {
      const canvas = document.createElement("canvas");
      canvas.width = width; //635;
      canvas.height = height; //476;

      const ctx = canvas.getContext("2d");

      var hRatio = canvas.width / image.width;
      var vRatio = canvas.height / image.height;
      var ratio = Math.max(hRatio, vRatio);
      var centerShift_x = (canvas.width - image.width * ratio) / 2;
      var centerShift_y = (canvas.height - image.height * ratio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        centerShift_x,
        centerShift_y,
        image.width * ratio,
        image.height * ratio
      );
      image.src = canvas.toDataURL("image/jpeg", 1);
      image.addEventListener("load", () => res(image));
    });
  }
  function onImages() {
    return new Promise((res, rej) => {
      let loadedImages = 0;
      let images = this.document.querySelectorAll("img");
      let totalImages = images.length;

      if (!images.length) return res();
      images.forEach((img) => {
        const width = img.parentElement.offsetWidth;
        const height = img.parentElement.offsetHeight;
        const image = document.createElement("img");

        image.src = img.src;
        image.crossOrigin = "anonymous";

        image.addEventListener("load", async () => {
          await resizeImage(image, width, height);
          loadedImages++;

          if (loadedImages === totalImages) res(loadedImages);
        });
      });
    });
  }
  function addPageNumbers() {
    const pageheight = 1123 - 38;
    const totalPages = Math.ceil(document.body.offsetHeight / pageheight);
    console.log(totalPages);
    for (var i = 0; i <= totalPages; i++) {
      var pageNumberDiv = document.createElement("div");
      var pageNumber = document.createTextNode(`Page ${i} of ${totalPages}`);

      pageNumberDiv.style.position = "absolute";
      pageNumberDiv.style.top = `calc((${i} * (${pageheight}px - 4px)) - 40px)`; //297mm A4 pageheight; 0,5px unknown needed necessary correction value; additional wanted 40px margin from bottom(own element height included)
      pageNumberDiv.style.height = "16px";
      pageNumberDiv.appendChild(pageNumber);
      document.body.insertBefore(
        pageNumberDiv,
        document.getElementById("content")
      );
      pageNumberDiv.style.left =
        "calc(100% - (" + pageNumberDiv.offsetWidth + "px + 20px))";
    }
  }

  await onImages();
  // addPageNumbers();
  // window.onbeforeprint = () => addPageNumbers();
  // window.onafterprint = removePageNumbers;
  // function draggable(elem) {
  //   let mouseX = 0;
  //   let mouseY = 0;
  //   let elemX = 0;
  //   let elemY = 0;
  //   let dragging = false;

  //   elem.style.cursor = "move";
  //   elem.style.position = "absolute";
  //   elem.draggable = false; // needs to be removed so the element can be moved properly

  //   elem.onmousedown = function () {
  //     elem.classList.add("dragging");
  //     elemX = mouseX - elem.offsetLeft;
  //     elemY = mouseY - elem.offsetTop;
  //   };

  //   document.onmousemove = function (e) {
  //     mouseX = e.pageX;
  //     mouseY = e.pageY;

  //     if (elem.classList.contains("dragging")) {
  //       elem.style.left = mouseX - elemX + "px";
  //       elem.style.top = mouseY - elemY + "px";
  //     }
  //   };

  //   document.onmouseup = () => elem.classList.remove("dragging");
  // }
  // draggable(this.document.querySelector("#logo"));
});
