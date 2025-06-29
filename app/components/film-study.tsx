"use client";

import React from "react";
import styles from "./film-study.module.css";

export type Clip = {
  metric: string; // which metric the clip highlights
  context: string; // short description of the play
  url: string; // video url with timestamp
};

type Props = {
  clips: Clip[];
};

const FilmStudy = ({ clips }: Props) => {
  return (
    <div className={styles.container}>
      {clips.map((clip, idx) => (
        <div key={idx} className={styles.clip}>
          <div className={styles.metric}>{clip.metric}</div>
          <div className={styles.context}>{clip.context}</div>
          <a
            className={styles.link}
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch clip
          </a>
        </div>
      ))}
    </div>
  );
};

export default FilmStudy;
