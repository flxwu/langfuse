import { executeQuery } from "@/src/server/api/services/query-builder";
import { type PrismaClient } from "@prisma/client";

export const getTokenCostForUser = async (
  prisma: PrismaClient,
  {
    projectId,
    observationId,
  }: {
    projectId: string;
    observationId: string;
  },
) => {
  const queryResult = await executeQuery(prisma, projectId, {
    from: "traces_observations",
    select: [{ column: "totalTokenCost" }, { column: "user" }],
    // TODO: Ability to get token cost based custom filter (e.g. timeframe)
    filter: [
      // Filter for this observation's trace's user
      {
        type: "string" as const,
        column: "user",
        operator: "=",
        value: `(SELECT t.user_id FROM traces t
                JOIN observations o ON t.id = o.trace_id
                WHERE o.id = '${observationId}'
                LIMIT 1)`,
        valueIsRawSQL: true,
      },
    ],
  });

  if (queryResult.length === 0) {
    throw new Error("No traces_observations found for this observation");
  }

  const totalTokenCost = queryResult[0]?.totalTokenCost;
  return totalTokenCost as number;
};
