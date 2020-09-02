import React, { Suspense } from "react";
import styles from "./Home.module.css";
import Dashboard from "../assets/LatestDashboard.png";
import Dashboard2 from "../assets/LatestDashboard@2x.png";
import Dashboard3 from "../assets/LatestDashboard@3x.png";
import Illustration from "../assets/Illustration-03.png";
import IllustrationLowRes from "../assets/Illustration-03LowRes.png";
import DashboardLowRes from "../assets/LatestDashboardLowRes.png";
import ProgressiveImage from "../components/ProgressiveImage";

const EmailInput = React.lazy(() => import("../components/EmailInput"));
const NNCancas = React.lazy(() => import("../effects/NNCanvas"));

const Hero = () => {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <Suspense fallback={<div className={styles.titlePlaceholder} />}>
            <NNCancas />
          </Suspense>
          <h1 className={styles.title}>Myel</h1>
          <p className={styles.subtitle}>
            Earn income with your computer's extra storage
          </p>
          <section className={styles.section}>
            <p className={styles.info}>
              For anyone with lots of unused hard drive space, Myel makes
              getting up and running with{" "}
              <a
                className={styles.inlineLink}
                href="https://filecoin.io"
                rel="noopener noreferrer"
                target="_blank"
              >
                Filecoin
              </a>{" "}
              as simple as installing any desktop app.
            </p>
            <figure className={styles.sideImage}>
              <ProgressiveImage
                ratio="long"
                src={Illustration}
                plh={IllustrationLowRes}
                alt="Individual with a personal computer"
              />
            </figure>
          </section>
        </div>
        <figure className={styles.imgFigure}>
          <div className={styles.dashboardImg}>
            <ProgressiveImage
              srcSet={`${Dashboard} 1x, ${Dashboard2} 2x, ${Dashboard3} 3x, ${Dashboard}`}
              alt="Dashboard preview"
              plh={DashboardLowRes}
            />
          </div>
        </figure>
      </main>
      <div className={styles.formSection}>
        <Suspense fallback={null}>
          <EmailInput />
        </Suspense>
      </div>
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
