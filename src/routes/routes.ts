import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { getTopTenByModeSchema } from "../schemas/getTopTenByModeSchema";
import { getUserByIdSchema } from "../schemas/getUserByIdSchema";
import { getEnrichedUserSchema } from "../schemas/getEnrichedUserSchema";
import { getTopPlayerHistorySchema } from "../schemas/getTopPlayerHistorySchema";

import {
  topTenEndpointUrl,
  userByIdEndpointUrl,
  enrichedUserEndpointUrl,
  ratingHistoryEndpointUrl,
} from "./endpointRoutes";

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
