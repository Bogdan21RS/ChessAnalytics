import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import {
  lichessBaseUrl,
  lichessTopTenFromModeEndpoint,
  lichessRatingHistoryEndpoint,
  ratingHistoryEndpointUrl,
} from "../../src/routes/routes";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import topTenFromMode from "./objectReplies/topTenFromMode.json";
import userRatingHistory from "./objectReplies/userRatingHistory.json";
import { generalResponseMessages } from "../../src/handlers/codeResponseMessages";
import { INVALID_TOP_OR_MODE } from "../../src/handlers/getTopPlayerHistory";
import topTenFromModeWithoutUsername from "./objectReplies/topTenFromModeWithoutUsername.json";

const serverMock = setupServer();

const topTenFromModeHandler = (mode: string) =>
  http.get(
    `${lichessBaseUrl}${lichessTopTenFromModeEndpoint.replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json(topTenFromMode, { status: 200 });
    }
  );
const topTenFromModeHandlerWithInvalidMode = (mode: string) =>
  http.get(
    `${lichessBaseUrl}${lichessTopTenFromModeEndpoint.replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json({ error: INVALID_TOP_OR_MODE }, { status: 400 });
    }
  );
const ratingHistoryHandler = (username: string, mode: string) =>
  http.get(
    `${lichessBaseUrl}${lichessRatingHistoryEndpoint
      .replace("{username}", username)
      .replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json(userRatingHistory, { status: 200 });
    }
  );

const topTenFromModeHandlerWithoutUsername = (mode: string) =>
  http.get(
    `${lichessBaseUrl}${lichessTopTenFromModeEndpoint.replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json(topTenFromModeWithoutUsername, { status: 200 });
    }
  );

const serverErrorHandler = (top: number, mode: string) =>
  http.get(
    `${lichessBaseUrl}${lichessTopTenFromModeEndpoint.replace("{mode}", mode)}`,
    async () => {
      return HttpResponse.json(
        { error: generalResponseMessages.SERVER_ERROR },
        { status: 500 }
      );
    }
  );

const existingMode = "bullet";
const topUsername = "Ediz_Gurel";
const nonExistingMode = "nonExistentModeThatWillNotBeFound";

describe("get user rating history end to end tests", () => {
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

  it("returns the rating history of the one of the top ten players by game mode", async () => {
    serverMock.use(topTenFromModeHandler(existingMode));
    serverMock.use(ratingHistoryHandler(topUsername, existingMode));

    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 1,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(200);

    const data = response.json();

    expect(data.username).toBe(topUsername);
    expect(data.history.length).toBe(2);
    expect(data.history[0].date).toBe("2011-6-8");
    expect(data.history[1].date).toBe("2011-7-29");
    expect(data.history[0].rating).toBe(1472);
    expect(data.history[1].rating).toBe(1332);
  });

  it("returns an error if the top parameter is not given", async () => {
    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_TOP_OR_MODE);
  });

  it("returns an error if the game mode is not given", async () => {
    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 1,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_TOP_OR_MODE);
  });

  it("returns an error if the top parameter is not a number", async () => {
    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: "notANumber",
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_TOP_OR_MODE);
  });

  it("returns an error if the top parameter is zero", async () => {
    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 0,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_TOP_OR_MODE);
  });
  it("returns an error if the top parameter is two-hundred and one", async () => {
    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 201,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_TOP_OR_MODE);
  });

  it("returns an error if the selected player is not found", async () => {
    serverMock.use(topTenFromModeHandlerWithoutUsername(existingMode));

    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 1,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(404);
    const data = response.json();

    expect(data.error).toBe(generalResponseMessages.USER_NOT_FOUND);
  });

  it("returns an error if the game mode is invalid", async () => {
    serverMock.use(topTenFromModeHandlerWithInvalidMode(nonExistingMode));

    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 1,
        mode: nonExistingMode,
      },
    });

    expect(response.statusCode).toBe(400);
    const data = response.json();

    expect(data.error).toBe(INVALID_TOP_OR_MODE);
  });

  it("returns a server error if the api fails", async () => {
    serverMock.use(serverErrorHandler(1, existingMode));

    const response = await server.inject({
      method: "GET",
      url: ratingHistoryEndpointUrl,
      query: {
        top: 1,
        mode: existingMode,
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe(generalResponseMessages.SERVER_ERROR);
  });
});
