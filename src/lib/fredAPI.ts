// FRED (Federal Reserve Economic Data) API Integration
// St. Louis Fed API for real-time economic data

interface FREDSeriesData {
  series_id: string;
  title: string;
  units: string;
  frequency: string;
  observations: {
    date: string;
    value: string;
  }[];
}

interface FREDResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: {
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }[];
}

interface NetWorthData {
  median_net_worth: number;
  p25_net_worth: number;
  p75_net_worth: number;
  p90_net_worth: number;
  year: number;
  age_group: string;
  source: string;
}

class FREDAPIClient {
  private baseUrl = 'https://api.stlouisfed.org/fred';
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.FRED_API_KEY || null;
  }

  private async fetchSeries(seriesId: string, startDate?: string, endDate?: string): Promise<FREDResponse | null> {
    if (!this.apiKey) {
      console.warn('FRED API key not configured, using fallback data');
      return null;
    }

    try {
      const params = new URLSearchParams({
        series_id: seriesId,
        api_key: this.apiKey,
        file_type: 'json',
        sort_order: 'desc',
        limit: '10'
      });

      if (startDate) params.set('observation_start', startDate);
      if (endDate) params.set('observation_end', endDate);

      const url = `${this.baseUrl}/series/observations?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`FRED API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('FRED API fetch error:', error);
      return null;
    }
  }

  // Get latest median household income for a state
  async getStateMedianIncome(stateCode: string): Promise<number | null> {
    // FRED series for state median household income (example: MEHOINUSCAA646N for CA)
    const seriesId = `MEHOINUSA${stateCode}A646N`;
    
    try {
      const data = await this.fetchSeries(seriesId);
      if (data && data.observations && data.observations.length > 0) {
        const latestValue = data.observations[0].value;
        return latestValue !== '.' ? parseFloat(latestValue) : null;
      }
    } catch (error) {
      console.error(`Error fetching state income for ${stateCode}:`, error);
    }

    return null;
  }

  // Get national net worth data by age group
  async getNationalNetWorthData(): Promise<NetWorthData[]> {
    // This is simplified - in practice, FRED doesn't have direct net worth by age series
    // We would need to use Survey of Consumer Finances data or create composite indices
    
    const fallbackData: NetWorthData[] = [
      {
        median_net_worth: 39000,
        p25_net_worth: 8000,
        p75_net_worth: 92000,
        p90_net_worth: 400000,
        year: 2022,
        age_group: '18-34',
        source: 'SCF_2022'
      },
      {
        median_net_worth: 135000,
        p25_net_worth: 15000,
        p75_net_worth: 350000,
        p90_net_worth: 1040000,
        year: 2022,
        age_group: '35-44',
        source: 'SCF_2022'
      },
      {
        median_net_worth: 246000,
        p25_net_worth: 45000,
        p75_net_worth: 600000,
        p90_net_worth: 1960000,
        year: 2022,
        age_group: '45-54',
        source: 'SCF_2022'
      },
      {
        median_net_worth: 364000,
        p25_net_worth: 84000,
        p75_net_worth: 900000,
        p90_net_worth: 2800000,
        year: 2022,
        age_group: '55-64',
        source: 'SCF_2022'
      },
      {
        median_net_worth: 410000,
        p25_net_worth: 100000,
        p75_net_worth: 975000,
        p90_net_worth: 3200000,
        year: 2022,
        age_group: '65-74',
        source: 'SCF_2022'
      },
      {
        median_net_worth: 335000,
        p25_net_worth: 70000,
        p75_net_worth: 750000,
        p90_net_worth: 2400000,
        year: 2022,
        age_group: '75+',
        source: 'SCF_2022'
      }
    ];

    return fallbackData;
  }

  // Get Consumer Price Index for regional cost of living adjustments
  async getCPI(areaCode?: string): Promise<number | null> {
    // CPIAUCSL = Consumer Price Index for All Urban Consumers: All Items in U.S. City Average
    const seriesId = areaCode ? `CPIAUCSL${areaCode}` : 'CPIAUCSL';
    
    try {
      const data = await this.fetchSeries(seriesId);
      if (data && data.observations && data.observations.length > 0) {
        const latestValue = data.observations[0].value;
        return latestValue !== '.' ? parseFloat(latestValue) : null;
      }
    } catch (error) {
      console.error(`Error fetching CPI data:`, error);
    }

    return null;
  }

  // Get unemployment rate for regional economic context
  async getUnemploymentRate(stateCode: string): Promise<number | null> {
    // State unemployment rate series (example: CAUR for California)
    const seriesId = `${stateCode}UR`;
    
    try {
      const data = await this.fetchSeries(seriesId);
      if (data && data.observations && data.observations.length > 0) {
        const latestValue = data.observations[0].value;
        return latestValue !== '.' ? parseFloat(latestValue) : null;
      }
    } catch (error) {
      console.error(`Error fetching unemployment rate for ${stateCode}:`, error);
    }

    return null;
  }

  // Enhanced geographic multiplier using real economic data
  async calculateEnhancedGeoMultiplier(state: string): Promise<{
    multiplier: number;
    factors: {
      median_income?: number;
      unemployment_rate?: number;
      cpi?: number;
      base_multiplier: number;
    };
  }> {
    const stateCode = state.toUpperCase();
    
    // Base multipliers (simplified for now)
    const baseMultipliers: Record<string, number> = {
      'CA': 1.4, 'NY': 1.4, 'MA': 1.4, 'CT': 1.4, 'NJ': 1.4, 'WA': 1.4, 'MD': 1.4,
      'TX': 1.1, 'FL': 1.1, 'VA': 1.1, 'CO': 1.1, 'IL': 1.1, 'NC': 1.1
    };

    const baseMultiplier = baseMultipliers[stateCode] || 1.0;
    let adjustedMultiplier = baseMultiplier;

    const factors: any = {
      base_multiplier: baseMultiplier
    };

    try {
      // Get real-time economic indicators
      const [medianIncome, unemploymentRate, cpi] = await Promise.all([
        this.getStateMedianIncome(stateCode),
        this.getUnemploymentRate(stateCode),
        this.getCPI()
      ]);

      if (medianIncome !== null) {
        factors.median_income = medianIncome;
        // Adjust multiplier based on income vs national average (~$70,000)
        const incomeRatio = medianIncome / 70000;
        adjustedMultiplier *= Math.sqrt(incomeRatio); // Use square root to moderate extreme adjustments
      }

      if (unemploymentRate !== null) {
        factors.unemployment_rate = unemploymentRate;
        // Lower unemployment generally correlates with higher net worth
        const unemploymentAdjustment = Math.max(0.8, 1 - (unemploymentRate - 4) / 20);
        adjustedMultiplier *= unemploymentAdjustment;
      }

      if (cpi !== null) {
        factors.cpi = cpi;
        // Higher cost of living areas often have higher net worth requirements
      }

    } catch (error) {
      console.error('Error calculating enhanced geo multiplier:', error);
    }

    return {
      multiplier: Math.max(0.5, Math.min(2.0, adjustedMultiplier)), // Cap between 0.5x and 2.0x
      factors
    };
  }
}

// Singleton instance
export const fredAPI = new FREDAPIClient();

// Helper functions
export function determineAgeGroup(age: number): string {
  if (age < 35) return '18-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  if (age < 75) return '65-74';
  return '75+';
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${Math.round(amount / 100000) / 10}M`;
  }
  return `$${Math.round(amount / 1000)}k`;
}
