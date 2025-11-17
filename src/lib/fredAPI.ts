// FRED (Federal Reserve Economic Data) API Integration
// St. Louis Fed API for real-time economic data
// Enhanced for HUSHH Networth Layer-1 specifications

import { supabaseAdmin } from './supabase';

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

interface MacroIncomeBaselines {
  year: number;
  M_us_nominal: number;
  M_personal_us_nominal: number;
  M_family_us_nominal?: number;
  source_updated_at: string;
  created_at: string;
  updated_at: string;
}

class FREDAPIClient {
  private baseUrl = 'https://api.stlouisfed.org/fred';
  private apiKey: string | null;

  // FRED Series IDs for Layer-1 national income medians
  private readonly nationalIncomeSeries = {
    household_nominal: 'MEHOINUSA646N',    // Median Household Income (nominal)
    household_real: 'MEHOINUSA672N',       // Median Household Income (real)
    personal_nominal: 'MEPAINUSA646N',     // Median Personal Income (nominal)
    personal_real: 'MEPAINUSA672N',        // Median Personal Income (real)
    family_nominal: 'MEFAINUSA646N'        // Median Family Income (nominal)
  };

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
        limit: '1'  // Only get latest observation
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

  // Get national income medians from FRED (Layer-1 specification)
  async getNationalIncomeMedians(): Promise<{
    household_nominal: number | null;
    personal_nominal: number | null;
    family_nominal: number | null;
    year: number | null;
  } | null> {
    try {
      const [householdData, personalData, familyData] = await Promise.all([
        this.fetchSeries(this.nationalIncomeSeries.household_nominal),
        this.fetchSeries(this.nationalIncomeSeries.personal_nominal),
        this.fetchSeries(this.nationalIncomeSeries.family_nominal)
      ]);

      const result = {
        household_nominal: null as number | null,
        personal_nominal: null as number | null,
        family_nominal: null as number | null,
        year: null as number | null
      };

      if (householdData?.observations?.[0]) {
        const obs = householdData.observations[0];
        if (obs.value !== '.') {
          result.household_nominal = parseFloat(obs.value);
          result.year = parseInt(obs.date.substring(0, 4));
        }
      }

      if (personalData?.observations?.[0]) {
        const obs = personalData.observations[0];
        if (obs.value !== '.') {
          result.personal_nominal = parseFloat(obs.value);
        }
      }

      if (familyData?.observations?.[0]) {
        const obs = familyData.observations[0];
        if (obs.value !== '.') {
          result.family_nominal = parseFloat(obs.value);
        }
      }

      return result;
    } catch (error) {
      console.error('Error fetching national income medians:', error);
      return null;
    }
  }

  // Update macro_income_baselines table with fresh FRED data
  async updateMacroIncomeBaselines(): Promise<boolean> {
    try {
      const incomeData = await this.getNationalIncomeMedians();
      
      if (!incomeData || !incomeData.household_nominal || !incomeData.year) {
        console.warn('Insufficient FRED data for macro income baselines update');
        return false;
      }

      const { data, error } = await supabaseAdmin
        .from('macro_income_baselines')
        .upsert({
          year: incomeData.year,
          median_household_income_nominal: incomeData.household_nominal,
          median_personal_income_nominal: incomeData.personal_nominal,
          median_family_income_nominal: incomeData.family_nominal,
          source_updated_at: new Date().toISOString(),
          source_release: 'Income and Poverty in the United States',
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'year' 
        });

      if (error) {
        console.error('Error updating macro income baselines:', error);
        return false;
      }

      console.log(`Updated macro income baselines for year ${incomeData.year}`);
      return true;
    } catch (error) {
      console.error('Error in updateMacroIncomeBaselines:', error);
      return false;
    }
  }

  // Get current M_us_nominal for affluence_index_zip calculations
  async getCurrentMUsNominal(): Promise<number | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('layer1_income_baselines')
        .select('M_us_nominal, year')
        .order('year', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn('No macro income baselines found, fetching from FRED');
        
        // Try to fetch fresh data from FRED
        const freshUpdate = await this.updateMacroIncomeBaselines();
        if (freshUpdate) {
          // Try again after update
          const { data: retryData, error: retryError } = await supabaseAdmin
            .from('layer1_income_baselines')
            .select('M_us_nominal')
            .order('year', { ascending: false })
            .limit(1)
            .single();

          if (!retryError && retryData) {
            return retryData.M_us_nominal;
          }
        }

        // Final fallback
        return 80000; // 2023 estimated US median household income
      }

