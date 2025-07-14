import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { getTopTenByModeSchema } from "../schemas/getTopTenByModeSchema";
import { getUserByIdSchema } from "../schemas/getUserByIdSchema";
import { getEnrichedUserSchema } from "../schemas/getEnrichedUserSchema";
import { getTopPlayerHistorySchema } from "../schemas/getTopPlayerHistorySchema";

export default function itemRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  const topTenEndpointUrl = "/chess/top10";
  fastify.get(topTenEndpointUrl, getTopTenByModeSchema);

  const userByIdEndpointUrl = "/chess/user";
  fastify.get(userByIdEndpointUrl, getUserByIdSchema);

  const enrichedUserEndpointUrl = "/chess/user/enriched";
  fastify.get(enrichedUserEndpointUrl, getEnrichedUserSchema);

  const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";
  fastify.get(ratingHistoryEndpointUrl, getTopPlayerHistorySchema);

  done();
}
