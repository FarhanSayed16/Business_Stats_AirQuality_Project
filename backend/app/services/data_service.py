import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

class DataService:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.metrics: Optional[Dict[str, Any]] = None
        self.feature_schema: Optional[Dict[str, Any]] = None
        self.missingness: List[Dict[str, Any]] = []
        self.model = None
        self.features: List[str] = []
        self._find_and_load_artifacts()

    def _find_and_load_artifacts(self):
        # Look in multiple possible parent locations (prefer project root)
        search_dirs = [
            os.path.abspath("."),
            os.path.abspath(".."),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        ]

        csv_path = None
        metrics_path = None
        schema_path = None
        model_path = None
        missingness_path = None

        for d in search_dirs:
            c_test = os.path.join(d, "data", "cleaned", "cleaned_air_quality.csv")
            m_test = os.path.join(d, "artifacts", "metrics.json")
            s_test = os.path.join(d, "artifacts", "feature_schema.json")
            mod_test = os.path.join(d, "artifacts", "model.joblib")
            miss_test = os.path.join(d, "artifacts", "missingness.json")

            if os.path.exists(c_test) and csv_path is None:
                csv_path = c_test
            if os.path.exists(m_test) and metrics_path is None:
                metrics_path = m_test
            if os.path.exists(s_test) and schema_path is None:
                schema_path = s_test
            if os.path.exists(mod_test) and model_path is None:
                model_path = mod_test
            if os.path.exists(miss_test) and missingness_path is None:
                missingness_path = miss_test

        if not (csv_path and metrics_path and schema_path and model_path):
            raise FileNotFoundError(
                f"Missing artifacts! Found: csv={csv_path}, metrics={metrics_path}, schema={schema_path}, model={model_path}"
            )

        # 1. Load Cleaned Dataset
        self.df = pd.read_csv(csv_path)
        self.df['DateTime'] = pd.to_datetime(self.df['DateTime'])
        self.df = self.df.sort_values('DateTime').reset_index(drop=True)

        # 2. Load Metrics & Schema
        with open(metrics_path, 'r', encoding='utf-8') as f:
            self.metrics = json.load(f)

        with open(schema_path, 'r', encoding='utf-8') as f:
            self.feature_schema = json.load(f)

        self.features = [feat['name'] for feat in self.feature_schema['features']]

        if missingness_path:
            with open(missingness_path, 'r', encoding='utf-8') as f:
                self.missingness = json.load(f)
        else:
            self.missingness = []

        # 3. Load Trained Model
        self.model = joblib.load(model_path)
        print(f"DataService initialized: Loaded {len(self.df)} records, {len(self.features)} features, model ready.")

    def get_meta(self) -> Dict[str, Any]:
        return {
            "app_name": "AirWatch CO API",
            "group": "Group 3 — Air Quality and Pollution (MCA I Statistics)",
            "target": "CO_next (Next-hour CO concentration in mg/m³)",
            "primary_model": self.metrics.get("primary_model", {}).get("name", "Tuned HistGradientBoostingRegressor"),
            "total_records": len(self.df),
            "date_range": {
                "start": str(self.df['DateTime'].min()),
                "end": str(self.df['DateTime'].max())
            },
            "features_count": len(self.features)
        }

    def get_overview_kpis(self) -> Dict[str, Any]:
        co = self.df['CO(GT)']
        return {
            "total_hours": len(self.df),
            "date_range": {
                "start": str(self.df['DateTime'].min()),
                "end": str(self.df['DateTime'].max())
            },
            "co_stats": {
                "mean": round(float(co.mean()), 2),
                "std": round(float(co.std()), 2),
                "min": round(float(co.min()), 2),
                "median": round(float(co.median()), 2),
                "max": round(float(co.max()), 2)
            },
            "weather_stats": {
                "t_mean": round(float(self.df['T'].mean()), 1),
                "rh_mean": round(float(self.df['RH'].mean()), 1),
                "ah_mean": round(float(self.df['AH'].mean()), 3)
            },
            "sensor_stats": {
                "pt08_s1_mean": round(float(self.df['PT08.S1(CO)'].mean()), 1),
                "pt08_s2_mean": round(float(self.df['PT08.S2(NMHC)'].mean()), 1)
            },
            "primary_model": self.metrics.get("primary_model", {}),
            "models_comparison": self.metrics.get("models_comparison", {})
        }

    def get_timeseries(self, start_date: Optional[str] = None, end_date: Optional[str] = None, step: int = 1) -> List[Dict[str, Any]]:
        subset = self.df
        if start_date:
            subset = subset[subset['DateTime'] >= pd.to_datetime(start_date)]
        if end_date:
            subset = subset[subset['DateTime'] <= pd.to_datetime(end_date)]

        if step > 1:
            subset = subset.iloc[::step]

        # Return lightweight payload for charts
        records = []
        for _, row in subset.iterrows():
            records.append({
                "datetime": str(row['DateTime']),
                "co": round(float(row['CO(GT)']), 2),
                "co_rolling_3h": round(float(row['CO_rolling_mean_3h']), 2),
                "t": round(float(row['T']), 1),
                "rh": round(float(row['RH']), 1),
                "split": row['split']
            })
        return records

    def get_hourly_pattern(self) -> List[Dict[str, Any]]:
        grouped = self.df.groupby('hour')['CO(GT)'].agg([
            'mean', 'median',
            lambda x: float(x.quantile(0.25)),
            lambda x: float(x.quantile(0.75))
        ])
        grouped.columns = ['mean', 'median', 'q25', 'q75']

        result = []
        for hr, row in grouped.iterrows():
            result.append({
                "hour": int(hr),
                "mean": round(float(row['mean']), 2),
                "median": round(float(row['median']), 2),
                "q25": round(float(row['q25']), 2),
                "q75": round(float(row['q75']), 2)
            })
        return result

    def get_weekday_pattern(self) -> List[Dict[str, Any]]:
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        grouped = self.df.groupby('day_of_week')['CO(GT)'].agg([
            'mean', 'median',
            lambda x: float(x.quantile(0.25)),
            lambda x: float(x.quantile(0.75))
        ])
        grouped.columns = ['mean', 'median', 'q25', 'q75']

        result = []
        for d, row in grouped.iterrows():
            result.append({
                "day_of_week": int(d),
                "day_name": day_names[int(d)],
                "mean": round(float(row['mean']), 2),
                "median": round(float(row['median']), 2),
                "q25": round(float(row['q25']), 2),
                "q75": round(float(row['q75']), 2)
            })
        return result

    def get_correlation_matrix(self) -> Dict[str, Any]:
        columns = [
            'CO(GT)', 'C6H6(GT)', 'NOx(GT)', 'NO2(GT)',
            'PT08.S1(CO)', 'PT08.S2(NMHC)', 'PT08.S3(NOx)', 'PT08.S4(NO2)', 'PT08.S5(O3)',
            'T', 'RH', 'AH'
        ]
        corr = self.df[columns].corr().round(3)
        return {
            "columns": columns,
            "matrix": corr.values.tolist()
        }

    def get_weather_scatter(self, sample_size: int = 800) -> List[Dict[str, Any]]:
        sample = self.df.sample(min(sample_size, len(self.df)), random_state=42)
        records = []
        for _, row in sample.iterrows():
            records.append({
                "co": round(float(row['CO(GT)']), 2),
                "t": round(float(row['T']), 1),
                "rh": round(float(row['RH']), 1),
                "ah": round(float(row['AH']), 2)
            })
        return records

    def get_paginated_data(
        self,
        page: int = 1,
        page_size: int = 50,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        hour: Optional[int] = None,
        split: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        subset = self.df
        if start_date:
            subset = subset[subset['DateTime'] >= pd.to_datetime(start_date)]
        if end_date:
            subset = subset[subset['DateTime'] <= pd.to_datetime(end_date)]
        if hour is not None:
            subset = subset[subset['hour'] == hour]
        if split and split.lower() in ['train', 'val', 'test']:
            subset = subset[subset['split'] == split.lower()]
        if search:
            subset = subset[subset['DateTime'].astype(str).str.contains(search, case=False, na=False)]

        total_rows = len(subset)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_df = subset.iloc[start_idx:end_idx]

        records = []
        display_cols = [
            'DateTime', 'CO(GT)', 'PT08.S1(CO)', 'C6H6(GT)', 'PT08.S2(NMHC)',
            'NOx(GT)', 'PT08.S3(NOx)', 'NO2(GT)', 'PT08.S4(NO2)', 'PT08.S5(O3)',
            'T', 'RH', 'AH', 'CO_next', 'split'
        ]

        for _, row in paged_df.iterrows():
            rec = {"datetime": str(row['DateTime'])}
            for col in display_cols[1:]:
                val = row[col]
                rec[col] = round(float(val), 2) if isinstance(val, (float, int, np.floating, np.integer)) and col != 'split' else str(val)
            records.append(rec)

        return {
            "page": page,
            "page_size": page_size,
            "total_records": total_rows,
            "total_pages": int(np.ceil(total_rows / page_size)) if total_rows > 0 else 1,
            "data": records
        }

    def get_missingness_summary(self) -> List[Dict[str, Any]]:
        if self.missingness:
            return self.missingness
        raise FileNotFoundError("artifacts/missingness.json not found — regenerate from preprocessing notes.")

    def get_sample_test_timestamps(self, count: int = 60) -> List[Dict[str, Any]]:
        test_subset = self.df[self.df['split'] == 'test']
        sample = test_subset.sample(min(count, len(test_subset)), random_state=42).sort_values('DateTime')
        items = []
        for _, row in sample.iterrows():
            items.append({
                "datetime": str(row['DateTime']),
                "current_co": round(float(row['CO(GT)']), 2),
                "actual_next_co": round(float(row['CO_next']), 2),
                "temperature": round(float(row['T']), 1),
                "humidity": round(float(row['RH']), 1),
                "hour": int(row['hour'])
            })
        return items

    def predict_by_timestamp(self, dt_str: str) -> Dict[str, Any]:
        match = self.df[self.df['DateTime'] == pd.to_datetime(dt_str)]
        if match.empty:
            raise ValueError(f"Timestamp {dt_str} not found in historical records.")
        row = match.iloc[0]
        X_vec = row[self.features].to_frame().T
        pred_val = float(self.model.predict(X_vec)[0])
        actual_val = float(row['CO_next'])

        return {
            "datetime": dt_str,
            "predicted_co_next": round(pred_val, 2),
            "actual_co_next": round(actual_val, 2),
            "current_co": round(float(row['CO(GT)']), 2),
            "residual": round(actual_val - pred_val, 2),
            "abs_error": round(abs(actual_val - pred_val), 2),
            "features_used": {f: round(float(row[f]), 2) for f in self.features}
        }

    def predict_custom_features(self, custom_inputs: Dict[str, float]) -> Dict[str, Any]:
        # Intelligent defaults for simulation inputs
        full_inputs = {}
        means = self.df[self.features].mean().to_dict()

        for f in self.features:
            if f in custom_inputs:
                full_inputs[f] = float(custom_inputs[f])
            else:
                full_inputs[f] = float(means.get(f, 0.0))

        # Re-derive cyclical & lag features if base values were customized
        if 'hour' in custom_inputs:
            hr = float(custom_inputs['hour'])
            full_inputs['hour_sin'] = float(np.sin(2 * np.pi * hr / 24.0))
            full_inputs['hour_cos'] = float(np.cos(2 * np.pi * hr / 24.0))

        if 'month' in custom_inputs:
            mo = float(custom_inputs['month'])
            full_inputs['month_sin'] = float(np.sin(2 * np.pi * (mo - 1) / 12.0))
            full_inputs['month_cos'] = float(np.cos(2 * np.pi * (mo - 1) / 12.0))

        if 'CO(GT)' in custom_inputs:
            co = float(custom_inputs['CO(GT)'])
            if 'CO_lag1' not in custom_inputs: full_inputs['CO_lag1'] = co
            if 'CO_lag2' not in custom_inputs: full_inputs['CO_lag2'] = co
            if 'CO_lag3' not in custom_inputs: full_inputs['CO_lag3'] = co
            if 'CO_rolling_mean_3h' not in custom_inputs: full_inputs['CO_rolling_mean_3h'] = co

        if 'T' in custom_inputs and 'T_lag1' not in custom_inputs:
            full_inputs['T_lag1'] = float(custom_inputs['T'])

        if 'RH' in custom_inputs and 'RH_lag1' not in custom_inputs:
            full_inputs['RH_lag1'] = float(custom_inputs['RH'])

        input_df = pd.DataFrame([full_inputs])[self.features]
        pred_val = float(self.model.predict(input_df)[0])

        return {
            "predicted_co_next": round(pred_val, 2),
            "current_co": round(full_inputs.get('CO(GT)', 0.0), 2),
            "features_used": {f: round(float(full_inputs[f]), 2) for f in self.features}
        }

    def get_evaluation_details(self) -> Dict[str, Any]:
        # Generate series of actual vs predicted on test set for evaluation chart
        test_df = self.df[self.df['split'] == 'test']
        X_test = test_df[self.features]
        y_test = test_df['CO_next']
        preds = self.model.predict(X_test)

        # Sample 150 consecutive points to render an illustrative timeline comparison
        sample_eval = []
        for i in range(min(120, len(test_df))):
            row = test_df.iloc[i]
            sample_eval.append({
                "datetime": str(row['DateTime']),
                "actual": round(float(y_test.iloc[i]), 2),
                "predicted": round(float(preds[i]), 2),
                "baseline": round(float(row['CO(GT)']), 2)
            })

        return {
            "models_comparison": self.metrics.get("models_comparison", {}),
            "best_hyperparameters": self.metrics.get("best_hyperparameters", {}),
            "feature_importance": self.metrics.get("feature_importance", []),
            "error_by_pollution_tier": self.metrics.get("error_by_pollution_tier", []),
            "test_evaluation_series": sample_eval
        }

# Global singleton
data_service = DataService()
