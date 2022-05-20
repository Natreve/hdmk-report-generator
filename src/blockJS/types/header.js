const Header = (text, options) => {
  const header = document.createElement(`h${options.level || 1}`);
  header.innerHTML = text;
  if (Array.is(options.attributes)) header.setAttribute(...options.attributes);
  if (options.class) header.classList.add(options.class);
  console.log(header.getBoundingClientRect());
  return header;
};
export { Header}