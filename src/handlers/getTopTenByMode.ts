import { FastifyRequest, FastifyReply } from "fastify";
import { generalResponseMessages } from "./codeResponseMessages";

export default async function getTopTenByMode(
  request: FastifyRequest,
  reply: FastifyReply,
  lichessTopTenUrl: string
) {
  const topTenInfoResponse = await getTopTenInfo(lichessTopTenUrl);
  if (failedResponse(topTenInfoResponse)) {
    return sendServerErrorResponse(reply);
  }

  const topTenInfo = await topTenInfoResponse.json();
  modifyTopTenInfoToSpecification(topTenInfo);
  sendTopTenByModeResponse(reply, topTenInfo);
}

function sendServerErrorResponse(reply: FastifyReply) {
  reply.code(500).send({
    error: generalResponseMessages.SERVER_ERROR,
  });
  return;
}

function sendTopTenByModeResponse(reply: FastifyReply, topTenInfo: Object) {
  reply.code(200).send(topTenInfo);
}

async function getTopTenInfo(lichessTopTenUrl: string) {
  return await fetch(lichessTopTenUrl, {
    method: "GET",
  });
}

function failedResponse(topTenResponse: Response) {
  return !topTenResponse.ok;
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
