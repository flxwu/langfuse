import { ObservationLevel } from "@prisma/client";
import { jsonSchema } from "@/src/utils/zod";
import { z } from "zod";
import lodash from "lodash";

export const Usage = z.object({
  input: z.number().int().nullish(),
  output: z.number().int().nullish(),
  total: z.number().int().nullish(),
  unit: z.enum(["TOKENS", "CHARACTERS"]).nullable(),
});

const MixedUsage = z.object({
  input: z.number().int().nullish(),
  output: z.number().int().nullish(),
  total: z.number().int().nullish(),
  unit: z.enum(["TOKENS", "CHARACTERS"]).nullish(),
  promptTokens: z.number().int().nullish(),
  completionTokens: z.number().int().nullish(),
  totalTokens: z.number().int().nullish(),
});

export const usage = MixedUsage.nullish()
  // transform mixed usage model input to new one
  .transform((v) => {
    if (!v) {
      return null;
    }
    if ("promptTokens" in v || "completionTokens" in v || "totalTokens" in v) {
      return {
        input: v.promptTokens,
        output: v.completionTokens,
        total: v.totalTokens,
        unit: "TOKENS",
      };
    }
    if ("input" in v || "output" in v || "total" in v || "unit" in v) {
      const unit = v.unit ?? "TOKENS";
      return { ...v, unit };
    }

    if (lodash.isEmpty(v)) {
      return { unit: "TOKENS" };
    }
  })
  // ensure output is always of new usage model
  .pipe(Usage.nullable());

export const TraceBody = z.object({
  id: z.string().nullish(),
  name: z.string().nullish(),
  externalId: z.string().nullish(),
  input: jsonSchema.nullish(),
  output: jsonSchema.nullish(),
  sessionId: z.string().nullish(),
  userId: z.string().nullish(),
  metadata: jsonSchema.nullish(),
  release: z.string().nullish(),
  version: z.string().nullish(),
  public: z.boolean().nullish(),
});

export const OptionalObservationBody = z.object({
  traceId: z.string().nullish(),
  name: z.string().nullish(),
  startTime: z.string().datetime({ offset: true }).nullish(),
  metadata: jsonSchema.nullish(),
  input: jsonSchema.nullish(),
  output: jsonSchema.nullish(),
  level: z.nativeEnum(ObservationLevel).nullish(),
  statusMessage: z.string().nullish(),
  parentObservationId: z.string().nullish(),
  version: z.string().nullish(),
});

export const CreateEventEvent = OptionalObservationBody.extend({
  id: z.string().nullish(),
});

export const UpdateEventEvent = OptionalObservationBody.extend({
  id: z.string(),
});

export const CreateSpanBody = CreateEventEvent.extend({
  endTime: z.string().datetime({ offset: true }).nullish(),
});

export const UpdateSpanBody = UpdateEventEvent.extend({
  endTime: z.string().datetime({ offset: true }).nullish(),
});

export const CreateGenerationBody = CreateSpanBody.extend({
  completionStartTime: z.string().datetime({ offset: true }).nullish(),
  model: z.string().nullish(),
  modelParameters: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()]).nullish(),
    )
    .nullish(),
  usage: usage,
});

export const UpdateGenerationBody = UpdateSpanBody.extend({
  completionStartTime: z.string().datetime({ offset: true }).nullish(),
  model: z.string().nullish(),
  modelParameters: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()]).nullish(),
    )
    .nullish(),
  usage: usage,
});

export const ScoreBody = z.object({
  id: z.string().nullish(),
  name: z.string(),
  value: z.number(),
  traceId: z.string(),
  observationId: z.string().nullish(),
  comment: z.string().nullish(),
});

// LEGACY, only required for backwards compatibility
export const LegacySpanPostSchema = z.object({
  id: z.string().nullish(),
  traceId: z.string().nullish(),
  name: z.string().nullish(),
  startTime: z.string().datetime({ offset: true }).nullish(),
  endTime: z.string().datetime({ offset: true }).nullish(),
  metadata: jsonSchema.nullish(),
  input: jsonSchema.nullish(),
  output: jsonSchema.nullish(),
  parentObservationId: z.string().nullish(),
  level: z.nativeEnum(ObservationLevel).nullish(),
  statusMessage: z.string().nullish(),
  version: z.string().nullish(),
});

export const LegacySpanPatchSchema = z.object({
  spanId: z.string(),
  traceId: z.string().nullish(),
  name: z.string().nullish(),
  startTime: z.string().datetime({ offset: true }).nullish(),
  endTime: z.string().datetime({ offset: true }).nullish(),
  metadata: jsonSchema.nullish(),
  input: jsonSchema.nullish(),
  output: jsonSchema.nullish(),
  level: z.nativeEnum(ObservationLevel).nullish(),
  statusMessage: z.string().nullish(),
  version: z.string().nullish(),
});

