import { Accelerometer } from "expo-sensors";
import { getRandomChapter, subscribeToShakeGesture } from "../sensorService";

jest.mock("expo-sensors", () => ({
  Accelerometer: {
    addListener: jest.fn(),
    setUpdateInterval: jest.fn(),
  },
}));

describe("accelerometer shake service", () => {
  const remove = jest.fn();
  let onSample: ((sample: { x: number; y: number; z: number }) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    onSample = undefined;
    (Accelerometer.addListener as jest.Mock).mockImplementation((listener) => {
      onSample = listener;
      return { remove };
    });
    jest.spyOn(Date, "now").mockReturnValue(10_000);
  });

  afterEach(() => jest.restoreAllMocks());

  it("sets a sampling interval, ignores ordinary movement, and emits a canonical chapter on shake", () => {
    const onShake = jest.fn();
    subscribeToShakeGesture(onShake, 2);
    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(150);
    onSample?.({ x: 0, y: 0, z: 1 });
    expect(onShake).not.toHaveBeenCalled();
    onSample?.({ x: 2.1, y: 0, z: 0 });
    expect(onShake).toHaveBeenCalledTimes(1);
    expect(onShake.mock.calls[0][0]).toEqual(expect.objectContaining({
      bookId: expect.any(String), bookName: expect.any(String), chapter: expect.any(Number),
    }));
  });

  it("debounces repeated shake samples and allows another after cooldown", () => {
    const onShake = jest.fn();
    subscribeToShakeGesture(onShake);
    onSample?.({ x: 3, y: 0, z: 0 });
    jest.spyOn(Date, "now").mockReturnValue(11_000);
    onSample?.({ x: 3, y: 0, z: 0 });
    expect(onShake).toHaveBeenCalledTimes(1);
    jest.spyOn(Date, "now").mockReturnValue(11_501);
    onSample?.({ x: 3, y: 0, z: 0 });
    expect(onShake).toHaveBeenCalledTimes(2);
  });

  it("removes the native listener during cleanup", () => {
    const stop = subscribeToShakeGesture(jest.fn());
    stop();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("returns a destination within the bundled book and chapter ranges", () => {
    const destination = getRandomChapter();
    expect(destination.bookId).toEqual(expect.any(String));
    expect(destination.bookName).toEqual(expect.any(String));
    expect(destination.chapter).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(destination.chapter)).toBe(true);
  });

  it("selects only from the supplied local Bible metadata and respects its chapter bounds", () => {
    const localBooks = [
      { id: "yohanes", name: "Yohanes", canonicalOrder: 1, chapters: [{ number: 1, verses: [] }] },
      {
        id: "filemon",
        name: "Filemon",
        canonicalOrder: 2,
        chapters: Array.from({ length: 4 }, (_, index) => ({ number: index + 1, verses: [] })),
      },
    ];
    jest.spyOn(Math, "random").mockReturnValueOnce(0.999).mockReturnValueOnce(0.999);

    expect(getRandomChapter(localBooks)).toEqual({
      bookId: "filemon",
      bookName: "Filemon",
      chapter: 4,
    });
  });
});
