import React, { useState } from "react";
import styles from "./ImageStyles.module.css";
import cn from "classnames";

type ProgressiveImageProps = {
  src?: string;
  srcSet?: string;
  ratio?: "high" | "long";
  alt: string;
  plh: string;
};

const ProgressiveImage = ({
  src,
  srcSet,
  alt,
  plh,
  ratio,
}: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={cn(
        styles.container,
        ratio === "long" ? styles.long : styles.high
      )}
    >
      <img alt={alt} src={plh} className={styles.placeholder} />
      <img
        src={src}
        srcSet={srcSet}
        alt={alt}
        className={cn(styles.final, loaded ? styles.show : "")}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ProgressiveImage;
