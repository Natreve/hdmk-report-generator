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
    var pageNumber = document.createTextNode("Page " + i + " of " + totalPages);
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

function addPageNumbers() {
  let pages = document.querySelectorAll("section");
  let totalPages = pages.length;

  pages.forEach((page, i) => {
    let pagenumber = document.createElement("div");
    let content = document.createTextNode(`Page ${i + 1} of ${totalPages}`);

    pagenumber.classList.add("pagenumber");
    pagenumber.appendChild(content);
    page.append(pagenumber);
  });
}
function removePageNumbers() {
  document
    .querySelectorAll(".pagenumber")
    .forEach((element) => element.remove());
}
function handleParagraph(paragraph, doc, offsetHeight) {
  const ptext = paragraph.innerHTML;
  const result = ptext.replace(/^\s+|\s+$/gm, "");
  const p = document.createElement("p");

  let text = "";

  result.split(/\r\n|\n/).forEach((line) => (text += ` ${line}`));

  paragraph.innerHTML = text;

  const compStyles = window.getComputedStyle(paragraph);
  const lineHeight = parseInt(compStyles.getPropertyValue("line-height"));

  const lines = getLines(paragraph, paragraph.offsetWidth);

  let contentHeight = 0;
  let header = document.querySelector("header");

  let top = parseInt(getComputedStyle(header, null).getPropertyValue("top"));
  let padding = header.offsetHeight + top;

  function recur(lines, pageBreak, offsetHeight) {
    if (!lines.length) return;
    let lineCount = lines.length;
    let height = padding;
    let paragraph = document.createElement("p");
    let text = "";
    if (pageBreak) paragraph.classList.add("paragraph-break");

    while (lineCount) {
      lineCount--;
      height += lineHeight;

      if (height <= MAXHEIGHT - doc.offset) {
        text += `\n${lines.shift()}`;
      } else {
        pageBreak = true;
        break;
      }
    }

    paragraph.innerHTML = text;
    let newpage = paragraph.classList.contains("paragraph-break");

    if (newpage) {
      doc.addPage({ content: paragraph.cloneNode(true) });
      contentHeight = height;
    } else {
      doc.pages[doc.pageCount - 1].append(paragraph.cloneNode(true));
    }

    recur(lines, pageBreak, 0);
  }

  recur(lines, false, offsetHeight);

  return contentHeight;
}

function grid(element, contentHeight, doc) {
  const pageHeight = MAXHEIGHT - doc.offset;
  const children = element.children;
  const height = nodeHeight(element);
  let maxWidth = nodeWidth(element);
  let sameDimensions = false;
  let childWidth = 0;
  let childHeight = 0;
  let numRows = 0;
  let maxColumns = 0;

  contentHeight += height;

  if (contentHeight < pageHeight) {
    doc.activePage.push(element);

    return height;
  }

  for (let i = 0; i < children.length; i++) {
    if (children.length === 1) {
      childWidth = nodeWidth(children[0]);
      childHeight = nodeHeight(children[0]);
      sameDimensions = true;
      break;
    }
    if (i === 0) continue;

    if (
      nodeWidth(children[i - 1]) !== nodeWidth(children[i]) &&
      nodeHeight(children[i - 1]) !== nodeHeight(children[i])
    ) {
      break;
    }
    childWidth = nodeWidth(children[i]);
    childHeight = nodeHeight(children[i]);
    sameDimensions = true;
  }

  if (!sameDimensions) return 0;

  if (children.length === 1) {
    numRows = 1;
  } else if (children.length > 1) {
    numRows = Math.round(children.length / Math.round(maxWidth / childWidth));
    maxColumns = Math.round(maxWidth / childWidth);
  }
  let rows = [];
  let cols = [];

  for (let index = 0; index < children.length; index++) {
    const child = cloneNode(children[index]);

    cols.push(child);
    if (cols.length === maxColumns) {
      rows.push(cols);
      cols = [];
    }
    if (index + 1 === children.length && cols.length) {
      rows.push(cols);
    }
  }

  contentHeight -= height;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    let container = cloneNode(element, false);

    row.forEach((col) => container.append(col));
    contentHeight += childHeight;

    if (contentHeight < pageHeight) {
      doc.activePage.push(container);
      continue;
    }

    contentHeight = childHeight;
    doc.addPage([container]);
  }

  return 0;
}
function table(element, contentHeight, doc) {
  const pageHeight = MAXHEIGHT - doc.offset;
  const table = cloneNode(element, false);
  const height = nodeHeight(element);
  contentHeight += height;

  if (contentHeight < pageHeight) {
    doc.activePage.push(element);

    return height;
  }
  //if the table height is less than the page height then no need to do a complex splitting
  //just add content to new page and return the negative pageHeight to cancel out the contentHeight

  if (height < pageHeight) {
    doc.addPage([element]);
    return -pageHeight;
  }

  return 0;
}

