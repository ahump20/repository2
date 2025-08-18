from dataclasses import dataclass, field
from typing import Dict

@dataclass
class Player:
    name: str
    contact: int
    power: int
    tendencies: Dict[str, float] = field(default_factory=dict)
    xp: int = 0

    def improve(self, contact_delta: int = 0, power_delta: int = 0):
        self.contact += contact_delta
        self.power += power_delta
        self.xp += contact_delta + power_delta

@dataclass
class Pitcher:
    name: str
    pitch_distribution: Dict[str, float]
    hot_zones: Dict[str, float]
