import React, { useState } from "react";
import styles from "./EmailInput.module.css";
import fleekStorage from "@fleekhq/fleek-storage-js";
import cn from "classnames";

const credentials = {
  apiKey: process.env.REACT_APP_FLEEK_KEY!,
  apiSecret: process.env.REACT_APP_FLEEK_SECRET!,
};
const FILE_KEY = "email.json";

const ActivityIndicator = () => {
  return (
    <div
      className={styles.activityIndicator}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={1}
    >
      <svg height="100%" viewBox="0 0 32 32" width="100%">
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          strokeWidth="4"
          stroke="#406098"
          opacity="0.2"
        />
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          strokeWidth="4"
          stroke="#406098"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
    </div>
  );
};

const EmailInput = () => {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [cid, setCid] = useState("");
  const [error, setError] = useState(false);
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error && e.target.value.length) {
      setError(false);
    }
  };
  const postEmail = async () => {
    try {
      const { hash } = await fleekStorage.upload({
        ...credentials,
        key: `${email?.split("@")[0]}-${FILE_KEY}`,
        data: email,
      });
      setCid(hash);
    } catch (e) {
      console.log(e);
    }
  };
  const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email?.length) {
      setError(true);
    } else {
      setPending(true);
      postEmail();
    }
  };
  return !!cid ? (
    <div className={styles.successContainer}>
      <p className={styles.success}>
        <span role="img" aria-label="Thumbs up">
          👍
        </span>{" "}
        - Thanks we'll be in touch soon!
      </p>
      <p className={styles.subSuccess}>
        Myel is a decentralized application, all our code is auditable on our{" "}
        <a
          href="https://github.com/tchardin/myel"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.inlineLink}
        >
          Github
        </a>
        . We won't share your data with anyone else. Your email hash is: <br />{" "}
        <code>{cid}</code>.
      </p>
    </div>
  ) : (
    <form className={styles.form}>
      <input
        name="email"
        placeholder="Email"
        value={email}
        onChange={change}
        className={cn(styles.input, error ? styles.inputError : "")}
      />
      {pending && <ActivityIndicator />}
      <button
        type="submit"
        className={styles.button}
        onClick={submit}
        disabled={pending}
      >
        Get early access
      </button>
    </form>
  );
};

export default EmailInput;
