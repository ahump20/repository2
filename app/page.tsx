"use client";

import React from "react";
import styles from "./page.module.css";
import { sportsCategories } from "./sports/categories";

const Home = () => {
  return (
    <main className={styles.main}>
      <div className={styles.title}>Blaze Intelligence Research Portal</div>
      <div className={styles.container}>
        <a className={styles.category} href="/minecraft">
          BlazeCraft Prototype
        </a>
        {sportsCategories.map((cat) => (
          <a key={cat.id} className={styles.category} href={`/sports/${cat.id}`}>
            {cat.name}
          </a>
        ))}
      </div>
    </main>
  );
};

export default Home;
