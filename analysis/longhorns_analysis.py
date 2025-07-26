import pandas as pd
import numpy as np

# Example dataset showing how to structure historical data for analysis
# Each row represents a single year for a given sport
# Columns: Year, Sport, HeadCoach, DonorContributions (USD),
#          StateEconomicIndex (arbitrary scale), UniversityPresident,
#          AthleticDirector, RecordWins, RecordLosses

example_data = [
    # Year, Sport, HeadCoach, DonorContributions (USD),
    # StateEconomicIndex (arbitrary scale), UniversityPresident,
    # AthleticDirector, RecordWins, RecordLosses
    [2005, "football", "Mack Brown", 50_000_000, 1.7, "William Powers", "DeLoss Dodds", 13, 0],
    [2010, "football", "Mack Brown", 40_000_000, 1.4, "William Powers", "DeLoss Dodds", 5, 7],
    [1983, "baseball", "Cliff Gustafson", 3_000_000, 1.2, "William Cunningham", "DeLoss Dodds", 66, 14],
    [1970, "football", "Darrell Royal", 2_500_000, 1.1, "Norman Hackerman", "Darrell Royal", 10, 1],
]

df = pd.DataFrame(
    example_data,
    columns=[
        "Year",
        "Sport",
        "HeadCoach",
        "DonorContributions",
        "StateEconomicIndex",
        "UniversityPresident",
        "AthleticDirector",
        "RecordWins",
        "RecordLosses",
    ],
)

# Filter for football entries only
football_df = df[df["Sport"] == "football"]

# Example 1: correlation between donor support and wins
donor_win_corr = football_df["DonorContributions"].corr(football_df["RecordWins"])
print(f"Correlation between donations and wins: {donor_win_corr:.2f}")

# Example 2: average wins by university president
avg_wins_by_president = (
    football_df.groupby("UniversityPresident")["RecordWins"].mean().reset_index()
)
print("\nAverage football wins by university president:\n", avg_wins_by_president)

# Example 3: simple linear regression of wins on donor dollars
x = football_df["DonorContributions"].values.astype(float)
y = football_df["RecordWins"].values.astype(float)

# Add intercept column for linear regression
X = np.vstack([np.ones_like(x), x]).T
coeffs = np.linalg.lstsq(X, y, rcond=None)[0]
intercept, slope = coeffs
predicted_wins = intercept + slope * x

print("\nLinear regression: wins = {:.2f} + {:.8f} * donor_dollars".format(intercept, slope))

# Display actual vs predicted wins for reference
comparison = football_df[["Year", "HeadCoach", "RecordWins"]].copy()
comparison["PredictedWins"] = predicted_wins.round(2)
print("\nActual vs predicted wins:\n", comparison)

# TODO: extend analysis with more complex models
