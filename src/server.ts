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
  const topTenResponse = await fetch(lichessTopTenUrl);
  let topTenInfo = await topTenResponse.json();

  for (const mode in topTenInfo) {
    if (Array.isArray(topTenInfo[mode])) {
      topTenInfo[mode] = topTenInfo[mode].map(
        ({ perfs, ...rest }: { perfs: Object; rest: Object }) => ({
          ...rest,
          modes: perfs,
        })
      );
    }
  }

  reply.code(200).send(topTenInfo);
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

// Third endpont
const lichessUserPerformanceUrl =
  "https://lichess.org/api/user/{username}/perf/{mode}";
const enrichedUserEndpointUrl = "/chess/user/enriched";
type modeType =
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
    request: FastifyRequest<{ Querystring: { id: string; mode: modeType } }>,
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

    let userInfo = await userInfoResponse.json();

    if (!userInfo.username) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_ID_OR_MODE,
      });
      return;
    }

    userInfo = {
      id: userInfo.id,
      username: userInfo.username,
      profile: userInfo.profile,
      playTime: userInfo.playTime,
    };

    const userPerformanceResponse = await fetch(
      `${lichessUserPerformanceUrl
        .replace("{username}", userInfo.username)
        .replace("{mode}", mode)}`,
      {
        method: "GET",
      }
    );

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

    let userPerformance = await userPerformanceResponse.json();

    let resultStreak = userPerformance.stat.resultStreak;

    resultStreak = {
      wins: { current: resultStreak.win.cur.v, max: resultStreak.win.max.v },
      losses: {
        current: resultStreak.loss.cur.v,
        max: resultStreak.loss.max.v,
      },
    };

    userPerformance = {
      rank: userPerformance.rank,
      resultStreak: resultStreak,
    };

    const enrichedUser = {
      ...userInfo,
      ...userPerformance,
    };

    reply.code(200).send(enrichedUser);
  }
);

// Fourth endpoint
const lichessRatingHistoryUrl =
  "https://lichess.org/api/user/{username}/rating-history";
const ratingHistoryEndpointUrl = "/chess/topPlayerHistory";

fastify.get(
  ratingHistoryEndpointUrl,
  async (
    request: FastifyRequest<{ Querystring: { top: number; mode: modeType } }>,
    reply
  ) => {
    const { top, mode } = request.query;

    if (!top || !mode) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_TOP_OR_MODE,
      });
      return;
    }

    if (top < 1 || top > 10) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_TOP_OR_MODE,
      });
      return;
    }

    const topTenResponse = await fetch(lichessTopTenUrl, {
      method: "GET",
    });

    if (!topTenResponse.ok) {
      if (topTenResponse.status == 500) {
        reply.code(500).send({
          error: ERROR_MESSAGES.INTERNAL_SERVER,
        });
        return;
      }

      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_TOP_OR_MODE,
      });
      return;
    }

    const topTen = await topTenResponse.json();

    const selectedUsername = topTen[mode][top - 1].username;

    if (!selectedUsername) {
      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_TOP_OR_MODE,
      });
      return;
    }

    const userRatingHistoryResponse = await fetch(
      `${lichessRatingHistoryUrl.replace("{username}", selectedUsername)}`,
      {
        method: "GET",
      }
    );

    if (!userRatingHistoryResponse.ok) {
      if (userRatingHistoryResponse.status == 500) {
        reply.code(500).send({
          error: ERROR_MESSAGES.INTERNAL_SERVER,
        });
        return;
      }

      reply.code(400).send({
        error: ERROR_MESSAGES.INVALID_TOP_OR_MODE,
      });
      return;
    }

    let userRatingHistory = await userRatingHistoryResponse.json();

    userRatingHistory = userRatingHistory.filter(
      (modeRating: { name: modeType; points: Array<Array<number>> }) => {
        return modeRating.name.toLowerCase() === mode;
      }
    );

    userRatingHistory = userRatingHistory[0].points.map(
      (modeRating: Array<number>) => {
        return {
          date: `${modeRating[0]}-${modeRating[1]}-${modeRating[2]}`,
          rating: modeRating[3],
        };
      }
    );

    reply.code(200).send({
      username: selectedUsername,
      history: userRatingHistory,
    });
  }
);

const ERROR_MESSAGES = {
  INVALID_ID: "Invalid or missing 'id' parameter.",
  INVALID_ID_OR_MODE: "Invalid or missing 'id' or 'mode' parameter.",
  INVALID_TOP_OR_MODE: "Invalid or missing 'top' or 'mode' parameter.",
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