export const LegacyGenerationsCreateSchema = z.object({
  id: z.string().nullish(),
  traceId: z.string().nullish(),
  name: z.string().nullish(),
  startTime: z.string().datetime({ offset: true }).nullish(),
  endTime: z.string().datetime({ offset: true }).nullish(),
  completionStartTime: z.string().datetime({ offset: true }).nullish(),
  model: z.string().nullish(),
  modelParameters: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()]).nullish(),
    )
    .nullish(),
  prompt: jsonSchema.nullish(),
  completion: jsonSchema.nullish(),
  usage: usage,
  metadata: jsonSchema.nullish(),
  parentObservationId: z.string().nullish(),
  level: z.nativeEnum(ObservationLevel).nullish(),
  statusMessage: z.string().nullish(),
  version: z.string().nullish(),
});

export const LegacyGenerationPatchSchema = z.object({
  generationId: z.string(),
  traceId: z.string().nullish(),
  name: z.string().nullish(),
  startTime: z.string().datetime({ offset: true }).nullish(),
  endTime: z.string().datetime({ offset: true }).nullish(),
  completionStartTime: z.string().datetime({ offset: true }).nullish(),
  model: z.string().nullish(),
  modelParameters: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()]).nullish(),
    )
    .nullish(),
  prompt: jsonSchema.nullish(),
  completion: jsonSchema.nullish(),
  usage: usage,
  metadata: jsonSchema.nullish(),
  level: z.nativeEnum(ObservationLevel).nullish(),
  statusMessage: z.string().nullish(),
  version: z.string().nullish(),
});

export const LegacyObservationBody = z.object({
  id: z.string().nullish(),
  traceId: z.string().nullish(),
  type: z.enum(["GENERATION", "SPAN", "EVENT"]),
  name: z.string().nullish(),
  startTime: z.string().datetime({ offset: true }).nullish(),
  endTime: z.string().datetime({ offset: true }).nullish(),
  completionStartTime: z.string().datetime({ offset: true }).nullish(),
  model: z.string().nullish(),
  modelParameters: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()]).nullish(),
    )
    .nullish(),
  input: jsonSchema.nullish(),
  output: jsonSchema.nullish(),
  usage: usage,
  metadata: jsonSchema.nullish(),
  parentObservationId: z.string().nullish(),
  level: z.nativeEnum(ObservationLevel).nullish(),
  statusMessage: z.string().nullish(),
  version: z.string().nullish(),
});

export const SdkLogEvent = z.object({
  log: jsonSchema,
});

// definitions for the ingestion API

export const eventTypes = {
  TRACE_CREATE: "trace-create",
  SCORE_CREATE: "score-create",
  EVENT_CREATE: "event-create",
  SPAN_CREATE: "span-create",
  SPAN_UPDATE: "span-update",
  GENERATION_CREATE: "generation-create",
  GENERATION_UPDATE: "generation-update",
  SDK_LOG: "sdk-log",

  // LEGACY, only required for backwards compatibility
  OBSERVATION_CREATE: "observation-create",
  OBSERVATION_UPDATE: "observation-update",
} as const;

const base = z.object({
  id: z.string(),
  timestamp: z.string().datetime({ offset: true }),
  metadata: jsonSchema.nullish(),
});
export const traceEvent = base.extend({
  type: z.literal(eventTypes.TRACE_CREATE),
  body: TraceBody,
});

export const eventCreateEvent = base.extend({
  type: z.literal(eventTypes.EVENT_CREATE),
  body: CreateEventEvent,
});
export const spanCreateEvent = base.extend({
  type: z.literal(eventTypes.SPAN_CREATE),
  body: CreateSpanBody,
});
export const spanUpdateEvent = base.extend({
  type: z.literal(eventTypes.SPAN_UPDATE),
  body: UpdateSpanBody,
});
export const generationCreateEvent = base.extend({
  type: z.literal(eventTypes.GENERATION_CREATE),
  body: CreateGenerationBody,
});
export const generationUpdateEvent = base.extend({
  type: z.literal(eventTypes.GENERATION_UPDATE),
  body: UpdateGenerationBody,
});
export const scoreEvent = base.extend({
  type: z.literal(eventTypes.SCORE_CREATE),
  body: ScoreBody,
});
export const sdkLogEvent = base.extend({
  type: z.literal(eventTypes.SDK_LOG),
  body: SdkLogEvent,
});
export const legacyObservationCreateEvent = base.extend({
  type: z.literal(eventTypes.OBSERVATION_CREATE),
  body: LegacyObservationBody,
});
export const legacyObservationUpdateEvent = base.extend({
  type: z.literal(eventTypes.OBSERVATION_UPDATE),
  body: LegacyObservationBody,
});

export const ingestionEvent = z.discriminatedUnion("type", [
  traceEvent,
  scoreEvent,
  eventCreateEvent,
  spanCreateEvent,
  spanUpdateEvent,
  generationCreateEvent,
  generationUpdateEvent,
  sdkLogEvent,
  // LEGACY, only required for backwards compatibility
  legacyObservationCreateEvent,
  legacyObservationUpdateEvent,
]);

export const ingestionBatchEvent = z.array(ingestionEvent);

export const ingestionApiSchema = z.object({
  batch: ingestionBatchEvent,
  metadata: jsonSchema.nullish(),
});
