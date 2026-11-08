import type {
  OverviewData,
  TimeseriesPoint,
  HourlyPatternPoint,
  WeekdayPatternPoint,
  CorrelationData,
  WeatherScatterPoint,
  PaginatedData,
  MissingnessItem,
  SampleTimestamp,
  PredictionResult,
  EvaluationDetails
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error [${response.status}] ${url}: ${errorText}`);
  }
  return response.json();
}

export const api = {
  async checkHealth(): Promise<{ status: string }> {
    return fetchJson<{ status: string }>('/health');
  },

  async getMeta(): Promise<any> {
    return fetchJson('/meta');
  },

  async getOverview(): Promise<OverviewData> {
    return fetchJson<OverviewData>('/stats/overview');
  },

  async getTimeseries(startDate?: string, endDate?: string, step: number = 4): Promise<TimeseriesPoint[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('step', step.toString());
    return fetchJson<TimeseriesPoint[]>(`/stats/timeseries?${params.toString()}`);
  },

  async getHourlyPattern(): Promise<HourlyPatternPoint[]> {
    return fetchJson<HourlyPatternPoint[]>('/stats/hourly-pattern');
  },

  async getWeekdayPattern(): Promise<WeekdayPatternPoint[]> {
    return fetchJson<WeekdayPatternPoint[]>('/stats/weekday-pattern');
  },

  async getCorrelation(): Promise<CorrelationData> {
    return fetchJson<CorrelationData>('/stats/correlation');
  },

  async getWeatherScatter(): Promise<WeatherScatterPoint[]> {
    return fetchJson<WeatherScatterPoint[]>('/stats/weather-scatter');
  },

  async getDataRows(page: number = 1, pageSize: number = 25, startDate?: string, endDate?: string, hour?: number): Promise<PaginatedData> {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (hour !== undefined && hour !== null) params.append('hour', hour.toString());
    return fetchJson<PaginatedData>(`/data?${params.toString()}`);
  },

  async getMissingness(): Promise<MissingnessItem[]> {
    return fetchJson<MissingnessItem[]>('/data/missingness');
  },

  getDownloadUrl(): string {
    return `${API_BASE_URL}/data/download`;
  },

  async getSampleTimestamps(count: number = 50): Promise<SampleTimestamp[]> {
    return fetchJson<SampleTimestamp[]>(`/model/sample-timestamps?count=${count}`);
  },

  async predict(params: { datetime_str?: string; custom_features?: Record<string, number> }): Promise<PredictionResult> {
    return fetchJson<PredictionResult>('/model/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },

  async getEvaluation(): Promise<EvaluationDetails> {
    return fetchJson<EvaluationDetails>('/model/evaluation');
  }
};
