import { profile } from "console";

export const getUserByIdSchema = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          modes: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                games: { type: "number" },
                rating: { type: "number" },
                rd: { type: "number" },
                prog: { type: "number" },
                prov: { type: "boolean" },
              },
            },
          },
          flair: { type: "string" },
          patron: { type: "boolean" },
          verified: { type: "boolean" },
          createdAt: { type: "number" },
          profile: {
            type: "object",
            properties: {
              bio: { type: "string" },
              realName: { type: "string" },
              links: { type: "string" },
            },
          },
          seenAt: { type: "number" },
          playTime: {
            type: "object",
            properties: {
              total: { type: "number" },
              tv: { type: "number" },
            },
          },
        },
        required: ["id", "username"],
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
};
