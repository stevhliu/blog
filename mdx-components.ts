import { A as a } from "app/components/a";
import { P as p } from "app/components/p";
import { H1 as h1 } from "app/components/h1";
import { H2 as h2 } from "app/components/h2";
import { H3 as h3 } from "app/components/h3";
import { OL as ol } from "app/components/ol";
import { UL as ul } from "app/components/ul";
import { LI as li } from "app/components/li";
import { HR as hr } from "app/components/hr";
import { Code as code } from "app/components/code";
import { Tweet } from "app/components/tweet";
import { Image } from "app/components/image";
import { Figure } from "app/components/figure";
import { Snippet } from "app/components/snippet";
import { Caption } from "app/components/caption";
import { Callout, Tip, Warning } from "app/components/callout";
import { YouTube } from "app/components/youtube";
import { Ref, FootNotes, FootNote } from "app/components/footnotes";
import { Blockquote as blockquote } from "app/components/blockquote";
import { TOC } from "app/components/toc";
import { FloatingTOC } from "app/components/floating-toc";
import { HoverWord } from "app/components/hover-word";
import { Table } from "app/components/table";
import { Collapsible } from "app/components/collapsible";
import { AnimatedDashedLine } from "app/components/animated-dashed-line";
import { BlogCarousel as Carousel } from "app/components/carousel";

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
