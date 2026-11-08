import pandas as pd
import sys

print("Python version:", sys.version)

file_path = "dataset/air+quality/AirQualityUCI.csv"
print(f"Loading {file_path} ...")

df = pd.read_csv(file_path, sep=';', decimal=',')
print("Shape before cleaning empty columns/rows:", df.shape)
print("\nColumns:", df.columns.tolist())
print("\nFirst 3 rows:")
print(df.head(3))

# Check trailing unnamed columns
unnamed = [col for col in df.columns if 'Unnamed' in col]
print(f"\nTrailing Unnamed columns detected: {unnamed}")

print("\nSmoke test passed successfully!")
