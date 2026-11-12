import { describe, expect, it } from "vitest";
import { enforceIdType, isUnresolved, isUsIcao, requiredIdType, validatePassenger, emptyPassenger, manifestComplete } from "./rules";

describe("manifest ID type rule", () => {
  it("recognises US ICAO codes", () => {
    expect(isUsIcao("KTEB")).toBe(true);
    expect(isUsIcao("PHNL")).toBe(true);
    expect(isUsIcao("EGLL")).toBe(false);
    expect(isUsIcao("CYYZ")).toBe(false);
  });

  it("requires REAL ID for domestic-only trips", () => {
    expect(requiredIdType(["KTEB", "KVNY"])).toBe("real_id");
  });

  it("requires passport if any leg is international", () => {
    expect(requiredIdType(["KTEB", "KVNY", "MMSD"])).toBe("passport");
    expect(requiredIdType(["KTEB", "EGLL"])).toBe("passport");
  });

  it("defaults to passport when no route is known", () => {
    expect(requiredIdType([])).toBe("passport");
  });

  it("forces passenger ID type to the required type", () => {
    const rows = [{ ...emptyPassenger("passport"), id_type: "real_id" as const }];
    expect(enforceIdType(rows, "passport")[0].id_type).toBe("passport");
  });

  it("flags a passenger whose ID type differs from the required type", () => {
    const p = { ...emptyPassenger("real_id"), full_name: "Test Person", date_of_birth: "1980-01-01", id_number: "X1", id_expiry: "2999-01-01", id_issuer: "TX", id_type: "passport" as const };
    expect(validatePassenger(p, "real_id").id_type).toBeTruthy();
    expect(validatePassenger({ ...p, id_type: "real_id" }, "real_id")).toEqual({});
    expect(manifestComplete([{ ...p, id_type: "real_id" }], "real_id", 1)).toBe(true);
    expect(manifestComplete([{ ...p, id_type: "real_id" }], "real_id", 2)).toBe(false);
  });

  it("rejects an expired ID", () => {
    const p = { ...emptyPassenger("real_id"), full_name: "Test Person", date_of_birth: "1980-01-01", id_number: "X1", id_expiry: "2001-01-01", id_issuer: "TX" };
    expect(validatePassenger(p, "real_id").id_expiry).toBeTruthy();
  });
});

describe("isUnresolved", () => {
  it("matches tolerated spellings", () => {
    expect(isUnresolved(["passengers"], "passengers")).toBe(true);
    expect(isUnresolved(["legs[1].depart_at"], "depart_at", 1)).toBe(true);
    expect(isUnresolved(["legs.0.origin_icao"], "origin_icao", 0)).toBe(true);
    expect(isUnresolved(["legs[1].depart_at"], "depart_at", 0)).toBe(false);
  });
});
