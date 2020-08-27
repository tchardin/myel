import React, { Suspense } from "react";
import styles from "./Home.module.css";

import EmailInput from "../components/EmailInput";

const NNCancas = React.lazy(() => import("../effects/NNCanvas"));

const Hero = () => {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <Suspense fallback={null}>
            <NNCancas />
          </Suspense>
          <h1 className={styles.title}>Myel</h1>
          <p className={styles.subtitle}>
            Earn income with your computer's extra storage
          </p>
        </div>
        <EmailInput />
      </main>
      <footer className={styles.footer}>
        <nav className={styles.footerNav}>
          <a className={styles.link} href="https://github.com/tchardin/myel">
            Github
          </a>
        </nav>
      </footer>
    </>
  );
};

export default Hero;