function addContent(parent, doc, contentHeight = 0) {
  const pageHeight = MAXHEIGHT - doc.offset;
  const content = parent.children;

  function fn(element, doc, contentHeight = 0) {
    const elements = element.children;
    const parent = cloneNode(element, false);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const height = nodeHeight(element);
      const compStyle = window.getComputedStyle(element);
      const type = compStyle.getPropertyValue("display");

      contentHeight += height;

      if (contentHeight < pageHeight) {
        parent.append(cloneNode(element));
        continue;
      }
      if (parent.children.length) doc.activePage.push(parent);

      if (type === "grid") {
        // contentHeight += grid(element, contentHeight, doc);
        continue;
      }
    }
  }

  for (let i = 0; i < content.length; i++) {
    const element = content[i];
    const compStyle = window.getComputedStyle(element);
    const type = compStyle.getPropertyValue("display");
    const height = nodeHeight(element);
    contentHeight += height;

    if (contentHeight < pageHeight) {
      doc.activePage.push(element);

      continue;
    }

    if (element.children.length > 1) {
      contentHeight -= nodeHeight(element);
      let parent = cloneNode(element, false);
      let children = element.children;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        contentHeight += nodeHeight(child);

        if (contentHeight < pageHeight) {
          parent.append(cloneNode(child));
          continue;
        }

        if (parent.children.length) doc.activePage.push(parent);

        if (nodeHeight(child) < pageHeight) {
          parent = cloneNode(parent, false);
          parent.append(cloneNode(child));
          doc.addPage([parent]);
          contentHeight = nodeHeight(child);
          continue;
        }

        break;
      }
    }
  }
}
function getLine(paragraphId, lineNum) {
  lineNum--;
  var elem = document.getElementById(paragraphId);
  var spanChildren = elem.getElementsByTagName("span");
  var paragraphText = elem.innerHTML.replace(/(\r\n|\n|\r)/gm, "");
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
    if (lineCounter === lineNum) startReturning = true;
    if (lineCounter !== lineNum && startReturning)
      return returnText.substring(0, returnText.length - 1);
    if (startReturning) {
      returnText += words[i] + " ";
      if (i + 1 === words.length)
        return returnText.substring(0, returnText.length - 1);
    }
    previousY = spanChildren[i].offsetTop;
  }
}
class Document {
  constructor() {
    this.body = document.createElement("body");
    this.pageCount = 0;
    this.pages = {};
    this.activePage = null;
    let header = document.querySelector("header");

    let top = getComputedStyle(header, null).getPropertyValue("top");
    this.header = header.offsetHeight + parseInt(top);
    this.footer = parseInt(
      window
        .getComputedStyle(window.document.documentElement)
        .getPropertyValue("--footer")
    );
    this.offset = this.header + this.footer;
  }

  addPage = (content = []) => {
    this.pageCount++;
    this.pages[this.pageCount] = content;

    this.activePage = this.pages[this.pageCount];
    return this.pages[this.pageCount];
  };
  render(body) {
    const header = document.querySelector("header");
    if (header) this.body.append(header.cloneNode(true));

    Object.keys(this.pages).forEach((i) => {
      let page = document.createElement("section");
      page.style.paddingTop = `${this.header}px`;

      this.pages[i].forEach((element) => page.append(cloneNode(element)));
      this.body.append(page);
    });

    body.innerHTML = this.body.innerHTML;

    return this.body;
  }
}

function getLines(elem) {
  let line = 0;
  let lines = [];
  let spanChildren = elem.getElementsByTagName("span");
  let paragraphText = elem.innerHTML; //.replace(/(\r\n|\n|\r)/gm, "");
  let newParagraphText = "";
  let words = [];

  if (spanChildren.length === 0) {
    words = paragraphText.split(" ");
    for (let i = 0; (max = words.length), i < max; i++)
      newParagraphText += "<span>" + words[i] + "</span> ";
    elem.innerHTML = newParagraphText;
  } else {
    for (let i = 0; (max = spanChildren.length), i < max; i++) {
      words[words.length] = spanChildren[i].innerHTML;
    }
  }
  let lineCounter = 0;
  let previousY = spanChildren[0].offsetTop;
  let returnText = "";
  let startReturning = false;

  for (let i = 0; (max = words.length), i < max; i++) {
    if (spanChildren[i].offsetTop != previousY) lineCounter++;
    if (lineCounter === line) startReturning = true;
    if (lineCounter !== line && startReturning) {
      let txt = returnText.substring(0, returnText.length - 1);
      if (txt) lines.push(txt);
      line++;
      returnText = "";
    }
    if (startReturning && words[i]) {
      returnText += words[i] + " ";
      if (i + 1 === words.length) {
        let txt = returnText.substring(0, returnText.length - 1);

        if (txt) lines.push(txt);
        line++;
        returnText = "";
      }
    }
    previousY = spanChildren[i].offsetTop;
  }

  // let reallines = [];
  // let accum = 0;
  // let realline = "";
  // elem.querySelectorAll("span").forEach((span) => {
  //   accum += span.offsetWidth;
  //   if (accum >= width) {
  //     reallines.push(realline);
  //     accum = 0;
  //     realline = "";
  //   }
  //   realline += `${span.innerHTML} `;
  // });

  return lines;
}

