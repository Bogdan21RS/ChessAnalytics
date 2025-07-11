export const getEnrichedUserSchema = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          profile: {
            type: "object",
            properties: {
              bio: { type: "string" },
              realName: { type: "string" },
              links: { type: "string" },
            },
          },
          playTime: {
            type: "object",
            properties: {
              total: { type: "number" },
              tv: { type: "number" },
            },
          },
          rank: { type: "number" },
          resultStreak: {
            type: "object",
            properties: {
              wins: {
                type: "object",
                properties: {
                  current: { type: "number" },
                  max: { type: "number" },
                },
              },
              losses: {
                type: "object",
                properties: {
                  current: { type: "number" },
                  max: { type: "number" },
                },
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
};
