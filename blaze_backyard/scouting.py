from typing import Dict

from .players import Pitcher


def summarize_pitcher(pitcher: Pitcher) -> Dict[str, str]:
    """Return a simple textual scouting summary for a pitcher."""
    distribution = pitcher.pitch_distribution
    main_pitch = max(distribution, key=distribution.get)
    summary = {
        "main_pitch": main_pitch,
        "fastball_pct": f"{distribution.get('fastball', 0)*100:.0f}%",
        "curve_pct": f"{distribution.get('curve', 0)*100:.0f}%",
    }
    return summary
