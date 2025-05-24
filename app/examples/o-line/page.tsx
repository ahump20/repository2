"use client";

import React from "react";
import styles from "./page.module.css";
import OLineDashboard from "../../components/o-line-dashboard";

const OLinePage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <OLineDashboard />
      </div>
    </main>
  );
};

export default OLinePage;
