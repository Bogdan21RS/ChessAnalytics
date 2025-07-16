import { build } from "./serverBuild";

const fastify = build();

const PORT = 5000;
const setupIp = "0.0.0.0";

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: setupIp });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
