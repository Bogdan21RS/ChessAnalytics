import { FastifyRequest, FastifyReply } from "fastify";
import { responseMessages } from "./codeResponseMessages";

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
export default async function getTopPlayerHistory(
  request: FastifyRequest<{ Querystring: { top: number; mode: modeType } }>,
  reply: FastifyReply
) {
  const lichessRatingHistoryUrl =
    "https://lichess.org/api/user/{username}/rating-history";
  const lichessTopTenByModeUrl = "https://lichess.org/api/player/top/10/{mode}";
  const INVALID_TOP_OR_MODE = "Invalid or missing 'top' or 'mode' parameter.";
  const MIN_TOP_POSITION = 1;
  const MAX_TOP_POSITION = 200;

  const { top, mode } = request.query;

  if (!top || !mode) {
    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  if (top < MIN_TOP_POSITION || top > MAX_TOP_POSITION) {
    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  const topTenResponse = await fetch(
    lichessTopTenByModeUrl.replace("{mode}", mode),
    {
      method: "GET",
    }
  );

  if (!topTenResponse.ok) {
    if (topTenResponse.status == 500) {
      reply.code(500).send({
        error: responseMessages.SERVER_ERROR,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  const topTen = await topTenResponse.json();

  const selectedUsername = topTen.users[top - 1].username;

  if (!selectedUsername) {
    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
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
        error: responseMessages.SERVER_ERROR,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
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
