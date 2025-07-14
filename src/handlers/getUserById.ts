import { FastifyRequest, FastifyReply } from "fastify";
import { responseMessages } from "./codeResponseMessages";

// TODO: Exporting functionalities into separate functions

export default async function getUserById(
  request: FastifyRequest<{ Querystring: { id: string } }>,
  reply: FastifyReply
) {
  const INVALID_ID = "Invalid or missing 'id' parameter.";
  const USER_NOT_FOUND = "User not found.";
  const lichessUserByIdUrl = "https://lichess.org/api/user/{id}";

  const { id } = request.query;

  if (queryDoesNotHaveId(id)) {
    reply.code(400).send({
      error: INVALID_ID,
    });
    return;
  }

  const userByIdResponse = await fetch(
    `${lichessUserByIdUrl.replace("{id}", id)}`,
    {
      method: "GET",
    }
  );

  if (failedResponse(userByIdResponse)) {
    if (serverError(userByIdResponse)) {
      reply.code(500).send({
        error: responseMessages.SERVER_ERROR,
      });
      return;
    }
    reply.code(404).send({
      error: USER_NOT_FOUND,
    });
    return;
  }

  const userByIdInfo = await userByIdResponse.json();

  reply.code(200).send(getUserByIdBySpecification(userByIdInfo));
}

function failedResponse(userByIdResponse: Response) {
  return !userByIdResponse.ok;
}

function serverError(userByIdResponse: Response) {
  return userByIdResponse.status === 500;
}

function queryDoesNotHaveId(id: string | undefined) {
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
