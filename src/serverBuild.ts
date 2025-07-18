import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import itemRoutes from "./routes/routes";

export function build(): FastifyInstance {
  const fastify = Fastify({
    logger:
      process.env.NODE_ENV !== "test"
        ? {
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            },
          }
        : false,
  });

  configureSwagger(fastify);
  fastify.register(itemRoutes);

  return fastify;
}

function configureSwagger(fastify: FastifyInstance): void {
  fastify.register(swagger, {
    swagger: {
      info: {
        title: "fastify-api",
        description: "API documentation",
        version: "1.0.0",
      },
    },
  });

  fastify.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });
}
