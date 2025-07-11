import { FastifyRequest, FastifyReply } from "fastify";

// TODO: Exporting functionalities into separate functions
// TODO: Add missing code messages
export default async function getTopTenByMode(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const lichessTopTenUrl = "https://lichess.org/api/player";

  const topTenResponse = await fetch(lichessTopTenUrl);

  if (!topTenResponse.ok) {
    reply.code(500).send({
      error: topTenResponse.statusText,
    });
    return;
  }

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
}
