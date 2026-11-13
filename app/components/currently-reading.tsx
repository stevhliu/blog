import { Book3D, type Book } from "./book-3d";

/**
 * "What I'm reading" for the home page, under the coffee: the book in 3D,
 * in the same viewer as the pouch (Book3D, built on SkyLitModel). To
 * change the book, update the values below. The images are optional; put
 * them in public/images (about 1500px tall is plenty) and set `cover`,
 * `spine` and `back`, or leave any out and Book3D draws a stand-in. Each is
 * cropped to its face, so a loose crop is fine. Trim sizes are on the
 * publisher's page, in millimetres; `color` is the cover's background,
 * used for the stand-ins and the card's edge on the pages.
 *
 * Prelude to Foundation is the Del Rey mass-market paperback (ISBN-13
 * 978-0-553-27839-2, from the barcode): the standard 4¼ × 6⅞ inch trim, and
 * 26mm thick, measured from the spine photo (the spine is 0.149 of the
 * height). The cover is the publisher's scan, a little wider than that
 * trim, so its sides are cropped. The spine and back are phone photos,
 * flattened with a perspective warp. The back's card curled off the table,
 * so its print still tilted and bowed inside the squared outline, one way
 * through the blurb (lines up to 19px out of level) and the other way in
 * the bottom-left corner. Every text line and rule on the page was tracked
 * and one smooth surface fitted through all of them (a region corrected
 * from lines elsewhere on the page comes out tilted), then the photo was
 * remapped so every line is level, the justified paragraph's edges are
 * vertical, and the block is centred. A light to the right left
 * a glare patch on the back's right side; it was measured on the text
 * panel (the only uniform ground, since the dot pattern varies by design)
 * and subtracted in linear light, as reflected light adds there. Both were
 * then graded to the cover scan: their
 * lightness histogram over text-free patches of the dot pattern matched to
 * the scan's (so the dots' coverage and brightness agree, which is what
 * the eye reads at this size), the pattern's hue shifted to the scan's, and
 * text lifted to the scan's white. On the glossy spine the dots photograph
 * as bright as the lettering, so its lettering is picked out by shape
 * (bright regions much larger than a dot) and graded separately.
 */
const BOOK: Book = {
  title: "Prelude to Foundation",
  author: "Isaac Asimov",
  cover: "/images/prelude-to-foundation.webp",
  spine: "/images/prelude-to-foundation-spine.webp",
  back: "/images/prelude-to-foundation-back.webp",
  width: 106,
  height: 175,
  thickness: 26,
  color: "#0b131d",
  ink: "#f2f4f7",
};
// Amazon's product pages for books are keyed by ISBN-10; this is the
// mass-market edition's.
const LINK = "https://www.amazon.com/dp/0553278398";
const ALT = `The book ${BOOK.title} by ${BOOK.author}. Drag to turn it; click it, then scroll to zoom in.`;

export function CurrentlyReading() {
  return (
    <section aria-labelledby="reading-heading" className="flex w-[300px] max-w-full flex-col gap-4">
      <Book3D book={BOOK} alt={ALT} className="drink-model" />
      <div className="text-center text-[18px] leading-[1.5] text-[var(--color-text)]">
        <h2 id="reading-heading" className="m-0 inline text-[18px] font-normal opacity-70">
          What&rsquo;s on the nightstand?
        </h2>{" "}
        <a href={LINK} target="_blank" rel="noopener noreferrer" className="nav-link no-underline text-inherit">
          {BOOK.title}
        </a>
      </div>
    </section>
  );
}
