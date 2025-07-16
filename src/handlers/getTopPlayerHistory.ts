import { FastifyRequest, FastifyReply } from "fastify";
import { generalResponseMessages } from "./codeResponseMessages";
import { modeType } from "../schemas/generalTypes";

export const INVALID_TOP_OR_MODE =
  "Invalid or missing 'top' or 'mode' parameter.";

export default async function getTopPlayerHistory(
  request: FastifyRequest<{ Querystring: { top: number; mode: modeType } }>,
  reply: FastifyReply,
  lichessTopTenFromModeUrl: string,
  lichessRatingHistoryUrl: string
) {
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

  const topTenInfoResponse = await getTopTenInfoGivenMode(
    lichessTopTenFromModeUrl,
    mode
  );

  if (failedResponse(topTenInfoResponse)) {
    if (serverError(topTenInfoResponse)) {
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

  const topTenInfo = await topTenInfoResponse.json();

  const selectedUsername = getUsernameFromTopTenInfo(topTenInfo, top);

  if (usernameDoesNotExist(selectedUsername)) {
    reply.code(404).send({
      error: generalResponseMessages.USER_NOT_FOUND,
    });
    return;
  }

  const userRatingHistoryResponse = await getUserRatingHistoryGivenUsername(
    lichessRatingHistoryUrl,
    selectedUsername
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

async function getTopTenInfoGivenMode(
  lichessTopTenFromModeUrl: string,
  mode: string
) {
  return await fetch(lichessTopTenFromModeUrl.replace("{mode}", mode), {
    method: "GET",
  });
}

async function getUserRatingHistoryGivenUsername(
  lichessRatingHistoryUrl: string,
  username: string
) {
  return await fetch(
    `${lichessRatingHistoryUrl.replace("{username}", username)}`,
    {
      method: "GET",
    }
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

  return top < MIN_TOP_POSITION || top > MAX_TOP_POSITION || isNaN(top);
}

function missingTopOrModeParameters(top: number, mode: string) {
  return !top || !mode || isNaN(top);
}

function failedResponse(topTenResponse: Response) {
  return !topTenResponse.ok;
}

function serverError(topTenResponse: Response) {
  return topTenResponse.status == 500;
}
