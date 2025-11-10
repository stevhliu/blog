import { A as a } from "app/(post)/components/a";
import { P as p } from "app/(post)/components/p";
import { H1 as h1 } from "app/(post)/components/h1";
import { H2 as h2 } from "app/(post)/components/h2";
import { H3 as h3 } from "app/(post)/components/h3";
import { OL as ol } from "app/(post)/components/ol";
import { UL as ul } from "app/(post)/components/ul";
import { LI as li } from "app/(post)/components/li";
import { HR as hr } from "app/(post)/components/hr";
import { Code as code } from "app/(post)/components/code";
import { Tweet } from "app/(post)/components/tweet";
import { Image } from "app/(post)/components/image";
import { Figure } from "app/(post)/components/figure";
import { Snippet } from "app/(post)/components/snippet";
import { Caption } from "app/(post)/components/caption";
import { Callout, Tip, Warning } from "app/(post)/components/callout";
import { YouTube } from "app/(post)/components/youtube";
import { Ref, FootNotes, FootNote } from "app/(post)/components/footnotes";
import { Blockquote as blockquote } from "app/(post)/components/blockquote";
import { TOC } from "app/(post)/components/toc";
import { FloatingTOC } from "app/(post)/components/floating-toc";
import { HoverWord } from "app/(post)/components/hover-word";
import { Table } from "app/(post)/components/table";
import { Collapsible } from "app/(post)/components/collapsible";
import { AnimatedDashedLine } from "app/(post)/components/animated-dashed-line";
import { BlogCarousel as Carousel } from "app/(post)/components/carousel";

export function useMDXComponents(components: {
  [component: string]: React.ComponentType;
}) {
  return {
    ...components,
    a,
    h1,
    h2,
    h3,
    p,
    ol,
    ul,
    li,
    hr,
    code,
    pre: Snippet,
    img: Image,
    blockquote,
    Tweet,
    Image,
    Figure,
    Snippet,
    Caption,
    Callout,
    Tip,
    Warning,
    YouTube,
    Ref,
    FootNotes,
    FootNote,
    TOC,
    FloatingTOC,
    HoverWord,
    Table,
    Collapsible,
    AnimatedDashedLine,
    Carousel,
  };
}
