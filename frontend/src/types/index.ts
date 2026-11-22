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
  weather_stats: {
    t_mean: number;
    rh_mean: number;
    ah_mean: number;
  };
  sensor_stats: {
    pt08_s1_mean: number;
    pt08_s2_mean: number;
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

export interface DistributionData {
  variable: string;
  n: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
  histogram: { bin_start: number; bin_end: number; bin_center: number; count: number }[];
  normal_curve: { x: number; y: number }[];
  note: string;
}

export interface OutlierData {
  variable: string;
  n: number;
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  lower_fence: number;
  upper_fence: number;
  left_outlier_count: number;
  right_outlier_count: number;
  outlier_rate_pct: number;
  sample_left_outliers: number[];
  sample_right_outliers: number[];
  policy: string;
}

export interface ProbabilitiesData {
  variable: string;
  n: number;
  percentiles: Record<string, number>;
  thresholds: { label: string; rule: string; probability: number; count: number }[];
  empirical_cdf: { x: number; cdf: number }[];
  note: string;
}

export interface MethodsSummary {
  process_steps: { step: number; title: string; detail: string }[];
  cleaning_steps: string[];
  models: {
    key: string;
    label: string;
    test_rmse: number;
    test_mae: number;
    test_r2: number;
  }[];
  primary_model: {
    name: string;
    test_rmse: number;
    test_mae: number;
    test_r2: number;
    rmse_improvement_over_baseline_pct?: number;
  };
  best_hyperparameters: Record<string, number | string>;
  allowed_distribution_variables: string[];
  classical_note: string;
}
