import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import { userByIdEndpointUrl } from "../../src/routes/endpointRoutes";

describe("get user by id endpoint end to end tests", () => {
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
      url: userByIdEndpointUrl,
      query: {
        id: "thibault",
      },
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();

    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("username");
    expect(data).toHaveProperty("modes");
  });
});
