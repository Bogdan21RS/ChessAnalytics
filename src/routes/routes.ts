import { FastifyInstance, FastifyPluginOptions } from "fastify";
import getTopTenByMode from "../handlers/getTopTenByMode";
import getUserById from "../handlers/getUserById";
import getEnrichedUser from "../handlers/getEnrichedUser";
import getTopPlayerHistory from "../handlers/getTopPlayerHistory";

export default function itemRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  // First endpoint
  const topTenEndpointUrl = "/chess/top10";
  fastify.get(topTenEndpointUrl, getTopTenByMode);

  // Second endpont
  const userByIdEndpointUrl = "/chess/user";

  fastify.get(userByIdEndpointUrl, getUserById);

  // Third endpont
  const enrichedUserEndpointUrl = "/chess/user/enriched";

  fastify.get(enrichedUserEndpointUrl, getEnrichedUser);

  // Fourth endpoint
  const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";

  fastify.get(ratingHistoryEndpointUrl, getTopPlayerHistory);

  done();
}
