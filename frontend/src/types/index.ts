export interface OverviewData {
  total_hours: number;
  date_range: {
    start: string;
    end: string;
  };
  co_stats: {
    mean: number;
    std: number;
    min: number;
    median: number;
    max: number;
  };
  primary_model: {
    name: string;
    test_rmse: number;
    test_mae: number;
    test_r2: number;
    rmse_improvement_over_baseline_pct: number;
  };
  models_comparison: Record<string, {
    val_rmse: number;
    val_mae: number;
    val_r2: number;
    test_rmse: number;
    test_mae: number;
    test_r2: number;
  }>;
}

export interface TimeseriesPoint {
  datetime: string;
  co: number;
  co_rolling_3h: number;
  t: number;
  rh: number;
  split: string;
}

export interface HourlyPatternPoint {
  hour: number;
  mean: number;
  median: number;
  q25: number;
  q75: number;
}

export interface WeekdayPatternPoint {
  day_of_week: number;
  day_name: string;
  mean: number;
  median: number;
  q25: number;
  q75: number;
}

export interface CorrelationData {
  columns: string[];
  matrix: number[][];
}

export interface WeatherScatterPoint {
  co: number;
  t: number;
  rh: number;
  ah: number;
}

export interface PaginatedData {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  data: Record<string, any>[];
}

export interface MissingnessItem {
  variable: string;
  raw_missing_pct: number;
  cleaned_missing_pct: number;
  status: string;
}

export interface SampleTimestamp {
  datetime: string;
  current_co: number;
  actual_next_co: number;
  temperature: number;
  humidity: number;
  hour: number;
}

export interface PredictionResult {
  datetime?: string;
  predicted_co_next: number;
  actual_co_next?: number;
  current_co?: number;
  residual?: number;
  abs_error?: number;
  features_used: Record<string, number>;
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  importance_std: number;
}

export interface ErrorTierItem {
  tier: string;
  range: string;
  count: number;
  pct_of_test: number;
  mae: number;
  rmse: number;
}

export interface EvaluationDetails {
  models_comparison: Record<string, {
    val_rmse: number;
    val_mae: number;
    val_r2: number;
    test_rmse: number;
    test_mae: number;
    test_r2: number;
  }>;
  best_hyperparameters: Record<string, any>;
  feature_importance?: FeatureImportanceItem[];
  error_by_pollution_tier?: ErrorTierItem[];
  test_evaluation_series: {
    datetime: string;
    actual: number;
    predicted: number;
    baseline: number;
  }[];
}
