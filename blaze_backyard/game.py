from pathlib import Path
from typing import List
import random

from .data_loader import load_players, load_pitchers
from .players import Player, Pitcher
from .scouting import summarize_pitcher


class Game:
    def __init__(self, players: List[Player], pitchers: List[Pitcher]):
        self.players = players
        self.pitchers = pitchers
        self.current_player: Player | None = None
        self.current_pitcher: Pitcher | None = None

    def scout(self):
        self.current_pitcher = random.choice(self.pitchers)
        print(f"Scouting report for {self.current_pitcher.name}:")
        report = summarize_pitcher(self.current_pitcher)
        for k, v in report.items():
            print(f"  {k}: {v}")

    def prepare(self):
        self.current_player = random.choice(self.players)
        print(f"Selected batter: {self.current_player.name} (Contact {self.current_player.contact}, Power {self.current_player.power})")

    def perform(self):
        if not self.current_player or not self.current_pitcher:
            print("Missing player or pitcher")
            return
        timing = random.random()
        contact_chance = (self.current_player.contact / 100) * (1 - abs(0.5 - timing))
        if random.random() < contact_chance:
            print("Hit! Great swing.")
            self.current_player.improve(contact_delta=1)
        else:
            print("Missed. Better luck next time.")

    def analyze(self):
        if not self.current_player:
            return
        print(f"Player XP: {self.current_player.xp}, Contact now {self.current_player.contact}")


def default_players():
    return [Player("Default Batter", 50, 50)]

def default_pitchers():
    return [Pitcher(
        "Default Pitcher",
        {"fastball": 0.5, "curve": 0.3, "change": 0.2},
        {"high": 0.3, "middle": 0.4, "low": 0.3}
    )]

def main():
    players = load_players(Path("players.csv")) if Path("players.csv").exists() else default_players()
    pitchers = load_pitchers(Path("pitchers.csv")) if Path("pitchers.csv").exists() else default_pitchers()
    game = Game(players, pitchers)
    game.scout()
    game.prepare()
    game.perform()
    game.analyze()


if __name__ == "__main__":
    main()
