import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

os.makedirs('figures', exist_ok=True)
sns.set_theme(style='whitegrid', font_scale=1.1)
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['axes.edgecolor'] = '#cccccc'
plt.rcParams['axes.linewidth'] = 0.8

# 1. Load Cleaned Dataset
df = pd.read_csv('data/cleaned/cleaned_air_quality.csv')
df['DateTime'] = pd.to_datetime(df['DateTime'])
df.set_index('DateTime', inplace=True)

# 2. Univariate Stats
pollutant_cols = ['CO(GT)', 'C6H6(GT)', 'NOx(GT)', 'NO2(GT)']
sensor_cols = ['PT08.S1(CO)', 'PT08.S2(NMHC)', 'PT08.S3(NOx)', 'PT08.S4(NO2)', 'PT08.S5(O3)']
weather_cols = ['T', 'RH', 'AH']

summary_df = df[pollutant_cols + sensor_cols + weather_cols].describe().T
summary_df['skewness'] = df[pollutant_cols + sensor_cols + weather_cols].skew()
summary_df['kurtosis'] = df[pollutant_cols + sensor_cols + weather_cols].kurtosis()
print("Univariate Summary Statistics:")
print(summary_df[['mean', 'std', 'min', '50%', 'max', 'skewness']])

# FIGURE 1: Full-period CO Timeseries
fig, ax = plt.subplots(figsize=(14, 5), dpi=300)
ax.plot(df.index, df['CO(GT)'], color='#0284c7', linewidth=0.8, alpha=0.85, label='Hourly CO(GT)')
# 7-day rolling average to show seasonal trend
df['CO_7d_rolling'] = df['CO(GT)'].rolling(24 * 7, min_periods=24).mean()
ax.plot(df.index, df['CO_7d_rolling'], color='#b91c1c', linewidth=2.0, label='7-Day Rolling Trend')
ax.set_title('AirWatch CO: Historical Carbon Monoxide Concentration (March 2004 – April 2005)', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('Timestamp', fontweight='bold')
ax.set_ylabel('CO(GT) Concentration (mg/m³)', fontweight='bold')
ax.legend(frameon=True, facecolor='white', loc='upper right')
fig.tight_layout()
fig.savefig('figures/01_co_full_timeseries.png')
plt.close(fig)
print("Saved figures/01_co_full_timeseries.png")

# FIGURE 2: Diurnal (Hourly) Cycle
hourly_stats = df.groupby('hour')['CO(GT)'].agg(['mean', 'std', 'median', lambda x: x.quantile(0.25), lambda x: x.quantile(0.75)])
hourly_stats.columns = ['mean', 'std', 'median', 'q25', 'q75']

fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
ax.plot(hourly_stats.index, hourly_stats['mean'], color='#0f766e', marker='o', linewidth=2.5, markersize=6, label='Mean CO')
ax.fill_between(hourly_stats.index, hourly_stats['q25'], hourly_stats['q75'], color='#0f766e', alpha=0.2, label='IQR (25th–75th Percentile)')
ax.set_xticks(range(0, 24))
ax.set_title('Diurnal Cycle: Hourly Profile of CO Concentration (Bimodal Traffic Peaks)', fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel('Hour of the Day (0–23)', fontweight='bold')
ax.set_ylabel('Mean CO(GT) (mg/m³)', fontweight='bold')
ax.axvspan(7.5, 9.5, color='#fbbf24', alpha=0.25, label='Morning Rush Hour (8-9 AM)')
ax.axvspan(18.0, 20.5, color='#f87171', alpha=0.25, label='Evening Rush Hour (6-8 PM)')
ax.legend(frameon=True, facecolor='white', loc='upper left')
fig.tight_layout()
fig.savefig('figures/02_co_diurnal_hourly.png')
plt.close(fig)
print("Saved figures/02_co_diurnal_hourly.png")

# FIGURE 3: Weekday vs Weekend Profile
weekday_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
df['day_name'] = df['day_of_week'].map(lambda d: weekday_names[d])
weekday_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
sns.boxplot(data=df, x='day_name', y='CO(GT)', order=weekday_order, palette='crest', ax=ax, showfliers=False, width=0.55)
ax.set_title('Weekly Distribution: CO Concentration Across Days of the Week', fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel('Day of the Week', fontweight='bold')
ax.set_ylabel('CO(GT) (mg/m³)', fontweight='bold')
fig.tight_layout()
fig.savefig('figures/03_co_weekday_pattern.png')
plt.close(fig)
print("Saved figures/03_co_weekday_pattern.png")

# FIGURE 4: Weather Relationships (T, RH, AH vs CO)
fig, axes = plt.subplots(1, 3, figsize=(16, 5), dpi=300)

sns.regplot(data=df.sample(2000, random_state=42), x='T', y='CO(GT)', ax=axes[0],
            scatter_kws={'alpha': 0.25, 'color': '#0284c7', 's': 15}, line_kws={'color': '#b91c1c', 'linewidth': 2})
axes[0].set_title(f'CO vs Temperature (r = {df["CO(GT)"].corr(df["T"]):.2f})', fontweight='bold')
axes[0].set_xlabel('Temperature (°C)')
axes[0].set_ylabel('CO(GT) (mg/m³)')

sns.regplot(data=df.sample(2000, random_state=42), x='RH', y='CO(GT)', ax=axes[1],
            scatter_kws={'alpha': 0.25, 'color': '#0d9488', 's': 15}, line_kws={'color': '#b91c1c', 'linewidth': 2})
axes[1].set_title(f'CO vs Relative Humidity (r = {df["CO(GT)"].corr(df["RH"]):.2f})', fontweight='bold')
axes[1].set_xlabel('Relative Humidity (%)')
axes[1].set_ylabel('CO(GT) (mg/m³)')

sns.regplot(data=df.sample(2000, random_state=42), x='AH', y='CO(GT)', ax=axes[2],
            scatter_kws={'alpha': 0.25, 'color': '#7c3aed', 's': 15}, line_kws={'color': '#b91c1c', 'linewidth': 2})
axes[2].set_title(f'CO vs Absolute Humidity (r = {df["CO(GT)"].corr(df["AH"]):.2f})', fontweight='bold')
axes[2].set_xlabel('Absolute Humidity')
axes[2].set_ylabel('CO(GT) (mg/m³)')

fig.suptitle('Meteorological Relationships with Carbon Monoxide', fontsize=14, fontweight='bold', y=1.03)
fig.tight_layout()
fig.savefig('figures/04_co_vs_weather.png')
plt.close(fig)
print("Saved figures/04_co_vs_weather.png")

# FIGURE 5: Correlation Heatmap
analysis_cols = ['CO(GT)', 'C6H6(GT)', 'NOx(GT)', 'NO2(GT)',
                 'PT08.S1(CO)', 'PT08.S2(NMHC)', 'PT08.S3(NOx)', 'PT08.S4(NO2)', 'PT08.S5(O3)',
                 'T', 'RH', 'AH']
corr_matrix = df[analysis_cols].corr()

fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
sns.heatmap(corr_matrix, mask=mask, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1,
            cbar_kws={'shrink': 0.8}, ax=ax, linewidths=0.5)
ax.set_title('Correlation Matrix: Pollutants, Chemical Sensors & Weather', fontsize=13, fontweight='bold', pad=12)
fig.tight_layout()
fig.savefig('figures/05_correlation_heatmap.png')
plt.close(fig)
print("Saved figures/05_correlation_heatmap.png")

# FIGURE 6: Missingness Before vs After Cleaning
raw_missing = {
    'CO(GT)': 17.99,
    'PT08.S1': 3.91,
    'NMHC(GT)': 90.23,
    'C6H6(GT)': 3.91,
    'PT08.S2': 3.91,
    'NOx(GT)': 17.52,
    'PT08.S3': 3.91,
    'NO2(GT)': 17.55,
    'PT08.S4': 3.91,
    'PT08.S5': 3.91,
    'Weather (T,RH,AH)': 3.91
}
cleaned_missing = {k: 0.0 for k in raw_missing.keys() if k != 'NMHC(GT)'}
cleaned_missing['NMHC(GT)'] = 100.0  # Dropped completely

missing_cmp = pd.DataFrame({
    'Raw Missing % (-200)': pd.Series(raw_missing),
    'Cleaned Missing %': pd.Series(cleaned_missing)
})

fig, ax = plt.subplots(figsize=(11, 5), dpi=300)
x = np.arange(len(missing_cmp))
width = 0.38

ax.bar(x - width/2, missing_cmp['Raw Missing % (-200)'], width, label='Raw Dataset (-200 Sentinel)', color='#ef4444', alpha=0.85)
ax.bar(x + width/2, missing_cmp['Cleaned Missing %'], width, label='After Preprocessing (Cleaned)', color='#10b981', alpha=0.85)
ax.set_xticks(x)
ax.set_xticklabels(missing_cmp.index, rotation=35, ha='right', fontweight='bold')
ax.set_ylabel('Missing Percentage (%)', fontweight='bold')
ax.set_title('Data Cleansing Audit: Missing Telemetry Before vs After Imputation', fontsize=13, fontweight='bold', pad=12)
ax.legend(frameon=True, facecolor='white')
fig.tight_layout()
fig.savefig('figures/06_missingness_before_after.png')
plt.close(fig)
print("Saved figures/06_missingness_before_after.png")

print("\nEDA Figures successfully generated.")
