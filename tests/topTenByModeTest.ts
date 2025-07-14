import { describe, it, expect } from "@jest/globals";

describe("top ten by game mode endpoint unit tests", () => {
  it("modifies the property 'perfs' to 'modes' in the top ten info", () => {
    const topTenInfo = {
      bullet: {
        perfs: { bullet: { rating: 1000 } },
      },
    };
    modifyTopTenInfoToSpecification(topTenInfo);
    expect(topTenInfo.bullet.modes).toBe(topTenInfo.bullet.perfs);
  });
});

describe("top ten by game mode endpoint integration tests", () => {
  it("", () => {});
});

describe("top ten by game mode endpoint end to end tests", () => {
  it("", () => {});
});
