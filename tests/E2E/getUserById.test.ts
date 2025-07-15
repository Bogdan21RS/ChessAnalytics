import { describe, it, expect } from "@jest/globals";
import { build } from "../../src/serverBuild";
import { userByIdEndpointUrl } from "../../src/routes/routes";

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

  it("returns 404 if the user does not exist", async () => {
    const response = await server.inject({
      method: "GET",
      url: userByIdEndpointUrl,
      query: {
        id: "nonExistentIdThatWillNotBeFound",
      },
    });

    expect(response.statusCode).toBe(404);
    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;
    expect(body).toStrictEqual({
      error: "User not found.",
    });
  });
});
