import { FastifyRequest, FastifyReply } from "fastify";
import { generalResponseMessages } from "./codeResponseMessages";

export const INVALID_ID = "Invalid or missing 'id' parameter.";

export default async function getUserById(
  request: FastifyRequest<{ Querystring: { id: string } }>,
  reply: FastifyReply,
  lichessUserByIdUrl: string
) {
  const { id } = request.query;
  if (missingIdParameter(id)) {
    return sendInvalidOrMissingIdResponse(reply);
  }

  const userInfoResponse = await getUserInfoGivenId(lichessUserByIdUrl, id);
  if (failedResponse(userInfoResponse)) {
    return sendFailedResponse(reply, userInfoResponse);
  }

  const userByIdInfo = await userInfoResponse.json();
  sendUserByIdResponse(reply, userByIdInfo);
}

function sendFailedResponse(reply: FastifyReply, userInfoResponse: Response) {
  if (serverError(userInfoResponse)) {
    return sendServerErrorResponse(reply);
  }
  if (userNotFound(userInfoResponse)) {
    return sendUserNotFoundResponse(reply);
  }

  return sendInvalidOrMissingIdResponse(reply);
}

function sendUserNotFoundResponse(reply: FastifyReply) {
  reply.code(404).send({
    error: generalResponseMessages.USER_NOT_FOUND,
  });
  return;
}

function sendServerErrorResponse(reply: FastifyReply) {
  reply.code(500).send({
    error: generalResponseMessages.SERVER_ERROR,
  });
  return;
}

function sendUserByIdResponse(
  reply: FastifyReply,
  userByIdInfo: {
    [property: string]: Object;
  }
) {
  reply.code(200).send(getUserByIdBySpecification(userByIdInfo));
}

function sendInvalidOrMissingIdResponse(reply: FastifyReply) {
  reply.code(400).send({
    error: INVALID_ID,
  });
  return;
}

async function getUserInfoGivenId(lichessUserByIdUrl: string, id: string) {
  return await fetch(`${lichessUserByIdUrl.replace("{id}", id)}`, {
    method: "GET",
  });
}

function failedResponse(userByIdResponse: Response) {
  return !userByIdResponse.ok;
}

function serverError(userByIdResponse: Response) {
  return userByIdResponse.status === 500;
}

function userNotFound(userByIdResponse: Response) {
  return userByIdResponse.status === 404;
}

function missingIdParameter(id: string | undefined) {
  return !id;
}

function getUserByIdBySpecification(userByIdInfo: {
  [property: string]: Object;
}) {
  return {
    id: userByIdInfo.id,
    username: userByIdInfo.username,
    modes: userByIdInfo.perfs,
    flair: userByIdInfo.flair,
    patron: userByIdInfo.patron,
    verified: userByIdInfo.verified,
    createdAt: userByIdInfo.createdAt,
    profile: userByIdInfo.profile,
    seenAt: userByIdInfo.seenAt,
    playTime: userByIdInfo.playTime,
  };
}
