import getTopTenByMode from "../handlers/getTopTenByMode";
import { errorSchema } from "./generalSchemaObjects";

export const getTopTenByModeSchema = {
  schema: {
    response: {
      200: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              username: { type: "string" },
              modes: {
                type: "object",
                additionalProperties: {
                  type: "object",
                  properties: {
                    rating: { type: "number" },
                    progress: { type: "number" },
                  },
                  required: ["rating", "progress"],
                },
              },
            },
            required: ["id", "username", "modes"],
          },
        },
      },
      400: errorSchema,
      500: errorSchema,
    },
  },
  handler: getTopTenByMode,
};
