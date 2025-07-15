import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import {
  lichessBaseUrl,
  lichessUserByIdEndpoint,
  lichessUserPerformanceEndpoint,
  enrichedUserEndpointUrl,
} from "../../src/routes/routes";

import nock from "nock";
import playerInfo from "./objectReplies/playerById.json";
import userPerformance from "./objectReplies/userPerformance.json";
import { generalResponseMessages } from "../../src/handlers/codeResponseMessages";
import { INVALID_ID_OR_MODE } from "../../src/handlers/getEnrichedUser";

const existingId = "thibault";
const existingMode = "bullet";
const nonExistingId = "nonExistentIdThatWillNotBeFound";

describe("get user by id endpoint end to end tests", () => {
  let server: any;

  beforeAll(() => {
    server = build();
  });

  afterAll(async () => {
    await server.close();
  });

  it("returns the top ten players by game mode", async () => {
    const existingId = "thibault";
    const existingUsername = "thibault";
    const existingMode = "bullet";

    nock(lichessBaseUrl)
      .get(lichessUserByIdEndpoint.replace("{id}", existingId))
      .reply(200, playerInfo);

    nock(lichessBaseUrl)
      .get(
        lichessUserPerformanceEndpoint
          .replace("{username}", existingUsername)
          .replace("{mode}", existingMode)
      )
      .reply(200, userPerformance);

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

  it("returns an error if the user ID is not given", async () => {
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

  it("returns an error if the game mode is not given", async () => {
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

  it("returns an error if the user does not exist", async () => {
    nock(lichessBaseUrl)
      .get(lichessUserByIdEndpoint.replace("{id}", nonExistingId))
      .reply(404, {
        error: generalResponseMessages.USER_NOT_FOUND,
      });

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
});
