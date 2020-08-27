import React, { useState } from "react";
import styles from "./EmailInput.module.css";
import fleekStorage from "@fleekhq/fleek-storage-js";
import cn from "classnames";

const credentials = {
  apiKey: process.env.REACT_APP_FLEEK_KEY!,
  apiSecret: process.env.REACT_APP_FLEEK_SECRET!,
};
const FILE_KEY = "myel-email-list.json";

const EmailInput = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error && e.target.value.length) {
      setError(false);
    }
  };
  const postEmail = async () => {
    let currentList = [];
    try {
      const { data } = await fleekStorage.get({
        ...credentials,
        key: FILE_KEY,
      });
      const decoded = new TextDecoder("utf-8").decode(data);
      currentList = JSON.parse(decoded).emails;
    } catch (e) {
      console.log(e);
    }
    try {
      const file = JSON.stringify({
        emails: currentList.concat([email]),
      });
      await fleekStorage.upload({
        ...credentials,
        key: FILE_KEY,
        data: file,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email?.length) {
      setError(true);
    } else {
      setSuccess(true);
      postEmail();
    }
  };
  return success ? (
    <p className={styles.success}>
      <span role="img" aria-label="Thumbs up">
        👍
      </span>{" "}
      - Thanks we'll be in touch soon!
    </p>
  ) : (
    <form className={styles.form}>
      <input
        name="email"
        placeholder="Email"
        value={email}
        onChange={change}
        className={cn(styles.input, error ? styles.inputError : "")}
      />
      <button type="submit" className={styles.button} onClick={submit}>
        Get early access
      </button>
    </form>
  );
};

export default EmailInput;
