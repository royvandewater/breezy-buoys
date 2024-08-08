import { Screen } from "excalibur";

/** @param {Screen} screen  */
export const calculateExPixelConversion = (screen) => {
  const origin = screen.worldToPageCoordinates(Vector.Zero);
  const singlePixel = screen.worldToPageCoordinates(vec(1, 0)).sub(origin);
  const pixelConversion = singlePixel.x;
  document.documentElement.style.setProperty(
    "--pixel-conversion",
    pixelConversion.toString()
  );
};
