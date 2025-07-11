import { FastifyInstance, FastifyPluginOptions } from "fastify";

import getTopTenByMode from "../handlers/getTopTenByMode";
import getUserById from "../handlers/getUserById";
import getEnrichedUser from "../handlers/getEnrichedUser";
import getTopPlayerHistory from "../handlers/getTopPlayerHistory";

import { getTopTenByModeSchema } from "../schemas/getTopTenByModeSchema";
import { getUserByIdSchema } from "../schemas/getUserByIdSchema";
import { getEnrichedUserSchema } from "../schemas/getEnrichedUserSchema";
import { getTopPlayerHistorySchema } from "../schemas/getTopPlayerHistorySchema";

export default function itemRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  // First endpoint
  const topTenEndpointUrl = "/chess/top10";
  fastify.get(topTenEndpointUrl, getTopTenByModeSchema);

  // Second endpont
  const userByIdEndpointUrl = "/chess/user";

  fastify.get(userByIdEndpointUrl, getUserByIdSchema);

  // Third endpont
  const enrichedUserEndpointUrl = "/chess/user/enriched";

  fastify.get(enrichedUserEndpointUrl, getEnrichedUserSchema);

  // Fourth endpoint
  const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";

  fastify.get(ratingHistoryEndpointUrl, getTopPlayerHistorySchema);

  done();
}
