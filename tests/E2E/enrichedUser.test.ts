import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import {
  lichessBaseUrl,
  lichessUserByIdEndpoint,
  lichessUserPerformanceEndpoint,
  enrichedUserEndpointUrl,
} from "../../src/routes/routes";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import playerInfo from "./objectReplies/playerById.json";
import userPerformance from "./objectReplies/userPerformance.json";
import { generalResponseMessages } from "../../src/handlers/codeResponseMessages";
import { INVALID_ID_OR_MODE } from "../../src/handlers/getEnrichedUser";

const serverMock = setupServer();
const userByIdHandler = (id: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserByIdEndpoint.replace("{id}", id)}`,
    async () => {
      return HttpResponse.json(playerInfo, { status: 200 });
    }
  );

const userByIdHandlerWithInvalidIdOrMode = (id: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserByIdEndpoint.replace("{id}", id)}`,
    async () => {
      return HttpResponse.json({ error: INVALID_ID_OR_MODE }, { status: 400 });
    }
  );

const userByIdHandlerWithoutExistingUser = (id: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserByIdEndpoint.replace("{id}", id)}`,
    async () => {
      return HttpResponse.json(
        { error: generalResponseMessages.USER_NOT_FOUND },
        { status: 404 }
      );
    }
  );

const userPerformanceHandler = (username: string, mode: string) =>
  http.get(
    `${lichessBaseUrl}${lichessUserPerformanceEndpoint
      .replace("{username}", username)
      .replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json(userPerformance, { status: 200 });
    }
  );

const userPerformanceHandlerWithInvalidIdOrMode = (
  username: string,
  mode: string
) =>
  http.get(
    `${lichessBaseUrl}${lichessUserPerformanceEndpoint
      .replace("{username}", username)
      .replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json({ error: INVALID_ID_OR_MODE }, { status: 400 });
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

const existingId = "thibault";
const existingMode = "bullet";
const nonExistingId = "nonExistentIdThatWillNotBeFound";
const nonExistingMode = "nonExistentModeThatWillNotBeFound";

describe("get enriched user endpoint end to end tests", () => {
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
    const existingUsername = "thibault";

    serverMock.use(userByIdHandler(existingId));
    serverMock.use(userPerformanceHandler(existingUsername, existingMode));

    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        id: existingId,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(200);

    const data = response.json();
    expect(data.id).toBe(existingId);
    expect(data.username).toBe(existingUsername);
    expect(data).toHaveProperty("profile");
    expect(data.playTime.total).toBe(6408249);
    expect(data.playTime.tv).toBe(17974);
    expect(data.resultStreak.wins.max).toBe(16);
    expect(data.resultStreak.wins.current).toBe(0);
  });

  it("returns an invalid or missing id or mode error if the user ID is not given", async () => {
    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_ID_OR_MODE);
  });

  it("returns an invalid or missing id or mode error if the game mode is not given", async () => {
    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        id: existingId,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_ID_OR_MODE);
  });

  it("returns an invalid or missing id or mode error if the mode is invalid", async () => {
    serverMock.use(userByIdHandler(existingId));
    serverMock.use(
      userPerformanceHandlerWithInvalidIdOrMode(existingId, nonExistingMode)
    );

    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        id: existingId,
        mode: nonExistingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_ID_OR_MODE);
  });

  it("returns an invalid or missing id or mode error if the id is invalid", async () => {
    const invalidId = "1231231231231231312312312312312312123123132132123123123";
    serverMock.use(userByIdHandlerWithInvalidIdOrMode(invalidId));

    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        id: invalidId,
        mode: nonExistingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_ID_OR_MODE);
  });

  it("returns a user not found error if the user does not exist", async () => {
    serverMock.use(userByIdHandlerWithoutExistingUser(nonExistingId));

    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        id: nonExistingId,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(404);
    const data = response.json();

    expect(data.error).toBe(generalResponseMessages.USER_NOT_FOUND);
  });

  it("returns a server error if the api fails", async () => {
    serverMock.use(serverErrorHandler(existingId));

    const response = await server.inject({
      method: "GET",
      url: enrichedUserEndpointUrl,
      query: {
        id: existingId,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe(generalResponseMessages.SERVER_ERROR);
  });
});
