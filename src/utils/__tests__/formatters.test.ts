import {
  formatNumber,
  formatPercent,
  calculatePercentNumber,
} from "../formatters";

describe("formatters utility", () => {
  describe("formatNumber", () => {
    it("formats integer according to Indonesian locale", () => {
      expect(formatNumber(1000)).toBe("1.000");
      expect(formatNumber(1189)).toBe("1.189");
      expect(formatNumber(0)).toBe("0");
    });

    it("handles invalid or non-finite numbers safely", () => {
      expect(formatNumber(NaN)).toBe("0");
      expect(formatNumber(Infinity)).toBe("0");
    });
  });

  describe("formatPercent", () => {
    it("formats percentage with specified fraction digits", () => {
      expect(formatPercent(50, 100)).toBe("50");
      expect(formatPercent(1, 3)).toBe("33,3");
      expect(formatPercent(10, 20, 2)).toBe("50");
    });

    it("returns 0 when total is zero or negative", () => {
      expect(formatPercent(10, 0)).toBe("0");
      expect(formatPercent(10, -5)).toBe("0");
    });

    it("handles invalid inputs safely", () => {
      expect(formatPercent(NaN, 100)).toBe("0");
    });
  });

  describe("calculatePercentNumber", () => {
    it("calculates numeric percentage clamped between 0 and 100", () => {
      expect(calculatePercentNumber(25, 100)).toBe(25);
      expect(calculatePercentNumber(150, 100)).toBe(100);
      expect(calculatePercentNumber(-10, 100)).toBe(0);
      expect(calculatePercentNumber(0, 0)).toBe(0);
    });
  });
});

