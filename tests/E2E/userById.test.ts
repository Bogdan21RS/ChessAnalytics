import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import {
  lichessBaseUrl,
  lichessUserByIdEndpoint,
  userByIdEndpointUrl,
} from "../../src/routes/routes";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import playerInfo from "./objectReplies/playerById.json";
import { generalResponseMessages } from "../../src/handlers/codeResponseMessages";
import { INVALID_ID } from "../../src/handlers/getUserById";

const successHandler = (id: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserByIdEndpoint.replace("{id}", id)}`,
    async () => {
      return HttpResponse.json(playerInfo, {
        status: 200,
      });
    }
  );

const errorHandler = (id: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserByIdEndpoint.replace("{id}", id)}`,
    async () => {
      return HttpResponse.json({ error: INVALID_ID }, { status: 400 });
    }
  );

const serverErrorHandler = (id: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserByIdEndpoint.replace("{id}", id)}`,
    async () => {
      return HttpResponse.json(
        { error: generalResponseMessages.SERVER_ERROR },
        { status: 500 }
      );
    }
  );

const serverMock = setupServer();

describe("get user by id endpoint end to end tests", () => {
  let server: any;

  beforeAll(() => {
    serverMock.listen();
    server = build();
  });

  afterEach(() => serverMock.resetHandlers());

  afterAll(async () => {
    serverMock.close();
    await server.close();
  });

  it("returns the top ten players by game mode", async () => {
    const existingId = "thibault";
    serverMock.use(successHandler(existingId));

    const response = await server.inject({
      method: "GET",
      url: userByIdEndpointUrl,
      query: {
        id: existingId,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();

    expect(data.id).toBe(existingId);
    expect(data.username).toBe(existingId);
    expect(data).toHaveProperty("modes");
    expect(data.seenAt).toBe(1752475985759);
    expect(data.playTime.total).toBe(6408249);
    expect(data.playTime.tv).toBe(17974);
  });

  it("returns an invalid or missing id error if the user ID is not given", async () => {
    const response = await server.inject({
      method: "GET",
      url: userByIdEndpointUrl,
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_ID);
  });

  it("returns an invalid or missing id error if the user id is invalid", async () => {
    const invalidId = "1231231231231231312312312312312312123123132132123123123";
    serverMock.use(errorHandler(invalidId));

    const response = await server.inject({
      method: "GET",
      url: userByIdEndpointUrl,
      query: {
        id: invalidId,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_ID);
  });

  it("returns a user not found error if the user does not exist", async () => {
    const nonExistingId = "nonExistentIdThatWillNotBeFound";

    const response = await server.inject({
      method: "GET",
      url: userByIdEndpointUrl,
      query: {
        id: nonExistingId,
      },
    });

    expect(response.statusCode).toBe(404);
    const data = response.json();

    expect(data.error).toBe(generalResponseMessages.USER_NOT_FOUND);
  });

  it("returns a server error if the api fails", async () => {
    serverMock.use(serverErrorHandler("thibault"));

    const response = await server.inject({
      method: "GET",
      url: userByIdEndpointUrl,
      query: {
        id: "thibault",
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe(generalResponseMessages.SERVER_ERROR);
  });
});
