import getEnrichedUser from "../handlers/getEnrichedUser";
import { errorSchema } from "./generalSchemaObjects";
import { FastifyRequest, FastifyReply } from "fastify";
import { modeType } from "./generalTypes";

export const getEnrichedUserSchema = (
  lichessUserByIdUrl: string,
  lichessUserPerformanceUrl: string
) => {
  return {
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
            rank: { type: ["number", "null"] },
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
        400: errorSchema,
        500: errorSchema,
      },
    },
    handler: (
      request: FastifyRequest<{ Querystring: { id: string; mode: modeType } }>,
      reply: FastifyReply
    ) =>
      getEnrichedUser(
        request,
        reply,
        lichessUserByIdUrl,
        lichessUserPerformanceUrl
      ),
  };
};
