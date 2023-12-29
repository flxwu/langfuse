import { z } from "zod";

import {
  createTRPCRouter,
  protectedProjectProcedure,
} from "@/src/server/api/trpc";
import { paginationZod } from "@/src/utils/zod";

const AlertFilterOptions = z.object({
  projectId: z.string(), // Required for protectedProjectProcedure
  ...paginationZod,
});

const AlertCreateOptions = z.object({
  projectId: z.string(),
  name: z.string(),
  alertMetric: z.enum(["COST_PER_USER"]),
  alertThreshold: z.number(),
  triggerWebhookUrl: z
    .string()
    .trim()
    .url()
    .regex(/^https?:\/\//, {
      message: "URL must start with http:// or https://",
    }),
});

export const alertsRouter = createTRPCRouter({
  all: protectedProjectProcedure
    .input(AlertFilterOptions)
    .query(async ({ input, ctx }) => {
      const alerts = await ctx.prisma.alert.findMany({
        where: {
          projectId: input.projectId,
        },
      });

      return alerts;
    }),
  createAlert: protectedProjectProcedure
    .input(AlertCreateOptions)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.alert.create({
        data: {
          name: input.name,
          projectId: input.projectId,
          alertMetric: input.alertMetric,
          alertThreshold: input.alertThreshold,
          triggerWebhookUrl: input.triggerWebhookUrl,
        },
      });
    }),
});
