const Header = (text, options) => {
  const header = document.createElement(`h${options?.level || 1}`);
  header.innerHTML = text;
  if (Array.isArray(options?.attributes))
    header.setAttribute(...options.attributes);
  if (options?.class) header.classList.add(options.class);
  if (options?.target) {
    document.querySelector(options.target).appendChild(header);
  }

  return header;
};
const Container = (blocks, options) => {
  const container = document.createElement(`${options?.tag || "div"}`);

  if (Array.isArray(options?.attributes)) {
    container.setAttribute(...options.attributes);
  }
  if (options?.class) container.classList.add(options.class);
  if (Array.isArray(blocks)) {
    blocks.forEach((block) => {
      if (block instanceof HTMLElement) {
        container.appendChild(block);
      }
    });
  } else if (blocks instanceof HTMLElement) {
    container.appendChild(blocks);
  }

  if (options?.target) {
    document.querySelector(options.target).appendChild(container);
  }

  return container;
};
const Image = (src, options) => {
  const wrapper = document.createElement("div");
  const image = document.createElement("img");
  image.src = src || "";
  image.alt = options?.alt || "";

  if (Array.isArray(options?.attributes)) {
    image.setAttribute(...options.attributes);
  }
  if (options?.class) wrapper.classList.add(options.class);

  wrapper.appendChild(image);
  if (options?.target) {
    document.querySelector(options.target).appendChild(wrapper);
  }

  return wrapper;
};
const create = ({ type, data }) => {
  const error = document.createElement("code");
  if (!type || !data) {
    error.appendChild(
      document.createTextNode(`${type} is a invalid Block Type`)
    );

    throw new Error();
  }
};
//Should be renamed to pdfBlock
class BlockJs {
  constructor(target) {
    this.target = target || document.querySelector("body");
    this.blocks = [];
  }
  add(blocks) {
    const content = document.querySelector(".content");
    
    if (Array.isArray(blocks)) {
      blocks.forEach((block) => {
        if (block instanceof HTMLElement) {
          this.target.appendChild(block);
        }
      });
    } else if (blocks instanceof HTMLElement) {
      this.target.appendChild(blocks);
    }
    return this;
  }
  header(blocks, options) {
    const header = document.querySelector("header");

    if (!header) return this;

    if (Array.isArray(blocks)) {
      blocks.forEach((block) => {
        if (block instanceof HTMLElement) {
          header.appendChild(block);
        }
      });
    } else if (blocks instanceof HTMLElement) {
      header.appendChild(blocks);
    }
  }

  footer(blocks) {}
}

export { Container, Image, BlockJs };
