import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export function renderMarkup(element: ReactElement) {
  return renderToStaticMarkup(element).replace(/\s+/g, " ").trim();
}
