import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { build } from "../../src/serverBuild";
import {
  topTenEndpointUrl,
  lichessBaseUrl,
  lichessTopTenEndpoint,
} from "../../src/routes/routes";

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import topTenPlayersByMode from "./objectReplies/topTenPlayersByMode.json";

const serverMock = setupServer(
  http.get(`${lichessBaseUrl}${lichessTopTenEndpoint}`, async () => {
    return HttpResponse.json(topTenPlayersByMode, {
      status: 200,
    });
  })
);

describe("top ten by game-mode endpoint end to end tests", () => {
  let server: any;

  beforeAll(() => {
    serverMock.listen();
    server = build();
  });

  afterAll(async () => {
    serverMock.close();
    await server.close();
  });

  it("returns the top ten players by game mode", async () => {
    const response = await server.inject({
      method: "GET",
      url: topTenEndpointUrl,
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();

    expect(data).toHaveProperty("bullet");
    expect(data).toHaveProperty("blitz");
    expect(data.bullet).toHaveLength(10);
    expect(data.bullet[0]).toHaveProperty("modes");
    expect(data.bullet[0].id).toBe("ediz_gurel");
    expect(data.bullet[0].username).toBe("Ediz_Gurel");
    expect(data.bullet[0].modes.bullet.rating).toBe(3339);
    expect(data.bullet[0].modes.bullet.progress).toBe(-37);
  });
});
