import getTopPlayerHistory from "../handlers/getTopPlayerHistory";

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
  handler: getTopPlayerHistory,
};
