import type { ComponentType } from "react";
import dynamic from "next/dynamic";

import { A as a } from "./app/components/a";
import { P as p } from "./app/components/p";
import { H1 as h1 } from "./app/components/h1";
import { H2 as h2 } from "./app/components/h2";
import { H3 as h3 } from "./app/components/h3";
import { OL as ol } from "./app/components/ol";
import { UL as ul } from "./app/components/ul";
import { LI as li } from "./app/components/li";
import { HR as hr } from "./app/components/hr";
import { Code as code } from "./app/components/code";
import { Tweet } from "./app/components/tweet";
import { Image } from "./app/components/image";
import { Figure } from "./app/components/figure";
import { Snippet } from "./app/components/snippet";
import { Caption } from "./app/components/caption";
import { Callout, Tip, Warning } from "./app/components/callout";
import { Blockquote as blockquote } from "./app/components/blockquote";
import { CausalDiagram, MHADiagram, MQADiagram, GQADiagram, SelfAttentionDiagram, FlashAttentionDiagram, FAParallelismDiagram, FAWarpDiagram, FA3PipelineDiagram, FA3WGMMADiagram, FP8OutlierDiagram, IncoherentDiagram } from "./app/components/attention";
import { AsymmetricQuantizationDiagram, TensorParallelismDiagram, DeviceMapDiagram, BMIDiagram, FP32Diagram, FP16Diagram, Int8Diagram, KVCacheDiagram } from "./app/components/quantization";

// Lazy-load client components to reduce initial bundle size
const FloatingTOC = dynamic(
  () => import("./app/components/floating-toc").then(mod => mod.FloatingTOC),
  { ssr: true }
);

const HoverWord = dynamic(
  () => import("./app/components/hover-word").then(mod => mod.HoverWord),
  { ssr: true }
);

const Table = dynamic(
  () => import("./app/components/table").then(mod => mod.Table),
  { ssr: true }
);

const Collapsible = dynamic(
  () => import("./app/components/collapsible").then(mod => mod.Collapsible),
  { ssr: true }
);

export function useMDXComponents(components: {
  [component: string]: ComponentType;
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
    FloatingTOC,
    HoverWord,
    Table,
    Collapsible,
    CausalDiagram,
    MHADiagram,
    MQADiagram,
    GQADiagram,
    SelfAttentionDiagram,
    FlashAttentionDiagram,
    FAParallelismDiagram,
    FAWarpDiagram,
    FA3PipelineDiagram,
    FA3WGMMADiagram,
    FP8OutlierDiagram,
    IncoherentDiagram,
    AsymmetricQuantizationDiagram,
    TensorParallelismDiagram,
    DeviceMapDiagram,
    BMIDiagram,
    FP32Diagram,
    FP16Diagram,
    Int8Diagram,
    KVCacheDiagram,
  };
}
