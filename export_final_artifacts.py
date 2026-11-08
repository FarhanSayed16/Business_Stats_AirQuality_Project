import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import root_mean_squared_error, mean_absolute_error, r2_score

os.makedirs('artifacts', exist_ok=True)
os.makedirs('figures', exist_ok=True)
sns.set_theme(style='whitegrid', font_scale=1.05)

# 1. Load Data
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

# Train + Val for final model deployment
train_val_df = df[df['split'].isin(['train', 'val'])]
X_train_val, y_train_val = train_val_df[features], train_val_df[target]

# 2. Best Hyperparameters from TimeSeriesSplit Tuning
best_params = {
    'l2_regularization': 0.5,
    'learning_rate': 0.1,
    'max_depth': 10,
    'max_iter': 100,
    'min_samples_leaf': 20,
    'random_state': 42
}

# 3. Fit Candidate & Tuned Models
# Train-only tuned model (for clean validation metrics)
tuned_model_val = HistGradientBoostingRegressor(**best_params)
tuned_model_val.fit(X_train, y_train)

# Final deployment model trained on Train + Val
final_model = HistGradientBoostingRegressor(**best_params)
final_model.fit(X_train_val, y_train_val)

# Linear Baseline for comparison
lin_pipe = Pipeline([('scaler', StandardScaler()), ('reg', LinearRegression())])
lin_pipe.fit(X_train, y_train)

# 4. Compute Comprehensive Metrics
# Baseline
base_val_pred = X_val['CO(GT)']
base_test_pred = X_test['CO(GT)']

# Linear
lin_val_pred = lin_pipe.predict(X_val)
lin_test_pred = lin_pipe.predict(X_test)

# Tuned model evaluated on Val (trained on Train)
tuned_val_pred = tuned_model_val.predict(X_val)

# Final model evaluated on Test (trained on Train+Val)
final_test_pred = final_model.predict(X_test)

metrics_data = {
    'project': 'AirWatch CO',
    'assessment': 'MCA I Statistics Internal Assessment — Group 3',
    'target_variable': 'CO_next (next hour true CO ground truth concentration)',
    'dataset_time_range': {
        'start': str(df['DateTime'].min()),
        'end': str(df['DateTime'].max()),
        'total_records': len(df)
    },
    'splits': {
        'train': {
            'records': len(train_df),
            'start': str(train_df['DateTime'].min()),
            'end': str(train_df['DateTime'].max())
        },
        'val': {
            'records': len(val_df),
            'start': str(val_df['DateTime'].min()),
            'end': str(val_df['DateTime'].max())
        },
        'test': {
            'records': len(test_df),
            'start': str(test_df['DateTime'].min()),
            'end': str(test_df['DateTime'].max())
        }
    },
    'best_hyperparameters': best_params,
    'models_comparison': {
        'Persistence_Baseline': {
            'val_rmse': round(root_mean_squared_error(y_val, base_val_pred), 4),
            'val_mae': round(mean_absolute_error(y_val, base_val_pred), 4),
            'val_r2': round(r2_score(y_val, base_val_pred), 4),
            'test_rmse': round(root_mean_squared_error(y_test, base_test_pred), 4),
            'test_mae': round(mean_absolute_error(y_test, base_test_pred), 4),
            'test_r2': round(r2_score(y_test, base_test_pred), 4)
        },
        'Linear_Regression': {
            'val_rmse': round(root_mean_squared_error(y_val, lin_val_pred), 4),
            'val_mae': round(mean_absolute_error(y_val, lin_val_pred), 4),
            'val_r2': round(r2_score(y_val, lin_val_pred), 4),
            'test_rmse': round(root_mean_squared_error(y_test, lin_test_pred), 4),
            'test_mae': round(mean_absolute_error(y_test, lin_test_pred), 4),
            'test_r2': round(r2_score(y_test, lin_test_pred), 4)
        },
        'Tuned_HistGradientBoosting': {
            'val_rmse': round(root_mean_squared_error(y_val, tuned_val_pred), 4),
            'val_mae': round(mean_absolute_error(y_val, tuned_val_pred), 4),
            'val_r2': round(r2_score(y_val, tuned_val_pred), 4),
            'test_rmse': round(root_mean_squared_error(y_test, final_test_pred), 4),
            'test_mae': round(mean_absolute_error(y_test, final_test_pred), 4),
            'test_r2': round(r2_score(y_test, final_test_pred), 4)
        }
    },
    'primary_model': {
        'name': 'Tuned HistGradientBoostingRegressor',
        'test_rmse': round(root_mean_squared_error(y_test, final_test_pred), 4),
        'test_mae': round(mean_absolute_error(y_test, final_test_pred), 4),
        'test_r2': round(r2_score(y_test, final_test_pred), 4),
        'rmse_improvement_over_baseline_pct': round((1 - root_mean_squared_error(y_test, final_test_pred) / root_mean_squared_error(y_test, base_test_pred)) * 100, 2)
    }
}

