import { FastifyRequest, FastifyReply } from "fastify";

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

// TODO: Exporting functionalities into separate functions
// TODO: Add missing code messages
export default async function getEnrichedUser(
  request: FastifyRequest<{ Querystring: { id: string; mode: modeType } }>,
  reply: FastifyReply
) {
  const { id, mode } = request.query;
  const INVALID_TOP_OR_MODE = "Invalid or missing 'top' or 'mode' parameter.";
  const lichessUserByIdUrl = "https://lichess.org/api/user/{id}";
  const lichessUserPerformanceUrl =
    "https://lichess.org/api/user/{username}/perf/{mode}";

  if (!id || !mode) {
    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
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
        error: userInfoResponse.statusText,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  let userInfo = await userInfoResponse.json();

  if (!userInfo.username) {
    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
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
        error: userPerformanceResponse.statusText,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
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
