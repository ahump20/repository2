export interface SportCategory {
  id: string;
  name: string;
}

export const sportsCategories: SportCategory[] = [
  { id: "college", name: "College Sports" },
  { id: "nil", name: "Name, Image, Likeness" },
  { id: "mlb", name: "Major League Baseball" },
  { id: "nfl", name: "National Football League" },
  { id: "nba", name: "National Basketball Association" },
  { id: "high-school-football", name: "High School Football" },
  { id: "perfect-game", name: "Perfect Game Baseball" }
];
