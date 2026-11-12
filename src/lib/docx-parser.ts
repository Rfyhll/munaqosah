"use client";

import mammoth from "mammoth";

/**
 * Parse a .docx file and return its rendered HTML content.
 *
 * The HTML is what mammoth extracts from the Word file - it includes
 * headings, paragraphs, tables, lists, bold/italic, etc.
 *
 * The caller is responsible for styling/sanitizing the HTML before
 * injecting it into the DOM.
 */
export async function parseDocxToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      // Map common Word styles to semantic HTML.
      styleMap: [
        "p[style-name='Title'] => h1.doc-title:fresh",
        "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "table => table:fresh",
      ],
    },
  );
  return result.value || "";
}
