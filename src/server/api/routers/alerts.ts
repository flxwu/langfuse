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
});
