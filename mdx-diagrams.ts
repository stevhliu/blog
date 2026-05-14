import dynamic from "next/dynamic";

const CausalDiagram = dynamic(
  () => import("./app/components/attention/causal-diagram").then(mod => mod.CausalDiagram),
  { ssr: true }
);
const MHADiagram = dynamic(
  () => import("./app/components/attention/mha-diagram").then(mod => mod.MHADiagram),
  { ssr: true }
);
const MQADiagram = dynamic(
  () => import("./app/components/attention/mqa-diagram").then(mod => mod.MQADiagram),
  { ssr: true }
);
const GQADiagram = dynamic(
  () => import("./app/components/attention/gqa-diagram").then(mod => mod.GQADiagram),
  { ssr: true }
);
const SelfAttentionDiagram = dynamic(
  () => import("./app/components/attention/self-attention-diagram").then(mod => mod.SelfAttentionDiagram),
  { ssr: true }
);
const FlashAttentionDiagram = dynamic(
  () => import("./app/components/attention/flash-attention-diagram").then(mod => mod.FlashAttentionDiagram),
  { ssr: true }
);
const FAParallelismDiagram = dynamic(
  () => import("./app/components/attention/fa-parallelism-diagram").then(mod => mod.FAParallelismDiagram),
  { ssr: true }
);
const FAWarpDiagram = dynamic(
  () => import("./app/components/attention/fa-warp-diagram").then(mod => mod.FAWarpDiagram),
  { ssr: true }
);
const FA3PipelineDiagram = dynamic(
  () => import("./app/components/attention/fa3-pipeline-diagram").then(mod => mod.FA3PipelineDiagram),
  { ssr: true }
);
const FA3WGMMADiagram = dynamic(
  () => import("./app/components/attention/fa3-wgmma-diagram").then(mod => mod.FA3WGMMADiagram),
  { ssr: true }
);
const FP8OutlierDiagram = dynamic(
  () => import("./app/components/attention/fp8-outlier-diagram").then(mod => mod.FP8OutlierDiagram),
  { ssr: true }
);
const IncoherentDiagram = dynamic(
  () => import("./app/components/attention/incoherent-diagram").then(mod => mod.IncoherentDiagram),
  { ssr: true }
);
const MLADiagram = dynamic(
  () => import("./app/components/attention/mla-diagram").then(mod => mod.MLADiagram),
  { ssr: true }
);
const MLAAbsorbDiagram = dynamic(
  () => import("./app/components/attention/mla-wcombined-diagram").then(mod => mod.MLAAbsorbDiagram),
  { ssr: true }
);
const MLARoPEDiagram = dynamic(
  () => import("./app/components/attention/mla-rope-diagram").then(mod => mod.MLARoPEDiagram),
  { ssr: true }
);
const MLADecoupleDiagram = dynamic(
  () => import("./app/components/attention/mla-decouple-diagram").then(mod => mod.MLADecoupleDiagram),
  { ssr: true }
);

const AsymmetricQuantizationDiagram = dynamic(
  () => import("./app/components/quantization/asymmetric-quantization-diagram").then(mod => mod.AsymmetricQuantizationDiagram),
  { ssr: true }
);
const TensorParallelismDiagram = dynamic(
  () => import("./app/components/quantization/tensor-parallelism-diagram").then(mod => mod.TensorParallelismDiagram),
  { ssr: true }
);
const DeviceMapDiagram = dynamic(
  () => import("./app/components/quantization/device-map-diagram").then(mod => mod.DeviceMapDiagram),
  { ssr: true }
);
const BMIDiagram = dynamic(
  () => import("./app/components/quantization/bmi-diagram").then(mod => mod.BMIDiagram),
  { ssr: true }
);
const FP32Diagram = dynamic(
  () => import("./app/components/quantization/fp32-diagram").then(mod => mod.FP32Diagram),
  { ssr: true }
);
const FP16Diagram = dynamic(
  () => import("./app/components/quantization/fp16-diagram").then(mod => mod.FP16Diagram),
  { ssr: true }
);
const Int8Diagram = dynamic(
  () => import("./app/components/quantization/int8-diagram").then(mod => mod.Int8Diagram),
  { ssr: true }
);
const KVCacheDiagram = dynamic(
  () => import("./app/components/quantization/kv-cache-diagram").then(mod => mod.KVCacheDiagram),
  { ssr: true }
);
const SyncAsyncLoadingDiagram = dynamic(
  () => import("./app/components/transformers/sync-async-loading-diagram").then(mod => mod.SyncAsyncLoadingDiagram),
  { ssr: true }
);
const CudaAllocatorDiagram = dynamic(
  () => import("./app/components/transformers/cuda-allocator-diagram").then(mod => mod.CudaAllocatorDiagram),
  { ssr: true }
);
const WorkersVsLoadTimeChart = dynamic(
  () => import("./app/components/transformers/workers-vs-load-time-chart").then(mod => mod.WorkersVsLoadTimeChart),
  { ssr: true }
);

export const diagramComponents = {
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
  MLADiagram,
  MLAAbsorbDiagram,
  MLARoPEDiagram,
  MLADecoupleDiagram,
  AsymmetricQuantizationDiagram,
  TensorParallelismDiagram,
  DeviceMapDiagram,
  BMIDiagram,
  FP32Diagram,
  FP16Diagram,
  Int8Diagram,
  KVCacheDiagram,
  SyncAsyncLoadingDiagram,
  CudaAllocatorDiagram,
  WorkersVsLoadTimeChart,
};
