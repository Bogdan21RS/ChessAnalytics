import getTopTenByMode from "../handlers/getTopTenByMode";

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
      400: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
      500: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
    },
  },
  handler: getTopTenByMode,
};
