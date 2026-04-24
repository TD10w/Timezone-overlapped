import { describe, expect, it } from "vitest";
import { searchCities } from "../lib/citySearch.js";

describe("city search", () => {
  it("matches aliases", () => {
    expect(searchCities("nyc")[0].name).toBe("New York");
  });

  it("matches country keywords", () => {
    const results = searchCities("south korea");
    expect(results.some((city) => city.name === "Seoul")).toBe(true);
  });

  it("returns disambiguating country data", () => {
    const [city] = searchCities("san francisco");
    expect(city.country).toBe("United States");
    expect(city.tz).toBe("America/Los_Angeles");
  });
});
