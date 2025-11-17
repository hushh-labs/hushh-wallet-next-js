// BLS (Bureau of Labor Statistics) API Integration
// CPS Weekly & Hourly Earnings data for age-based income analysis

interface BLSRequest {
  seriesid: string[];
  startyear: string;
  endyear: string;
  annualaverage: boolean;
  catalog?: boolean;
  calculations?: boolean;
  aspects?: boolean;
  registrationkey?: string;
}

interface BLSDataPoint {
  year: string;
  period: string;
  periodName: string;
  value: string;
  footnotes: any[];
}

interface BLSSeries {
  seriesID: string;
  data: BLSDataPoint[];
}

interface BLSResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results: {
    series: BLSSeries[];
  };
}

interface AgeEarningsData {
  age_band: string;
  bls_series_id: string;
  year: number;
  median_weekly_nominal_usd: number;
  median_annual_income_usd: number;
  age_income_index: number; // Compared to national average
  source_survey: string;
  confidence_level: number;
}

class BLSAPIClient {
  private baseUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
  private apiKey: string | null;
  
  // BLS Series IDs for median usual weekly earnings by age
  // Source: CPS Weekly and Hourly Earnings (LEU series)
  private readonly ageSeries: Record<string, string> = {
    '16plus': 'LEU0252881500',    // 16 years and over
    '25_34': 'LEU0252888500',     // 25-34 years
    '35_44': 'LEU0252889100',     // 35-44 years
    '45_54': 'LEU0252889700',     // 45-54 years 
    '55_64': 'LEU0252890900',     // 55-64 years
    '65plus': 'LEU0252891500'     // 65 years and over
  };

  // National baseline for age income index calculation
  private nationalMedianWeekly = 1145; // Approximate 2024 median, updated annually

  constructor() {
    this.apiKey = process.env.BLS_API_KEY || null;
  }

