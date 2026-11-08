import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import root_mean_squared_error, mean_absolute_error, r2_score

os.makedirs('figures', exist_ok=True)
sns.set_theme(style='whitegrid', font_scale=1.05)

df = pd.read_csv('data/cleaned/cleaned_air_quality.csv')

features = [
    'CO(GT)', 'C6H6(GT)', 'NOx(GT)', 'NO2(GT)',
    'PT08.S1(CO)', 'PT08.S2(NMHC)', 'PT08.S3(NOx)', 'PT08.S4(NO2)', 'PT08.S5(O3)',
    'T', 'RH', 'AH',
    'hour', 'day_of_week', 'month', 'is_weekend',
    'hour_sin', 'hour_cos', 'month_sin', 'month_cos',
    'CO_lag1', 'CO_lag2', 'CO_lag3', 'CO_rolling_mean_3h',
    'PT08_S1_lag1', 'PT08_S2_lag1', 'T_lag1', 'RH_lag1'
]
target = 'CO_next'

train_df = df[df['split'] == 'train']
val_df = df[df['split'] == 'val']
test_df = df[df['split'] == 'test']

X_train, y_train = train_df[features], train_df[target]
X_val, y_val = val_df[features], val_df[target]
X_test, y_test = test_df[features], test_df[target]

# Train models
hgb = HistGradientBoostingRegressor(max_iter=100, max_depth=8, random_state=42)
hgb.fit(X_train, y_train)

lin_pipe = Pipeline([('scaler', StandardScaler()), ('reg', LinearRegression())])
lin_pipe.fit(X_train, y_train)

# Predictions
y_val_baseline = X_val['CO(GT)']
y_val_lin = lin_pipe.predict(X_val)
y_val_hgb = hgb.predict(X_val)

y_test_baseline = X_test['CO(GT)']
y_test_lin = lin_pipe.predict(X_test)
y_test_hgb = hgb.predict(X_test)

# FIGURE 7: Comparison Bar Chart
models = ['Baseline', 'Linear Reg', 'HistGradientBoost']
val_rmse = [root_mean_squared_error(y_val, y_val_baseline), root_mean_squared_error(y_val, y_val_lin), root_mean_squared_error(y_val, y_val_hgb)]
test_rmse = [root_mean_squared_error(y_test, y_test_baseline), root_mean_squared_error(y_test, y_test_lin), root_mean_squared_error(y_test, y_test_hgb)]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.8), dpi=300)
x = np.arange(len(models))
width = 0.35

ax1.bar(x - width/2, val_rmse, width, label='Validation RMSE', color='#0284c7')
ax1.bar(x + width/2, test_rmse, width, label='Test RMSE', color='#0f766e')
ax1.set_xticks(x)
ax1.set_xticklabels(models, fontweight='bold')
ax1.set_ylabel('RMSE (mg/m³)', fontweight='bold')
ax1.set_title('Root Mean Squared Error (Lower is Better)', fontsize=12, fontweight='bold')
ax1.legend(frameon=True, facecolor='white')

val_r2 = [r2_score(y_val, y_val_baseline), r2_score(y_val, y_val_lin), r2_score(y_val, y_val_hgb)]
test_r2 = [r2_score(y_test, y_test_baseline), r2_score(y_test, y_test_lin), r2_score(y_test, y_test_hgb)]

ax2.bar(x - width/2, val_r2, width, label='Validation R²', color='#0284c7')
ax2.bar(x + width/2, test_r2, width, label='Test R²', color='#0f766e')
ax2.set_xticks(x)
ax2.set_xticklabels(models, fontweight='bold')
ax2.set_ylabel('R² Score', fontweight='bold')
ax2.set_title('Goodness of Fit R² (Higher is Better)', fontsize=12, fontweight='bold')
ax2.set_ylim(0, 1.0)
ax2.legend(frameon=True, facecolor='white')

fig.suptitle('Candidate Models Performance Comparison', fontsize=14, fontweight='bold', y=1.02)
fig.tight_layout()
fig.savefig('figures/07_model_comparison_metrics.png')
plt.close(fig)
print("Saved figures/07_model_comparison_metrics.png")

# FIGURE 8: Actual vs Predicted Scatter
fig, ax = plt.subplots(figsize=(7, 7), dpi=300)
ax.scatter(y_test, y_test_hgb, alpha=0.35, color='#0284c7', edgecolors='none', s=25, label='Test Observations')
max_val = max(y_test.max(), y_test_hgb.max()) + 0.5
ax.plot([0, max_val], [0, max_val], 'r--', linewidth=2, label='Perfect Prediction Line (y = x)')
ax.set_title('HistGradientBoosting: Actual vs Predicted Next-Hour CO(GT)', fontsize=12, fontweight='bold', pad=10)
ax.set_xlabel('Actual Next-Hour CO(GT) (mg/m³)', fontweight='bold')
ax.set_ylabel('Predicted Next-Hour CO(GT) (mg/m³)', fontweight='bold')
ax.set_xlim(0, max_val)
ax.set_ylim(0, max_val)
ax.legend(frameon=True, facecolor='white')
fig.tight_layout()
fig.savefig('figures/08_actual_vs_predicted.png')
plt.close(fig)
print("Saved figures/08_actual_vs_predicted.png")

# FIGURE 9: Residuals Distribution
residuals = y_test - y_test_hgb
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5), dpi=300)

sns.histplot(residuals, kde=True, color='#0f766e', ax=ax1, bins=35)
ax1.axvline(0, color='red', linestyle='--', linewidth=1.5)
ax1.set_title(f'Test Residuals Distribution (Mean = {residuals.mean():.3f})', fontweight='bold')
ax1.set_xlabel('Residual: Actual - Predicted (mg/m³)')
ax1.set_ylabel('Frequency')

ax2.scatter(y_test_hgb, residuals, alpha=0.3, color='#7c3aed', s=20)
ax2.axhline(0, color='red', linestyle='--', linewidth=1.5)
ax2.set_title('Residuals vs Fitted Values', fontweight='bold')
ax2.set_xlabel('Predicted CO(GT) (mg/m³)')
ax2.set_ylabel('Residual (mg/m³)')

fig.suptitle('HistGradientBoosting: Model Residual Diagnostics on Test Set', fontsize=14, fontweight='bold', y=1.02)
fig.tight_layout()
fig.savefig('figures/09_model_residuals.png')
plt.close(fig)
print("Saved figures/09_model_residuals.png")

# Linear Regression Coefficients
lin_coefs = pd.Series(lin_pipe.named_steps['reg'].coef_, index=features).sort_values(ascending=False)
print("\nTop 5 Positive Coefficients in Linear Model:")
print(lin_coefs.head(5))
print("\nTop 5 Negative Coefficients in Linear Model:")
print(lin_coefs.tail(5))
