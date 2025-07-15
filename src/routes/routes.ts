import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { getTopTenByModeSchema } from "../schemas/getTopTenByModeSchema";
import { getUserByIdSchema } from "../schemas/getUserByIdSchema";
import { getEnrichedUserSchema } from "../schemas/getEnrichedUserSchema";
import { getTopPlayerHistorySchema } from "../schemas/getTopPlayerHistorySchema";

export const topTenEndpointUrl = "/chess/top10";
export const userByIdEndpointUrl = "/chess/user";
export const enrichedUserEndpointUrl = "/chess/user/enriched";
export const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";

const lichessTopTenUrl = "https://lichess.org/api/player";
const lichessUserByIdUrl = "https://lichess.org/api/user/{id}";
const lichessUserPerformanceUrl =
  "https://lichess.org/api/user/{username}/perf/{mode}";
const lichessRatingHistoryUrl =
  "https://lichess.org/api/user/{username}/rating-history";
const lichessTopTenFromModeUrl = "https://lichess.org/api/player/top/10/{mode}";

export default function itemRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  fastify.get(topTenEndpointUrl, getTopTenByModeSchema(lichessTopTenUrl));
  fastify.get(userByIdEndpointUrl, getUserByIdSchema(lichessUserByIdUrl));
  fastify.get(
    enrichedUserEndpointUrl,
    getEnrichedUserSchema(lichessUserByIdUrl, lichessUserPerformanceUrl)
  );
  fastify.get(
    ratingHistoryEndpointUrl,
    getTopPlayerHistorySchema(lichessTopTenFromModeUrl, lichessRatingHistoryUrl)
  );

  done();
}
