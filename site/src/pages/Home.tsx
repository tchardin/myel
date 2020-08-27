import * as React from "react";
import styles from "./Home.module.css";

const NNCancas = React.lazy(() => import("../effects/NNCanvas"));

const Hero = () => {
  return (
    <main className={styles.main}>
      <div className={styles.titleContainer}>
        <NNCancas />
        <h1 className={styles.title}>Myel</h1>
        <p className={styles.subtitle}>
          Earn income with your computer's extra storage
        </p>
      </div>
    </main>
  );
};

export default Hero;
