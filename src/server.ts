import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

const fastify: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  },
});

// Register Swagger (core)
fastify.register(swagger, {
  swagger: {
    info: {
      title: "fastify-api",
      description: "API documentation",
      version: "1.0.0",
    },
  },
});

// Register Swagger UI (exposes the docs at /docs)
fastify.register(swaggerUI, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

// First endpoint
const lichessTopTenUrl = "https://lichess.org/api/player";
const topTenEndpointUrl = "/chess/top10";

fastify.get(topTenEndpointUrl, async (request, reply) => {
  const response = await fetch(lichessTopTenUrl);
  const data = await response.json();
  reply.code(200).send(data);
});

// Second endpont
const lichessUserByIdUrl = "https://lichess.org/api/user/{id}";
const userByIdEndpointUrl = "/chess/user";

fastify.get(
  userByIdEndpointUrl,
  async (request: FastifyRequest<{ Querystring: { id: string } }>, reply) => {
    const { id } = request.query;

    if (!id) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID,
      });
      return;
    }

    const response = await fetch(`${lichessUserByIdUrl.replace("{id}", id)}`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status == 500) {
        reply.code(500).send({
          error: ERROR_MESSAGES.INTERNAL_SERVER,
        });
        return;
      }
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID,
      });
      return;
    }

    const data = await response.json();

    reply.code(200).send(data);
  }
);

// TODO: Third endpont
const lichessUserPerformanceUrl =
  "https://lichess.org/api/user/{username}/perf/{mode}";
const enrichedUserEndpointUrl = "/chess/user/enriched";
type perfType =
  | "ultraBullet"
  | "bullet"
  | "blitz"
  | "rapid"
  | "classical"
  | "correspondence"
  | "chess960"
  | "crazyhouse"
  | "antichess"
  | "atomic"
  | "horde"
  | "kingOfTheHill"
  | "racingKings"
  | "threeCheck";

fastify.get(
  enrichedUserEndpointUrl,
  async (
    request: FastifyRequest<{ Querystring: { id: string; mode: perfType } }>,
    reply
  ) => {
    const { id, mode } = request.query;

    if (!id || !mode) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID_OR_MODE,
      });
      return;
    }

    const userInfoResponse = await fetch(
      `${lichessUserByIdUrl.replace("{id}", id)}`,
      {
        method: "GET",
      }
    );

    if (!userInfoResponse.ok) {
      if (userInfoResponse.status == 500) {
        reply.code(500).send({
          error: ERROR_MESSAGES.INTERNAL_SERVER,
        });
        return;
      }

      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID_OR_MODE,
      });
      return;
    }

    const userInfo = await userInfoResponse.json();

    if (!userInfo.username) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID_OR_MODE,
      });
      return;
    }

    const userPerformanceResponse = await fetch(
      `${lichessUserPerformanceUrl
        .replace("{username}", userInfo.username)
        .replace("{mode}", mode)}`,
      {
        method: "GET",
      }
    );

    console.log(userPerformanceResponse);

    if (!userPerformanceResponse.ok) {
      if (userPerformanceResponse.status == 500) {
        reply.code(500).send({
          error: ERROR_MESSAGES.INTERNAL_SERVER,
        });
        return;
      }

      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID_OR_MODE,
      });
      return;
    }

    const userPerformance = await userPerformanceResponse.json();

    const enrichedUser = {
      ...userInfo,
      ...userPerformance,
    };

    reply.code(200).send(enrichedUser);
  }
);

// TODO: Fourth endpont

const ERROR_MESSAGES = {
  INVALID_ID: "Invalid or missing 'id' parameter.",
  INVALID_ID_OR_MODE: "Invalid or missing 'id' or 'mode' parameter.",
  INTERNAL_SERVER: "Internal server error.",
};

const PORT = 5000;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
