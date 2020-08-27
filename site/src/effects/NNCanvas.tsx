import * as React from "react";
import { useEffect, useRef } from "react";
import { CPPN } from "./cppn";
import styles from "./NNCanvas.module.css";

const DEFAULT_Z_SCALE = 1;
const NUM_NEURONS = 30;
const WEIGHTS_STDEV = 0.6;
const DEFAULT_NUM_LAYERS = 3;

function convertZScale(z: number): number {
  return 103 - z;
}

const NNCanvas = () => {
  const cppn = useRef<CPPN>();
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvas.current) {
      const c = new CPPN(canvas.current);
      c.setActivationFunction("sin");
      c.setNumLayers(DEFAULT_NUM_LAYERS);
      c.setZ1Scale(convertZScale(DEFAULT_Z_SCALE));
      c.setZ2Scale(convertZScale(DEFAULT_Z_SCALE));
      c.generateWeights(NUM_NEURONS, WEIGHTS_STDEV);
      c.start();
      cppn.current = c;
    }
  }, []);
  return <canvas ref={canvas} className={styles.canvas} />;
};
export default NNCanvas;
