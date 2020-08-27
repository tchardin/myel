import React, { useState } from "react";
import styles from "./EmailInput.module.css";
import cn from "classnames";

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
  const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email?.length) {
      setError(true);
    } else {
      setSuccess(true);
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