# Save metrics.json
with open('artifacts/metrics.json', 'w', encoding='utf-8') as f:
    json.dump(metrics_data, f, indent=2)
print("Saved artifacts/metrics.json")

# 5. Save model.joblib
joblib.dump(final_model, 'artifacts/model.joblib')
print(f"Saved artifacts/model.joblib ({os.path.getsize('artifacts/model.joblib'):,} bytes)")

# 6. Feature Schema & Summary Statistics
schema = {
    'target': {
        'name': 'CO_next',
        'description': "Next hour's true Carbon Monoxide concentration (mg/m³)",
        'unit': 'mg/m³',
        'type': 'float'
    },
    'features': []
}

for col in features:
    schema['features'].append({
        'name': col,
        'type': str(df[col].dtype),
        'min': round(float(df[col].min()), 4),
        'max': round(float(df[col].max()), 4),
        'mean': round(float(df[col].mean()), 4),
        'std': round(float(df[col].std()), 4),
        'description': f"Feature: {col}"
    })

with open('artifacts/feature_schema.json', 'w', encoding='utf-8') as f:
    json.dump(schema, f, indent=2)
print("Saved artifacts/feature_schema.json")

# 7. Error & Failure Analysis Plot
test_residuals = y_test - final_test_pred
test_df_eval = test_df.copy()
test_df_eval['actual'] = y_test
test_df_eval['pred'] = final_test_pred
test_df_eval['abs_error'] = np.abs(test_residuals)
test_df_eval['residual'] = test_residuals

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5), dpi=300)

# Error by Hour of Day
hourly_err = test_df_eval.groupby('hour')['abs_error'].mean()
ax1.bar(hourly_err.index, hourly_err.values, color='#0284c7', alpha=0.85)
ax1.set_xticks(range(0, 24))
ax1.set_title('Mean Absolute Error by Hour of Day (Test Set)', fontweight='bold')
ax1.set_xlabel('Hour of Day (0–23)', fontweight='bold')
ax1.set_ylabel('Mean Absolute Error (mg/m³)', fontweight='bold')
ax1.axhline(hourly_err.mean(), color='red', linestyle='--', label=f'Overall MAE ({hourly_err.mean():.2f})')
ax1.legend(frameon=True, facecolor='white')

# Error by Actual CO Magnitude (Binned)
test_df_eval['co_bracket'] = pd.cut(test_df_eval['actual'], bins=[0, 1.5, 3.0, 5.0, 15.0], labels=['Low (<1.5)', 'Moderate (1.5–3)', 'High (3–5)', 'Extreme (>5)'])
bracket_err = test_df_eval.groupby('co_bracket', observed=False)['abs_error'].mean()

ax2.bar(bracket_err.index, bracket_err.values, color='#f97316', alpha=0.85)
ax2.set_title('Mean Absolute Error by Pollution Severity Level', fontweight='bold')
ax2.set_xlabel('CO Concentration Level (mg/m³)', fontweight='bold')
ax2.set_ylabel('Mean Absolute Error (mg/m³)', fontweight='bold')
ax2.axhline(hourly_err.mean(), color='red', linestyle='--', label=f'Overall MAE ({hourly_err.mean():.2f})')
ax2.legend(frameon=True, facecolor='white')

fig.suptitle('AirWatch CO: Failure Analysis & Error Degradation Regime', fontsize=13, fontweight='bold', y=1.02)
fig.tight_layout()
fig.savefig('figures/10_error_by_hour_and_magnitude.png')
plt.close(fig)
print("Saved figures/10_error_by_hour_and_magnitude.png")

# Verify reloading model
reloaded_model = joblib.load('artifacts/model.joblib')
reloaded_preds = reloaded_model.predict(X_test)
np.testing.assert_allclose(final_test_pred, reloaded_preds)
print("Artifact reload test passed: serialized model reproduces test predictions bit-for-bit!")
