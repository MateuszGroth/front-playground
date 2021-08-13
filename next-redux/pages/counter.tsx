import type { NextPage } from "next";
import Link from "next/link";
import Counter from "../features/counter/Counter";
import styles from "../styles/Home.module.css";

const CounterPage: NextPage = () => {
  return (
    <div className={styles.container}>
      <Counter />
      <Link href="/">
        <a>Back to home</a>
      </Link>
    </div>
  );
};

export default CounterPage;
