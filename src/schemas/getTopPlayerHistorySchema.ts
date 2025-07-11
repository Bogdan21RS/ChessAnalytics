import getTopPlayerHistory from "../handlers/getTopPlayerHistory";
import { errorSchema } from "./generalSchemaObjects";

export const getTopPlayerHistorySchema = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          username: { type: "string" },
          history: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                rating: { type: "number" },
              },
            },
          },
        },
      },
      400: errorSchema,
      500: errorSchema,
    },
  },
  handler: getTopPlayerHistory,
};
