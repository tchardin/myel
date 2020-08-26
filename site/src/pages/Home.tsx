import * as React from "react";
import styles from "./Home.module.css";

const NNCancas = React.lazy(() => import("../effects/NNCanvas"));

const Hero = () => {
  return (
    <main className={styles.main}>
      <NNCancas />
      <h1 className={styles.title}>Myel</h1>
      <p className={styles.subtitle}>
        Earn extra income with your computer's extra storage
      </p>
    </main>
  );
};

export default Hero;
