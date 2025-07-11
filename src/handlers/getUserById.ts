import { FastifyRequest, FastifyReply } from "fastify";

export default async function getUserById(
  request: FastifyRequest<{ Querystring: { id: string } }>,
  reply: FastifyReply
) {
  const INVALID_ID = "Invalid or missing 'id' parameter.";
  const lichessUserByIdUrl = "https://lichess.org/api/user/{id}";

  const { id } = request.query;

  if (!id) {
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

  if (!userByIdResponse.ok) {
    if (userByIdResponse.status == 500) {
      reply.code(500).send({
        error: userByIdResponse.statusText,
      });
      return;
    }
    reply.code(400).send({
      error: INVALID_ID,
    });
    return;
  }

  let userByIdInfo = await userByIdResponse.json();

  userByIdInfo = {
    id: userByIdInfo.id,
    username: userByIdInfo.username,
    modes: userByIdInfo.perfs,
  };

  reply.code(200).send(userByIdInfo);
}
