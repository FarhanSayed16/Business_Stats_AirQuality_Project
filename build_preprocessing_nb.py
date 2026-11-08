import os
import nbformat as nbf

nb = nbf.v4.new_notebook()
cells = []

# Title & Metadata
cells.append(nbf.v4.new_markdown_cell("""# AirWatch CO: 01. Data Preprocessing & Feature Engineering
**MCA I Statistics Internal Assessment | Group 3 — Air Quality and Pollution**

### Objectives of this Notebook:
1. **Raw Ingestion & Schema Alignment:** Correctly handle European delimiter (`;`) and decimal (`,`) formatting.
2. **Missingness Identification:** Detect and treat hardware sentinel error values (`-200`) across all chemical sensors and reference instruments.
3. **Data Quality & Imputation Decisions:** Document and justify dropping columns with prohibitive missingness (e.g. `NMHC(GT)` >90% missing) and apply time-aware linear interpolation for continuous sensors.
4. **Target Formulation & Anti-Leakage Rules:** Construct next-hour forecast target $\\text{CO\\_next} = \\text{CO(GT)}_{t+1}$ using strictly information available at hour $t$.
5. **Feature Engineering:** Build calendar components, cyclical hour/month encodings, lag variables ($t-1, t-2, t-3$), and rolling statistics.
6. **Chronological Splitting:** Establish strict temporal partitions (70% Train, 15% Validation, 15% Test) without temporal data leakage.
7. **Cleaned Dataset Export:** Persist `data/cleaned/cleaned_air_quality.csv` as the single source of truth for EDA, modeling, and API endpoints.
"""))

# 1. Setup & Imports
cells.append(nbf.v4.new_markdown_cell("## 1. Setup & Environment Imports"))
cells.append(nbf.v4.new_code_cell("""import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 40)
print('Environment ready.')"""))

# 2. Ingesting Raw Data
cells.append(nbf.v4.new_markdown_cell("""## 2. Ingesting Raw UCI Air Quality Data

The UCI Air Quality dataset contains hourly observations recorded from March 2004 to April 2005.
Format considerations:
- Semicolon (`;`) column separators.
- Comma (`,`) decimal numbers.
- Trailing delimiter artifacts creating empty columns.
"""))
cells.append(nbf.v4.new_code_cell("""raw_path = '../dataset/air+quality/AirQualityUCI.csv'
df_raw = pd.read_csv(raw_path, sep=';', decimal=',')
print('Raw shape:', df_raw.shape)
print('Raw columns:', list(df_raw.columns))
df_raw.head(3)"""))

# 3. Parsing Datetime and Dropping Artifacts
cells.append(nbf.v4.new_markdown_cell("""## 3. Timestamp Parsing & Structural Cleansing

1. Filter out `Unnamed: 15` and `Unnamed: 16`.
2. Filter out trailing empty rows without timestamps.
3. Combine `Date` and `Time` into a unified, chronological `DateTime` index.
"""))
cells.append(nbf.v4.new_code_cell("""empty_cols = [c for c in df_raw.columns if 'Unnamed' in c]
df_clean = df_raw.drop(columns=empty_cols).dropna(how='all', subset=['Date', 'Time']).copy()

# Parse Datetime
clean_time = df_clean['Time'].astype(str).str.replace('.', ':', regex=False)
df_clean['DateTime'] = pd.to_datetime(df_clean['Date'] + ' ' + clean_time, format='%d/%m/%Y %H:%M:%S')
df_clean = df_clean.sort_values('DateTime').reset_index(drop=True)

print(f'Valid hourly timestamps: {len(df_clean):,}')
print(f'Observation window: {df_clean["DateTime"].min()} to {df_clean["DateTime"].max()}')
print(f'Duplicates: {df_clean["DateTime"].duplicated().sum()}')"""))

# 4. Hardware Sentinel Value (-200) Handling
cells.append(nbf.v4.new_markdown_cell("""## 4. Hardware Sentinel Value (`-200`) Handling

Hardware sensors and analyzers output `-200` to indicate missing/invalid telemetry. We replace all `-200` with `NaN` and inspect missingness percentages.
"""))
cells.append(nbf.v4.new_code_cell("""num_cols = df_clean.select_dtypes(include=[np.number]).columns
df_clean[num_cols] = df_clean[num_cols].replace(-200.0, np.nan)

missing_profile = pd.DataFrame({
    'Missing_Count': df_clean[num_cols].isna().sum(),
    'Missing_Pct': (df_clean[num_cols].isna().mean() * 100).round(2)
}).sort_values('Missing_Pct', ascending=False)

missing_profile"""))

# 5. Dropping NMHC(GT)
cells.append(nbf.v4.new_markdown_cell("""## 5. Column Pruning Decision: `NMHC(GT)`

* `NMHC(GT)` is missing **90.23%** of its values (8,443 / 9,357 records).
* Imputing >90% of a column produces arbitrary noise.
* We drop `NMHC(GT)`. Sensor `PT08.S2(NMHC)` remains available as an alternative proxy.
* We also create a copy `CO_GT_raw` to preserve un-imputed ground truth CO.
"""))
cells.append(nbf.v4.new_code_cell("""df_clean['CO_GT_raw'] = df_clean['CO(GT)']
df_clean = df_clean.drop(columns=['NMHC(GT)'])
print('Remaining features after dropping NMHC(GT):', df_clean.shape[1])"""))