  private async fetchBLSData(request: BLSRequest): Promise<BLSResponse | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          ...(this.apiKey ? { registrationkey: this.apiKey } : {})
        })
      });

      if (!response.ok) {
        throw new Error(`BLS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'REQUEST_SUCCEEDED') {
        throw new Error(`BLS API failed: ${data.message?.join(', ') || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error('BLS API fetch error:', error);
      return null;
    }
  }

  // Get earnings data for a specific age band
  async getAgeEarnings(ageBand: string, year: number = new Date().getFullYear() - 1): Promise<AgeEarningsData | null> {
    if (!this.apiKey) {
      console.warn('BLS API key not configured, using fallback estimates');
      return this.getFallbackEarnings(ageBand, year);
    }

    const seriesId = this.ageSeries[ageBand];
    if (!seriesId) {
      console.error(`No BLS series ID found for age band: ${ageBand}`);
      return null;
    }

    try {
      const request: BLSRequest = {
        seriesid: [seriesId],
        startyear: year.toString(),
        endyear: year.toString(),
        annualaverage: true,
        catalog: false,
        calculations: false,
        aspects: false
      };

      const response = await this.fetchBLSData(request);
      if (!response || !response.Results?.series?.length) {
        return this.getFallbackEarnings(ageBand, year);
      }

      const series = response.Results.series[0];
      
      // Find the annual average data point (period starts with 'A')
      const annualData = series.data.find(point => 
        point.year === year.toString() && point.period.startsWith('A')
      );

      if (!annualData || !annualData.value || annualData.value === '.') {
        return this.getFallbackEarnings(ageBand, year);
      }

      const weeklyEarnings = parseFloat(annualData.value);
      const annualIncome = weeklyEarnings * 52;
      const ageIncomeIndex = weeklyEarnings / this.nationalMedianWeekly;

      return {
        age_band: ageBand,
        bls_series_id: seriesId,
        year: year,
        median_weekly_nominal_usd: weeklyEarnings,
        median_annual_income_usd: annualIncome,
        age_income_index: ageIncomeIndex,
        source_survey: 'CPS Weekly and Hourly Earnings',
        confidence_level: 0.9 // High confidence for official BLS data
      };

    } catch (error) {
      console.error(`Error fetching BLS data for age band ${ageBand}:`, error);
      return this.getFallbackEarnings(ageBand, year);
    }
  }

  // Get earnings data for all age bands
  async getAllAgeEarnings(year: number = new Date().getFullYear() - 1): Promise<Record<string, AgeEarningsData>> {
    const results: Record<string, AgeEarningsData> = {};

    if (!this.apiKey) {
      console.warn('BLS API key not configured, using fallback data for all age bands');
      for (const ageBand of Object.keys(this.ageSeries)) {
        const fallback = this.getFallbackEarnings(ageBand, year);
        if (fallback) results[ageBand] = fallback;
      }
      return results;
    }

    try {
      // Batch request for all series
      const request: BLSRequest = {
        seriesid: Object.values(this.ageSeries),
        startyear: year.toString(),
        endyear: year.toString(),
        annualaverage: true,
        catalog: false,
        calculations: false,
        aspects: false
      };

      const response = await this.fetchBLSData(request);
      if (!response || !response.Results?.series?.length) {
        // Fall back to individual requests or static data
        for (const ageBand of Object.keys(this.ageSeries)) {
          const fallback = this.getFallbackEarnings(ageBand, year);
          if (fallback) results[ageBand] = fallback;
        }
        return results;
      }

      // Process each series
      for (const series of response.Results.series) {
        // Map series ID back to age band
        const ageBand = Object.keys(this.ageSeries).find(
          band => this.ageSeries[band] === series.seriesID
        );

        if (!ageBand) continue;

        const annualData = series.data.find(point => 
          point.year === year.toString() && point.period.startsWith('A')
        );

        if (annualData && annualData.value && annualData.value !== '.') {
          const weeklyEarnings = parseFloat(annualData.value);
          const annualIncome = weeklyEarnings * 52;
          const ageIncomeIndex = weeklyEarnings / this.nationalMedianWeekly;

          results[ageBand] = {
            age_band: ageBand,
            bls_series_id: series.seriesID,
            year: year,
            median_weekly_nominal_usd: weeklyEarnings,
            median_annual_income_usd: annualIncome,
            age_income_index: ageIncomeIndex,
            source_survey: 'CPS Weekly and Hourly Earnings',
            confidence_level: 0.9
          };
        } else {
          // Fallback for this age band
          const fallback = this.getFallbackEarnings(ageBand, year);
          if (fallback) results[ageBand] = fallback;
        }
      }

      return results;

    } catch (error) {
      console.error('Error fetching BLS batch data:', error);
      
      // Complete fallback
      for (const ageBand of Object.keys(this.ageSeries)) {
        const fallback = this.getFallbackEarnings(ageBand, year);
        if (fallback) results[ageBand] = fallback;
      }
      return results;
    }
  }

  // Fallback earnings estimates (based on 2023 BLS data)
  private getFallbackEarnings(ageBand: string, year: number): AgeEarningsData | null {
    const fallbackData: Record<string, number> = {
      '16plus': 1145,   // $59,540 annually
      '25_34': 1051,    // $54,652 annually  
      '35_44': 1350,    // $70,200 annually
      '45_54': 1298,    // $67,496 annually
      '55_64': 1200,    // $62,400 annually
      '65plus': 950     // $49,400 annually
    };

    const weeklyEarnings = fallbackData[ageBand];
    if (!weeklyEarnings) return null;

    const annualIncome = weeklyEarnings * 52;
    const ageIncomeIndex = weeklyEarnings / this.nationalMedianWeekly;

    return {
      age_band: ageBand,
      bls_series_id: this.ageSeries[ageBand] || 'FALLBACK',
      year: year,
      median_weekly_nominal_usd: weeklyEarnings,
      median_annual_income_usd: annualIncome,
      age_income_index: ageIncomeIndex,
      source_survey: 'BLS_2023_FALLBACK',
      confidence_level: 0.4 // Lower confidence for fallback data
    };
  }

  // Map user age to BLS age band
  mapAgeToAgeBand(age: number): string {
    if (age < 25) return '16plus';  // Use general category for very young
    if (age < 35) return '25_34';
    if (age < 45) return '35_44';
    if (age < 55) return '45_54';
    if (age < 65) return '55_64';
    return '65plus';
  }

  // Calculate age-income multiplier for net worth estimation
  calculateAgeIncomeMultiplier(ageIncomeIndex: number): number {
    // Convert age income index to a mild multiplier (0.7 to 1.4 range)
    // Higher income for age = higher expected net worth
    const multiplier = Math.sqrt(ageIncomeIndex);
    return Math.max(0.7, Math.min(1.4, multiplier));
  }

  // Enhanced age-income analysis for debugging/signals
  analyzeAgeIncome(userAge: number, ageEarningsData: AgeEarningsData): {
    age_band: string;
    weekly_earnings: number;
    annual_income_est: number;
    national_comparison: string;
    income_multiplier: number;
    confidence: number;
  } {
    const ageBand = this.mapAgeToAgeBand(userAge);
    const incomeMultiplier = this.calculateAgeIncomeMultiplier(ageEarningsData.age_income_index);
    
    let nationalComparison = 'average';
    if (ageEarningsData.age_income_index > 1.2) nationalComparison = 'above_average';
    if (ageEarningsData.age_income_index < 0.8) nationalComparison = 'below_average';
    if (ageEarningsData.age_income_index > 1.5) nationalComparison = 'well_above_average';

    return {
      age_band: ageBand,
      weekly_earnings: ageEarningsData.median_weekly_nominal_usd,
      annual_income_est: ageEarningsData.median_annual_income_usd,
      national_comparison: nationalComparison,
      income_multiplier: incomeMultiplier,
      confidence: ageEarningsData.confidence_level
    };
  }
}

// Singleton instance
export const blsAPI = new BLSAPIClient();

// Helper functions
export function mapUserAgeToAgeBand(age: number): string {
  return blsAPI.mapAgeToAgeBand(age);
}

export function calculateAgeIncomeEffect(ageIncomeIndex: number): number {
  return blsAPI.calculateAgeIncomeMultiplier(ageIncomeIndex);
}

// Type exports
export type { AgeEarningsData, BLSResponse };
