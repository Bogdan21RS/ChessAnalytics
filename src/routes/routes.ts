import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { getTopTenByModeSchema } from "../schemas/getTopTenByModeSchema";
import { getUserByIdSchema } from "../schemas/getUserByIdSchema";
import { getEnrichedUserSchema } from "../schemas/getEnrichedUserSchema";
import { getTopPlayerHistorySchema } from "../schemas/getTopPlayerHistorySchema";

export const topTenEndpointUrl = "/chess/top10";
export const userByIdEndpointUrl = "/chess/user";
export const enrichedUserEndpointUrl = "/chess/user/enriched";
export const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";

export const lichessBaseUrl = "https://lichess.org/api";

export const lichessTopTenEndpoint = "/player";
export const lichessUserByIdEndpoint = "/user/{id}";
export const lichessUserPerformanceEndpoint = "/user/{username}/perf/{mode}";
export const lichessRatingHistoryEndpoint = "/user/{username}/rating-history";
export const lichessTopTenFromModeEndpoint = "/player/top/10/{mode}";

export default function itemRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  fastify.get(
    topTenEndpointUrl,
    getTopTenByModeSchema(`${lichessBaseUrl}${lichessTopTenEndpoint}`)
  );
  fastify.get(
    userByIdEndpointUrl,
    getUserByIdSchema(`${lichessBaseUrl}${lichessUserByIdEndpoint}`)
  );
  fastify.get(
    enrichedUserEndpointUrl,
    getEnrichedUserSchema(
      `${lichessBaseUrl}${lichessUserByIdEndpoint}`,
      `${lichessBaseUrl}${lichessUserPerformanceEndpoint}`
    )
  );
  fastify.get(
    ratingHistoryEndpointUrl,
    getTopPlayerHistorySchema(
      `${lichessBaseUrl}${lichessTopTenFromModeEndpoint}`,
      `${lichessBaseUrl}${lichessRatingHistoryEndpoint}`
    )
  );

  done();
}