function maxHeight() {
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--page-height"
      )
    ) -
    parseFloat(
      getComputedStyle(
        document.body.querySelectorAll("section")[0]
      ).getPropertyValue("padding-top")
    ) *
      2
  );
}
function headerHeight() {}
function cloneNode(element, deep = true) {
  if (!element) return null;
  let clone = element.cloneNode(deep);

  Array.from(element.attributes).forEach((attribute) => {
    clone.setAttribute(attribute.nodeName, attribute.nodeValue);
  });

  return clone;
}
function nodeHeight(element, debug = false) {
  if (!element) return 0;
  let height = element.offsetHeight;

  height += parseInt(
    getComputedStyle(element).getPropertyValue("margin-top") || 0
  );
  height += parseInt(
    getComputedStyle(element).getPropertyValue("margin-bottom") || 0
  );

  if (debug) console.log(height);
  return height;
}
function nodeWidth(element, debug = false) {
  let width = element.offsetWidth;
  width += parseInt(getComputedStyle(element).getPropertyValue("margin-left"));
  width += parseInt(getComputedStyle(element).getPropertyValue("margin-right"));
  if (debug) console.log(width);
  return width;
}

// a promise that resolves when all images have completely loaded and have been optimazed
function onImages() {
  return new Promise((res, rej) => {
    let loadedImages = 0;
    let images = this.document.querySelectorAll("img");
    let totalImages = images.length;

    if (!images.length) return res();
    images.forEach((img) => {
      const image = document.createElement("img");
      image.src = img.src;
      image.crossOrigin = "anonymous";

      image.addEventListener("load", () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          res();
        }
      });
    });
  });
}

function breakParagraph(paragraph, availableHeight) {
  const ptext = paragraph.innerHTML;
  const result = ptext.replace(/^\s+|\s+$/gm, "");
  // const p = document.createElement("p");
  let text = "";
  result.split(/\r\n|\n/).forEach((line) => {
    text += ` ${line}`;
  });
  paragraph.innerHTML = text;
  // p.innerHTML = text;
  const compStyles = window.getComputedStyle(paragraph);
  const lineHeight = parseInt(compStyles.getPropertyValue("line-height"));
  const lines = getLines(paragraph);

  function reduce(lines, availableHeight, paragraphs = []) {
    const maxLines = Math.round(availableHeight / lineHeight);
    const p = document.createElement("p");
    if (lines.length < 1) return paragraphs;
    if (lines.length < maxLines) {
      lines.forEach((line) => (p.innerHTML += `${line}`));

      paragraphs.push(p);
      return paragraphs;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (i === maxLines) {
        paragraphs.push(p);
        let newLines = lines.slice(i);

        reduce(newLines, maxHeight(), paragraphs);
        break;
      }

      p.innerHTML += `${line}`;
    }
    return paragraphs;
  }
  reduce(lines, availableHeight);

  // console.log(lines.length * lineHeight);
}

function addPageNumbers() {
  let MAXHEIGHT = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--page-height")
  );
  var totalPages = Math.ceil(document.body.scrollHeight / MAXHEIGHT); //842px A4 pageheight for 72dpi, 1123px A4 pageheight for 96dpi,
  console.log(totalPages);
  // for (var i = 0; i <= totalPages; i++) {
  //   if (i === 1) continue;
  //   var pageNumberDiv = document.createElement("div");
  //   var pageNumber = document.createTextNode(
  //     "Page " + i + " of " + totalPages
  //   );
  //   pageNumberDiv.style.position = "absolute";
  //   pageNumberDiv.style.top = `calc((${i} * (297mm - 0.5px)) - 40px)`; //297mm A4 pageheight; 0,5px unknown needed necessary correction value; additional wanted 40px margin from bottom(own element height included)
  //   pageNumberDiv.style.height = "16px";
  //   pageNumberDiv.appendChild(pageNumber);
  //   document.body.insertBefore(
  //     pageNumberDiv,
  //     document.getElementById("content")
  //   );
  //   pageNumberDiv.style.left =
  //     "calc(100% - (" + pageNumberDiv.offsetWidth + "px + 20px))";
  // }
}
function removePageNumbers() {
  document
    .querySelectorAll(".pagenumber")
    .forEach((element) => element.remove());
}
