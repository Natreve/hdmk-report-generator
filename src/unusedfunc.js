const optimiseImages = () => {
    // const imageResize = (image, width, height) => {
    //   if (image.getAttribute("resized")) return;
    //   let img = new Image();
    //   img.crossOrigin = "anonymous";
    //   img.src = image.src;
    //   img.addEventListener("load", function () {
    //     const canvas = document.createElement("canvas");
    //     canvas.width = width; //635;
    //     canvas.height = height; //476;
    //     const ctx = canvas.getContext("2d");
    //     var hRatio = canvas.width / img.width;
    //     var vRatio = canvas.height / img.height;
    //     var ratio = Math.max(hRatio, vRatio);
    //     var centerShift_x = (canvas.width - img.width * ratio) / 2;
    //     var centerShift_y = (canvas.height - img.height * ratio) / 2;
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.imageSmoothingQuality = "high";
    //     ctx.drawImage(
    //       img,
    //       0,
    //       0,
    //       img.width,
    //       img.height,
    //       centerShift_x,
    //       centerShift_y,
    //       img.width * ratio,
    //       img.height * ratio
    //     );
    //     image.src = canvas.toDataURL("image/jpeg", 1);
    //     image.setAttribute("resized", true);
    //   });
    // };
    // const coverImage = document.querySelector(".cover-image img");
    // const images = document.querySelectorAll("li.image img");
    // coverImage.addEventListener("load", () => imageResize(coverImage, 635, 476));
    // images.forEach((image) =>
    //   image.addEventListener("load", () => imageResize(image, 200, 200))
    // );
  };
  /**
   *
   * @param {htmlElement} elem the paragraph element that you wish to get the line number for
   * @param {Number} line the line number you wish to get
   * @returns {String} The value at the specified line number
   */
  function getLine(elem, line) {
    line--;
    var spanChildren = elem.getElementsByTagName("span");
    var paragraphText = elem.innerHTML; //.replace(/(\r\n|\n|\r)/gm, "");
    var newParagraphText = "";
    var words = [];

    if (spanChildren.length === 0) {
      words = paragraphText.split(" ");
      for (var i = 0; (max = words.length), i < max; i++)
        newParagraphText += "<span>" + words[i] + "</span> ";
      elem.innerHTML = newParagraphText;
    } else {
      for (var i = 0; (max = spanChildren.length), i < max; i++) {
        words[words.length] = spanChildren[i].innerHTML;
      }
    }
    var lineCounter = 0;
    var previousY = spanChildren[0].offsetTop;
    var returnText = "";
    var startReturning = false;
    for (var i = 0; (max = words.length), i < max; i++) {
      if (spanChildren[i].offsetTop != previousY) lineCounter++;
      if (lineCounter === line) startReturning = true;
      if (lineCounter !== line && startReturning) {
        return returnText.substring(0, returnText.length - 1);
      }
      if (startReturning) {
        returnText += words[i] + " ";
        if (i + 1 === words.length) {
          return returnText.substring(0, returnText.length - 1);
        }
      }
      previousY = spanChildren[i].offsetTop;
    }
  }
  /**
   *
   * @param {htmlElement} elem the paragraph element that you wish to get the line number for
   * @returns  {Array} An array lines within the paragraph
   */
  
   function addPageNumbers(MAXHEIGHT) {
    var totalPages = Math.ceil(document.body.scrollHeight / MAXHEIGHT); //842px A4 pageheight for 72dpi, 1123px A4 pageheight for 96dpi,

    for (var i = 0; i <= totalPages; i++) {
      if (i === 1) continue;
      var pageNumberDiv = document.createElement("div");
      var pageNumber = document.createTextNode(
        "Page " + i + " of " + totalPages
      );
      pageNumberDiv.style.position = "absolute";
      pageNumberDiv.style.top = `calc((${i} * (297mm - 0.5px)) - 40px)`; //297mm A4 pageheight; 0,5px unknown needed necessary correction value; additional wanted 40px margin from bottom(own element height included)
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