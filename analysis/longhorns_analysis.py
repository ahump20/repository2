import pandas as pd

# Example dataset showing how to structure historical data for analysis
# Each row represents a single year for a given sport
# Columns: Year, Sport, HeadCoach, DonorContributions (USD),
#          StateEconomicIndex (arbitrary scale), UniversityPresident,
#          AthleticDirector, RecordWins, RecordLosses

example_data = [
    [2005, "football", "Mack Brown", 50000000, 1.7, "William Powers", "DeLoss Dodds", 13, 0],
    [2010, "football", "Mack Brown", 40000000, 1.4, "William Powers", "DeLoss Dodds", 5, 7],
    [1983, "baseball", "Cliff Gustafson", 3000000, 1.2, "William Cunningham", "DeLoss Dodds", 66, 14],
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

# Calculate correlation between donor dollars and wins to illustrate analysis
corr = football_df["DonorContributions"].corr(football_df["RecordWins"])
print(f"Correlation between donations and wins: {corr:.2f}")

# TODO: extend analysis with more complex models
