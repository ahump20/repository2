"use client";

import React from "react";
import styles from "./o-line-dashboard.module.css";

export interface Player {
  name: string;
  team: string;
  passBlockWinRate: number; // pass protection success percentage
  runBlockWinRate: number; // run blocking success percentage
  pressuresAllowed: number;
  sacksAllowed: number;
}

export type MetricKey =
  | "passBlockWinRate"
  | "runBlockWinRate"
  | "pressuresAllowed"
  | "sacksAllowed";

export interface Metric {
  key: MetricKey;
  label: string;
  isPercentage?: boolean;
}

const defaultMetrics: Metric[] = [
  { key: "passBlockWinRate", label: "Pass Block Win %", isPercentage: true },
  { key: "runBlockWinRate", label: "Run Block Win %", isPercentage: true },
  { key: "pressuresAllowed", label: "Pressures Allowed" },
  { key: "sacksAllowed", label: "Sacks Allowed" },
];

const samplePlayers: Player[] = [
  {
    name: "Trent Williams",
    team: "SF",
    passBlockWinRate: 92,
    runBlockWinRate: 89,
    pressuresAllowed: 12,
    sacksAllowed: 1,
  },
  {
    name: "Lane Johnson",
    team: "PHI",
    passBlockWinRate: 91,
    runBlockWinRate: 87,
    pressuresAllowed: 16,
    sacksAllowed: 0,
  },
  {
    name: "Zack Martin",
    team: "DAL",
    passBlockWinRate: 88,
    runBlockWinRate: 90,
    pressuresAllowed: 15,
    sacksAllowed: 2,
  },
  {
    name: "Quenton Nelson",
    team: "IND",
    passBlockWinRate: 87,
    runBlockWinRate: 85,
    pressuresAllowed: 20,
    sacksAllowed: 3,
  },
  {
    name: "Andrew Thomas",
    team: "NYG",
    passBlockWinRate: 89,
    runBlockWinRate: 84,
    pressuresAllowed: 18,
    sacksAllowed: 4,
  },
];

interface DashboardProps {
  players?: Player[];
  metrics?: Metric[];
}

const OLineDashboard: React.FC<DashboardProps> = ({
  players = samplePlayers,
  metrics = defaultMetrics,
}) => {
  return (
    <div className={styles.dashboard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            {metrics.map((metric) => (
              <th key={metric.key}>{metric.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.name}>
              <td>{player.name}</td>
              <td>{player.team}</td>
              {metrics.map((metric) => {
                const value = player[metric.key];
                return (
                  <td key={metric.key}>
                    {metric.isPercentage ? `${value}%` : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OLineDashboard;