      return data.M_us_nominal;
    } catch (error) {
      console.error('Error getting current M_us_nominal:', error);
      return 80000; // Fallback value
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

  // Get national net worth data by age group (SCF-based static data)
  async getNationalNetWorthData(): Promise<NetWorthData[]> {
    // Survey of Consumer Finances 2022 data - this is static until next SCF release
    const scfData: NetWorthData[] = [
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

    return scfData;
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

  // Enhanced geographic multiplier using real economic data + FRED national baselines
  async calculateEnhancedGeoMultiplier(state: string): Promise<{
    multiplier: number;
    factors: {
      median_income?: number;
      unemployment_rate?: number;
      m_us_nominal?: number;
      base_multiplier: number;
      uses_fred_baseline: boolean;
    };
  }> {
    const stateCode = state.toUpperCase();
    
    // Base multipliers (fallback if no real-time data)
    const baseMultipliers: Record<string, number> = {
      'CA': 1.4, 'NY': 1.4, 'MA': 1.4, 'CT': 1.4, 'NJ': 1.4, 'WA': 1.4, 'MD': 1.4,
      'TX': 1.1, 'FL': 1.1, 'VA': 1.1, 'CO': 1.1, 'IL': 1.1, 'NC': 1.1
    };

    const baseMultiplier = baseMultipliers[stateCode] || 1.0;
    let adjustedMultiplier = baseMultiplier;

    const factors: any = {
      base_multiplier: baseMultiplier,
      uses_fred_baseline: false
    };

    try {
      // Get FRED national baseline for comparison
      const mUsNominal = await this.getCurrentMUsNominal();
      
      if (mUsNominal) {
        factors.m_us_nominal = mUsNominal;
        factors.uses_fred_baseline = true;
      }

      // Get real-time economic indicators
      const [stateMedianIncome, unemploymentRate] = await Promise.all([
        this.getStateMedianIncome(stateCode),
        this.getUnemploymentRate(stateCode)
      ]);

      if (stateMedianIncome !== null && mUsNominal) {
        factors.median_income = stateMedianIncome;
        
        // Use FRED national baseline for comparison (Layer-1 spec)
        const incomeRatio = stateMedianIncome / mUsNominal;
        
        // This is the core Layer-1 calculation: state income vs national baseline
        adjustedMultiplier = Math.sqrt(incomeRatio); // Use square root to moderate extreme adjustments
        
      } else if (stateMedianIncome !== null) {
        factors.median_income = stateMedianIncome;
        // Fallback to static national average (~80,000)
        const incomeRatio = stateMedianIncome / 80000;
        adjustedMultiplier = Math.sqrt(incomeRatio);
      }

      if (unemploymentRate !== null) {
        factors.unemployment_rate = unemploymentRate;
        // Lower unemployment generally correlates with higher net worth
        const unemploymentAdjustment = Math.max(0.8, 1 - (unemploymentRate - 4) / 20);
        adjustedMultiplier *= unemploymentAdjustment;
      }

    } catch (error) {
      console.error('Error calculating enhanced geo multiplier:', error);
    }

    return {
      multiplier: Math.max(0.5, Math.min(2.0, adjustedMultiplier)), // Cap between 0.5x and 2.0x
      factors
    };
  }

  // Nightly cron job: refresh FRED national medians
  async refreshNationalMedians(): Promise<{ success: boolean; message: string }> {
    try {
      const updated = await this.updateMacroIncomeBaselines();
      
      if (updated) {
        return {
          success: true,
          message: 'Successfully updated national income medians from FRED'
        };
      } else {
        return {
          success: false,
          message: 'Failed to update national income medians - using cached values'
        };
      }
    } catch (error) {
      console.error('Error in refreshNationalMedians:', error);
      return {
        success: false,
        message: `Error refreshing national medians: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
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

// Type exports for Layer-1 integration
export type { MacroIncomeBaselines, NetWorthData };
