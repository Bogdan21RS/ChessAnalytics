import { FastifyRequest, FastifyReply } from "fastify";
import { responseMessages } from "./codeResponseMessages";

export default async function getTopTenByMode(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const lichessTopTenUrl = "https://lichess.org/api/player";

  const topTenResponse = await fetch(lichessTopTenUrl);

  if (!topTenResponse.ok) {
    reply.code(500).send({
      error: responseMessages.SERVER_ERROR,
    });
    return;
  }

  const topTenInfo = await topTenResponse.json();

  modifyTopTenInfoToSpecification(topTenInfo);
  reply.code(200).send(topTenInfo);
}

function modifyTopTenInfoToSpecification(topTenInfo: {
  [module: string]: Object;
}) {
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
}
