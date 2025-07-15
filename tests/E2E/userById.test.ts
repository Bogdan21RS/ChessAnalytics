import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import {
  lichessBaseUrl,
  lichessUserByIdEndpoint,
  userByIdEndpointUrl,
} from "../../src/routes/routes";
import nock from "nock";
import playerInfo from "./objectReplies/playerById.json";
import { generalResponseMessages } from "../../src/handlers/codeResponseMessages";

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

    nock(lichessBaseUrl)
      .get(lichessUserByIdEndpoint.replace("{id}", existingId))
      .reply(200, playerInfo);

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

  it("returns 404 if the user does not exist", async () => {
    const nonExistingId = "nonExistentIdThatWillNotBeFound";
    nock(lichessBaseUrl)
      .get(lichessUserByIdEndpoint.replace("{id}", nonExistingId))
      .reply(404, {
        error: generalResponseMessages.USER_NOT_FOUND,
      });

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
});
