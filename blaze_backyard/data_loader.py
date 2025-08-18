import csv
from pathlib import Path
from typing import List

from .players import Player, Pitcher


def load_players(csv_path: Path) -> List[Player]:
    players = []
    with csv_path.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            players.append(Player(
                name=row.get("name", "Unknown"),
                contact=int(row.get("contact", 50)),
                power=int(row.get("power", 50)),
            ))
    return players


def load_pitchers(csv_path: Path) -> List[Pitcher]:
    pitchers = []
    with csv_path.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            distribution = {
                "fastball": float(row.get("fastball", 0.5)),
                "curve": float(row.get("curve", 0.3)),
                "change": float(row.get("change", 0.2)),
            }
            hot_zones = {
                "high": float(row.get("high", 0.33)),
                "middle": float(row.get("middle", 0.33)),
                "low": float(row.get("low", 0.34)),
            }
            pitchers.append(Pitcher(
                name=row.get("name", "Unknown"),
                pitch_distribution=distribution,
                hot_zones=hot_zones,
            ))
    return pitchers
