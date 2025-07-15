import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { getTopTenByModeSchema } from "../schemas/getTopTenByModeSchema";
import { getUserByIdSchema } from "../schemas/getUserByIdSchema";
import { getEnrichedUserSchema } from "../schemas/getEnrichedUserSchema";
import { getTopPlayerHistorySchema } from "../schemas/getTopPlayerHistorySchema";

export const topTenEndpointUrl = "/chess/top10";
export const userByIdEndpointUrl = "/chess/user";
export const enrichedUserEndpointUrl = "/chess/user/enriched";
export const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";

export default function itemRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  fastify.get(topTenEndpointUrl, getTopTenByModeSchema);
  fastify.get(userByIdEndpointUrl, getUserByIdSchema);
  fastify.get(enrichedUserEndpointUrl, getEnrichedUserSchema);
  fastify.get(ratingHistoryEndpointUrl, getTopPlayerHistorySchema);

  done();
}
