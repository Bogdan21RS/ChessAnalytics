import getTopPlayerHistory from "../handlers/getTopPlayerHistory";
import { errorSchema } from "./generalSchemaObjects";
import { FastifyRequest, FastifyReply } from "fastify";
import { modeType } from "./generalTypes";

export const getTopPlayerHistorySchema = (
  lichessTopTenFromModeUrl: string,
  lichessRatingHistoryUrl: string
) => {
  return {
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
    handler: (
      request: FastifyRequest<{ Querystring: { top: number; mode: modeType } }>,
      reply: FastifyReply
    ) =>
      getTopPlayerHistory(
        request,
        reply,
        lichessTopTenFromModeUrl,
        lichessRatingHistoryUrl
      ),
  };
};
