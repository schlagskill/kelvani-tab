export const paths = {
  close: "M6 6l12 12M18 6 6 18",
  left: "M15 6l-6 6 6 6",
  right: "M9 6l6 6-6 6",
  folder:
    "M3 7V5a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18",
  book: "M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2V4Z",
  briefcase: "M8 6V4h8v2M3 6h18v14H3V6Zm0 6 9 3 9-3M10 12h4",
  spark: "m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z",
  plus: "M12 5v14M5 12h14",
  star: "m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1-5.6-2.9L6.4 20l1.1-6.1L3 9.5l6.2-.9L12 3Z",
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6",
  settings:
    "m10 3 4 0 .6 3 2 1 2.9-.9 2 3.5-2.2 2v2l2.2 2-2 3.5-2.9-.9-2 1-.6 3h-4l-.6-3-2-1-2.9.9-2-3.5 2.2-2v-2l-2.2-2 2-3.5 2.9.9 2-1L10 3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  expand: "M14 3h7v7m0-7-9 9M10 5H3v16h16v-7",
  edit: "m14 5 5 5M4 20l1-6L16 3l5 5-11 11-6 1Z",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  up: "m6 14 6-6 6 6",
  down: "m6 10 6 6 6-6",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
};
export function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("ui-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.75");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", paths[name] ?? paths.folder);
  svg.append(path);
  return svg;
}
