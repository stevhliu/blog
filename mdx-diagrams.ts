import { CausalDiagram } from "./app/components/attention/causal-diagram";
import { MHADiagram } from "./app/components/attention/mha-diagram";
import { MQADiagram } from "./app/components/attention/mqa-diagram";
import { GQADiagram } from "./app/components/attention/gqa-diagram";
import { SelfAttentionDiagram } from "./app/components/attention/self-attention-diagram";
import { FlashAttentionDiagram } from "./app/components/attention/flash-attention-diagram";
import { FAParallelismDiagram } from "./app/components/attention/fa-parallelism-diagram";
import { FAWarpDiagram } from "./app/components/attention/fa-warp-diagram";
import { FA3PipelineDiagram } from "./app/components/attention/fa3-pipeline-diagram";
import { FA3WGMMADiagram } from "./app/components/attention/fa3-wgmma-diagram";
import { FP8OutlierDiagram } from "./app/components/attention/fp8-outlier-diagram";
import { IncoherentDiagram } from "./app/components/attention/incoherent-diagram";
import { MLADiagram } from "./app/components/attention/mla-diagram";
import { MLAAbsorbDiagram } from "./app/components/attention/mla-wcombined-diagram";
import { MLARoPEDiagram } from "./app/components/attention/mla-rope-diagram";
import { MLADecoupleDiagram } from "./app/components/attention/mla-decouple-diagram";
import { AsymmetricQuantizationDiagram } from "./app/components/quantization/asymmetric-quantization-diagram";
import { TensorParallelismDiagram } from "./app/components/quantization/tensor-parallelism-diagram";
import { DeviceMapDiagram } from "./app/components/quantization/device-map-diagram";
import { BMIDiagram } from "./app/components/quantization/bmi-diagram";
import { FP32Diagram } from "./app/components/quantization/fp32-diagram";
import { FP16Diagram } from "./app/components/quantization/fp16-diagram";
import { Int8Diagram } from "./app/components/quantization/int8-diagram";
import { KVCacheDiagram } from "./app/components/quantization/kv-cache-diagram";
import { GilTimelineDiagram } from "./app/components/transformers/gil-timeline-diagram";
import { MmapLazyReadDiagram } from "./app/components/transformers/mmap-lazy-read-diagram";
import { CudaAllocatorDiagram } from "./app/components/transformers/cuda-allocator-diagram";
import { MetaDeviceDiagram } from "./app/components/transformers/meta-device-diagram";
import { SafetensorSliceDiagram } from "./app/components/transformers/safetensor-slice-diagram";
import { ConversionBucketsDiagram } from "./app/components/transformers/conversion-buckets-diagram";
import { AsyncVsSyncDiagram } from "./app/components/transformers/async-vs-sync-diagram";
import { DiskOffloadDiagram } from "./app/components/transformers/disk-offload-diagram";
import { WorkersVsLoadTimeChart } from "./app/components/transformers/workers-vs-load-time-chart";
import { MoEModelsOverTimeChart } from "./app/components/transformers/moe-models-over-time-chart";
import {
  MixtralConversionDiagram,
  Qwen2ConversionDiagram,
  Qwen3VLConversionDiagram,
  DeepSeekV3ConversionDiagram,
} from "./app/components/transformers/conversion-pipeline-diagrams";

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
  GilTimelineDiagram,
  MetaDeviceDiagram,
  SafetensorSliceDiagram,
  ConversionBucketsDiagram,
  AsyncVsSyncDiagram,
  DiskOffloadDiagram,
  MmapLazyReadDiagram,
  CudaAllocatorDiagram,
  WorkersVsLoadTimeChart,
  MoEModelsOverTimeChart,
  MixtralConversionDiagram,
  Qwen2ConversionDiagram,
  Qwen3VLConversionDiagram,
  DeepSeekV3ConversionDiagram,
};
