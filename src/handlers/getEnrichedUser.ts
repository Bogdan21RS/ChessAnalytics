import { FastifyRequest, FastifyReply } from "fastify";
import { generalResponseMessages } from "./codeResponseMessages";
import { modeType } from "../schemas/generalTypes";

export const INVALID_ID_OR_MODE =
  "Invalid or missing 'id' or 'mode' parameter.";

export default async function getEnrichedUser(
  request: FastifyRequest<{ Querystring: { id: string; mode: modeType } }>,
  reply: FastifyReply,
  lichessUserByIdUrl: string,
  lichessUserPerformanceUrl: string
) {
  const { id, mode } = request.query;

  if (missingIdOrModeParameters(id, mode)) {
    reply.code(400).send({
      error: INVALID_ID_OR_MODE,
    });
    return;
  }

  const userInfoResponse = await fetch(
    `${lichessUserByIdUrl.replace("{id}", id)}`,
    {
      method: "GET",
    }
  );

  if (failedResponse(userInfoResponse)) {
    if (serverError(userInfoResponse)) {
      reply.code(500).send({
        error: generalResponseMessages.SERVER_ERROR,
      });
      return;
    }

    if (userNotFound(userInfoResponse)) {
      reply.code(404).send({
        error: generalResponseMessages.USER_NOT_FOUND,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_ID_OR_MODE,
    });
    return;
  }

  const returnedUserInfo = await userInfoResponse.json();

  if (userInfoDoesNotHaveValidUsername(returnedUserInfo)) {
    reply.code(404).send({
      error: generalResponseMessages.USER_NOT_FOUND,
    });
    return;
  }

  const userInfo = getUserInfoBySpecification(returnedUserInfo);

  const userPerformanceResponse = await fetch(
    `${lichessUserPerformanceUrl
      .replace("{username}", userInfo.username)
      .replace("{mode}", mode)}`,
    {
      method: "GET",
    }
  );

  if (failedResponse(userPerformanceResponse)) {
    if (serverError(userPerformanceResponse)) {
      reply.code(500).send({
        error: generalResponseMessages.SERVER_ERROR,
      });
      return;
    }

    reply.code(400).send({
      error: INVALID_ID_OR_MODE,
    });
    return;
  }

  const userPerformance = await userPerformanceResponse.json();

  reply
    .code(200)
    .send(getEnrichedUserBySpecification(userPerformance, userInfo));
}

function getUserInfoBySpecification(userInfo: {
  id: string;
  username: string;
  profile: Object;
  playTime: Object;
}) {
  userInfo = {
    id: userInfo.id,
    username: userInfo.username,
    profile: userInfo.profile,
    playTime: userInfo.playTime,
  };
  return userInfo;
}

function userInfoDoesNotHaveValidUsername(userInfo: {
  username: string | undefined;
}) {
  return !userInfo.username;
}

function getEnrichedUserBySpecification(
  userPerformance: {
    stat: {
      resultStreak: {
        win: { cur: { v: number }; max: { v: number } };
        loss: { cur: { v: number }; max: { v: number } };
      };
    };
    rank: number;
  },
  userInfo: {
    id: string;
    username: string;
    profile: Object;
    playTime: Object;
  }
) {
  const resultStreak = userPerformance.stat.resultStreak;

  const modifiedResultStreak = {
    wins: { current: resultStreak.win.cur.v, max: resultStreak.win.max.v },
    losses: {
      current: resultStreak.loss.cur.v,
      max: resultStreak.loss.max.v,
    },
  };

  const modifiedUserPerformance = {
    rank: userPerformance.rank,
    resultStreak: modifiedResultStreak,
  };

  const enrichedUser = {
    ...userInfo,
    ...modifiedUserPerformance,
  };
  return enrichedUser;
}

function userNotFound(userInfoResponse: Response) {
  return userInfoResponse.status === 404;
}

function failedResponse(userInfoResponse: Response) {
  return !userInfoResponse.ok;
}

function serverError(userInfoResponse: Response) {
  return userInfoResponse.status === 500;
}

function missingIdOrModeParameters(
  id: string | undefined,
  mode: string | undefined
) {
  return !id || !mode;
}
