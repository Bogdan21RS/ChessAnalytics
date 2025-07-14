import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import { topTenEndpointUrl } from "../../src/routes/endpointRoutes";

describe("top ten by game-mode endpoint end to end tests", () => {
  let server: any;

  beforeAll(() => {
    server = build();
  });

  afterAll(async () => {
    await server.close();
  });

  it("returns the top ten players by game mode", async () => {
    const response = await server.inject({
      method: "GET",
      url: topTenEndpointUrl,
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();

    type GameModeInfo = {
      rating: number;
      progress: number;
    };

    type Modes = {
      [mode: string]: GameModeInfo;
    };

    type TopUser = {
      id: string;
      username: string;
      modes: Modes;
    };

    type TopTenByModeResponse = {
      [mode: string]: TopUser[];
    };

    const typedData: TopTenByModeResponse = data;

    Object.keys(typedData).forEach((gameMode: string) => {
      expect(typeof gameMode).toBe("string");
      const topUsers: TopUser[] = typedData[gameMode];
      topUsers.forEach((topUser: TopUser) => {
        expect(typeof topUser).toBe("object");
        expect(topUser).toHaveProperty("id");
        expect(topUser).toHaveProperty("username");
        expect(topUser).toHaveProperty("modes");
        expect(typeof topUser.modes).toBe("object");
        expect(topUser.modes).toHaveProperty(gameMode);
        const modeInfo = topUser.modes[gameMode];
        expect(modeInfo).toHaveProperty("rating");
        expect(modeInfo).toHaveProperty("progress");
      });
    });
  });
});