# 6. Time-Aware Imputation
cells.append(nbf.v4.new_markdown_cell("""## 6. Time-Aware Imputation Strategy

For continuous time-series sensor data, short gaps are imputed via **time-based linear interpolation** (`limit=6`), followed by bounded forward and backward fill.
"""))
cells.append(nbf.v4.new_code_cell("""df_clean.index = df_clean['DateTime']
clean_numeric = [c for c in df_clean.select_dtypes(include=[np.number]).columns if c != 'CO_GT_raw']

# Linear interpolation over time for short gaps
df_clean[clean_numeric] = df_clean[clean_numeric].interpolate(method='time', limit=6).ffill().bfill()

print('Remaining NaNs in cleaned numeric variables:')
print(df_clean[clean_numeric].isna().sum())"""))

# 7. Feature Engineering
cells.append(nbf.v4.new_markdown_cell("""## 7. Feature Engineering (Temporal, Cyclical & Autoregressive Lags)

We construct:
- **Calendar:** `hour`, `day_of_week`, `month`, `is_weekend`
- **Cyclical:** `hour_sin`, `hour_cos`, `month_sin`, `month_cos`
- **Autoregressive Lags:** `CO_lag1`, `CO_lag2`, `CO_lag3`
- **Rolling Stat:** `CO_rolling_mean_3h`
- **Sensor/Weather Lags:** `PT08_S1_lag1`, `PT08_S2_lag1`, `T_lag1`, `RH_lag1`
"""))
cells.append(nbf.v4.new_code_cell("""df_clean['hour'] = df_clean.index.hour
df_clean['day_of_week'] = df_clean.index.day_of_week
df_clean['month'] = df_clean.index.month
df_clean['is_weekend'] = (df_clean['day_of_week'] >= 5).astype(int)

df_clean['hour_sin'] = np.sin(2 * np.pi * df_clean['hour'] / 24.0)
df_clean['hour_cos'] = np.cos(2 * np.pi * df_clean['hour'] / 24.0)
df_clean['month_sin'] = np.sin(2 * np.pi * (df_clean['month'] - 1) / 12.0)
df_clean['month_cos'] = np.cos(2 * np.pi * (df_clean['month'] - 1) / 12.0)

# Lags
df_clean['CO_lag1'] = df_clean['CO(GT)'].shift(1)
df_clean['CO_lag2'] = df_clean['CO(GT)'].shift(2)
df_clean['CO_lag3'] = df_clean['CO(GT)'].shift(3)
df_clean['CO_rolling_mean_3h'] = df_clean['CO(GT)'].rolling(window=3, min_periods=1).mean()

df_clean['PT08_S1_lag1'] = df_clean['PT08.S1(CO)'].shift(1)
df_clean['PT08_S2_lag1'] = df_clean['PT08.S2(NMHC)'].shift(1)
df_clean['T_lag1'] = df_clean['T'].shift(1)
df_clean['RH_lag1'] = df_clean['RH'].shift(1)

print('Feature engineering complete. Total columns:', len(df_clean.columns))"""))

# 8. Target Formulation
cells.append(nbf.v4.new_markdown_cell("""## 8. Target Formulation: Next-Hour Carbon Monoxide

$$\\text{CO\\_next}_t = \\text{CO(GT)}_{t+1}$$

Predicting next hour's ground-truth CO concentration using only current and historical information.
"""))
cells.append(nbf.v4.new_code_cell("""df_clean['CO_next'] = df_clean['CO(GT)'].shift(-1)
df_clean['CO_next_raw'] = df_clean['CO_GT_raw'].shift(-1)

# Drop boundary rows (first 3 rows for lags 1-3, last row for target)
df_processed = df_clean.iloc[3:-1].copy()
print('Processed records for modelling:', len(df_processed))"""))

# 9. Chronological Splitting
cells.append(nbf.v4.new_markdown_cell("""## 9. Chronological Train / Validation / Test Splitting

We enforce time-ordered splits:
- **Train (70%):** Model calibration
- **Validation (15%):** Model comparison and hyperparameter tuning
- **Test (15%):** Final out-of-sample evaluation
"""))
cells.append(nbf.v4.new_code_cell("""n = len(df_processed)
train_end = int(n * 0.70)
val_end = int(n * 0.85)

df_processed['split'] = 'train'
df_processed.iloc[train_end:val_end, df_processed.columns.get_loc('split')] = 'val'
df_processed.iloc[val_end:, df_processed.columns.get_loc('split')] = 'test'

split_summary = df_processed.groupby('split').agg(
    records=('CO_next', 'count'),
    start_date=('DateTime', 'min'),
    end_date=('DateTime', 'max'),
    mean_CO=('CO(GT)', 'mean')
)
split_summary"""))

# 10. Export Cleaned Dataset
cells.append(nbf.v4.new_markdown_cell("""## 10. Export Cleaned Dataset

Save `data/cleaned/cleaned_air_quality.csv` to disk.
"""))
cells.append(nbf.v4.new_code_cell("""out_dir = '../data/cleaned'
os.makedirs(out_dir, exist_ok=True)
out_csv = os.path.join(out_dir, 'cleaned_air_quality.csv')
df_processed.to_csv(out_csv, index=False)
print(f'Saved cleaned dataset to: {out_csv} ({os.path.getsize(out_csv):,} bytes)')"""))

nb['cells'] = cells

with open('notebooks/01_preprocessing.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f)

print('Generated notebooks/01_preprocessing.ipynb successfully!')
