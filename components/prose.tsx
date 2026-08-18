/**
 * Renders a translated body string as one or more paragraphs.
 *
 * The copy is authored in a spreadsheet, where a writer separates paragraphs
 * with a line break. A bare {t('key')} inside a single <p> collapses those
 * breaks to a space, silently running the paragraphs together. Splitting here
 * keeps the break the writer typed without the catalog needing a different
 * shape per string, so the spreadsheet stays an exact map of the catalog.
 */
export function Prose({
  text,
  className,
  spacing = 'mt-3',
}: {
  text: string;
  className?: string;
  /** Gap between paragraphs after the first. */
  spacing?: string;
}) {
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={i === 0 ? className : `${className ?? ''} ${spacing}`}>
          {paragraph}
        </p>
      ))}
    </>
  );
}
