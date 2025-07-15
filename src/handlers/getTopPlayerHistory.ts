import { FastifyRequest, FastifyReply } from "fastify";
import { generalResponseMessages } from "./codeResponseMessages";

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

export default async function getTopPlayerHistory(
  request: FastifyRequest<{ Querystring: { top: number; mode: modeType } }>,
  reply: FastifyReply
) {
  const lichessRatingHistoryUrl =
    "https://lichess.org/api/user/{username}/rating-history";
  const lichessTopTenByModeUrl = "https://lichess.org/api/player/top/10/{mode}";
  const INVALID_TOP_OR_MODE = "Invalid or missing 'top' or 'mode' parameter.";
  const USER_NOT_FOUND = "User not found.";

  const { top, mode } = request.query;

  if (missingTopOrModeParameters(top, mode)) {
    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  if (invalidTopParameter(top)) {
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

  if (failedResponse(topTenResponse)) {
    if (serverError(topTenResponse)) {
      reply.code(500).send({
        error: generalResponseMessages.SERVER_ERROR,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  const topTenInfo = await topTenResponse.json();

  const selectedUsername = getUsernameFromTopTenInfo(topTenInfo, top);

  if (usernameDoesNotExist(selectedUsername)) {
    reply.code(404).send({
      error: USER_NOT_FOUND,
    });
    return;
  }

  const userRatingHistoryResponse = await fetch(
    `${lichessRatingHistoryUrl.replace("{username}", selectedUsername)}`,
    {
      method: "GET",
    }
  );

  if (failedResponse(userRatingHistoryResponse)) {
    if (serverError(userRatingHistoryResponse)) {
      reply.code(500).send({
        error: generalResponseMessages.SERVER_ERROR,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_TOP_OR_MODE,
    });
    return;
  }

  const userRatingHistoryInfo = await userRatingHistoryResponse.json();

  reply
    .code(200)
    .send(
      getUserRatingHistoryBySpecification(
        userRatingHistoryInfo,
        mode,
        selectedUsername
      )
    );
}

function getUserRatingHistoryBySpecification(
  userRatingHistoryInfo: Array<{
    name: modeType;
    points: Array<Array<number>>;
  }>,
  mode: string,
  selectedUsername: string
) {
  const filteredUserRatingHistoryInfo = userRatingHistoryInfo.filter(
    (modeRating: { name: modeType; points: Array<Array<number>> }) => {
      return modeRating.name.toLowerCase() === mode;
    }
  );

  const mappedUserRatingHistoryInfo =
    filteredUserRatingHistoryInfo[0].points.map((modeRating: Array<number>) => {
      return {
        date: `${modeRating[0]}-${modeRating[1]}-${modeRating[2]}`,
        rating: modeRating[3],
      };
    });

  return {
    username: selectedUsername,
    history: mappedUserRatingHistoryInfo,
  };
}

function usernameDoesNotExist(selectedUsername: string | undefined) {
  return !selectedUsername;
}

function getUsernameFromTopTenInfo(
  topTen: { users: Array<{ username: string }> },
  top: number
) {
  return topTen.users[top - 1].username;
}

function invalidTopParameter(top: number) {
  const MIN_TOP_POSITION = 1;
  const MAX_TOP_POSITION = 200;

  return top < MIN_TOP_POSITION || top > MAX_TOP_POSITION;
}

function missingTopOrModeParameters(top: number, mode: string) {
  return !top || !mode;
}

function failedResponse(topTenResponse: Response) {
  return !topTenResponse.ok;
}

function serverError(topTenResponse: Response) {
  return topTenResponse.status == 500;
}
