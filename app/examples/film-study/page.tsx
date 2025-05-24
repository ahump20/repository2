"use client";

import React from "react";
import FilmStudy from "../../components/film-study";
import { curhanData } from "./playerData";
import styles from "./page.module.css";

const FilmStudyPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>{curhanData.name} Film Study</h1>
        <FilmStudy clips={curhanData.filmClips} />
      </div>
    </main>
  );
};

export default FilmStudyPage;
