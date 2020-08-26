import * as dl from "deeplearn";

export function createInputAtlas(
  imageSize: number,
  inputNumDimensions: number,
  numLatentVariables: number
) {
  const coords = new Float32Array(imageSize * imageSize * inputNumDimensions);
  let dst = 0;
  for (let i = 0; i < imageSize * imageSize; i++) {
    for (let d = 0; d < inputNumDimensions; d++) {
      const x = i % imageSize;
      const y = Math.floor(i / imageSize);
      const coord = imagePixelToNormalizedCoord(
        x,
        y,
        imageSize,
        imageSize,
        numLatentVariables
      );
      coords[dst++] = coord[d];
    }
  }

  return dl.tensor2d(coords, [imageSize * imageSize, inputNumDimensions]);
}

// Normalizes x, y to -.5 <=> +.5, adds a radius term, and pads zeros with the
// number of z parameters that will get added by the add z shader.
export function imagePixelToNormalizedCoord(
  x: number,
  y: number,
  imageWidth: number,
  imageHeight: number,
  zSize: number
): number[] {
  const halfWidth = imageWidth * 0.5;
  const halfHeight = imageHeight * 0.5;
  const normX = (x - halfWidth) / imageWidth;
  const normY = (y - halfHeight) / imageHeight;

  const r = Math.sqrt(normX * normX + normY * normY);

  const result = [normX, normY, r];

  return result;
}
