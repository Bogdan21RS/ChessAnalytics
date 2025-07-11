import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import itemRoutes from "./routes/routes";

const fastify: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  },
});

// Register Swagger (core)
fastify.register(swagger, {
  swagger: {
    info: {
      title: "fastify-api",
      description: "API documentation",
      version: "1.0.0",
    },
  },
});

// Register Swagger UI (exposes the docs at /docs)
fastify.register(swaggerUI, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

fastify.register(itemRoutes);

const PORT = 5000;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
