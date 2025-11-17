// Census ACS (American Community Survey) API Integration
// ZIP-level income and demographic data for enhanced net worth estimation

interface CensusResponse {
  data?: string[][];
  error?: string;
}

interface ZipIncomeData {
  zcta: string;
  median_household_income: number | null;
  median_family_income: number | null;
  total_households: number | null;
  income_distribution: {
    under_10k: number;
    k10_15: number;
    k15_25: number;
    k25_35: number;
    k35_50: number;
    k50_75: number;
    k75_100: number;
    k100_150: number;
    k150_200: number;
    over_200k: number;
  };
  quintiles: {
    q1_upper_limit: number | null;
    q2_upper_limit: number | null;
    q3_upper_limit: number | null;
    q4_upper_limit: number | null;
    q5_mean: number | null;
    gini_index: number | null;
  };
  data_year: number;
  confidence_level: number; // How complete the data is
}

interface AffluenceMetrics {
  affluence_score: number; // 0-1 scale
  wealth_indicators: {
    above_median_rate: number;
    high_income_rate: number; // >$150k
    very_high_income_rate: number; // >$200k
    gini_coefficient: number;
  };
  comparison_to_national: {
    median_income_ratio: number; // Local median / National median
    percentile_rank: number; // Where this ZIP ranks nationally
  };
}

class CensusACSClient {
  private baseUrl = 'https://api.census.gov/data/2023/acs/acs5';
  private apiKey: string | null;
  private nationalMedian = 70000; // Approximate US median household income 2023

  constructor() {
    this.apiKey = process.env.CENSUS_API_KEY || null;
  }

  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const urlParams = new URLSearchParams({
      ...params,
      ...(this.apiKey ? { key: this.apiKey } : {})
    });
    return `${this.baseUrl}${endpoint}?${urlParams.toString()}`;
  }

  private async fetchCensusData(endpoint: string, params: Record<string, string>): Promise<CensusResponse> {
    try {
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Census API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Census API fetch error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get basic median income for a ZIP code (ZCTA)
  async getZipMedianIncome(zipCode: string): Promise<number | null> {
    if (!this.apiKey) {
      console.warn('Census API key not configured');
      return null;
    }

    try {
      const response = await this.fetchCensusData('', {
        get: 'NAME,B19013_001E', // Median household income
        for: `zip code tabulation area:${zipCode}`
      });

      if (response.data && response.data.length > 1) {
        const incomeValue = response.data[1][1]; // Second row, second column
        return incomeValue && incomeValue !== '-666666666' ? parseInt(incomeValue) : null;
      }
    } catch (error) {
      console.error(`Error fetching median income for ZIP ${zipCode}:`, error);
    }

    return null;
  }

  // Get comprehensive income data for a ZIP code
  async getComprehensiveZipData(zipCode: string): Promise<ZipIncomeData | null> {
    if (!this.apiKey) {
      console.warn('Census API key not configured, using fallback estimates');
      return null;
    }

    try {
      // Fetch multiple datasets in parallel
      const [
        medianIncomeResponse,
        familyIncomeResponse,
        incomeDistributionResponse,
        quintilesResponse,
        giniResponse
      ] = await Promise.all([
        // B19013: Median household income
        this.fetchCensusData('', {
          get: 'NAME,B19013_001E',
          for: `zip code tabulation area:${zipCode}`
        }),
        // B19113: Median family income
        this.fetchCensusData('', {
          get: 'NAME,B19113_001E',
          for: `zip code tabulation area:${zipCode}`
        }),
        // B19001: Income distribution by brackets
        this.fetchCensusData('', {
          get: 'NAME,B19001_001E,B19001_002E,B19001_003E,B19001_004E,B19001_005E,B19001_006E,B19001_007E,B19001_008E,B19001_009E,B19001_010E,B19001_011E,B19001_012E,B19001_013E,B19001_014E,B19001_015E,B19001_016E,B19001_017E',
          for: `zip code tabulation area:${zipCode}`
        }),
        // B19080: Income quintile upper limits
        this.fetchCensusData('', {
          get: 'NAME,B19080_001E,B19080_002E,B19080_003E,B19080_004E,B19080_005E',
          for: `zip code tabulation area:${zipCode}`
        }),
        // B19083: Gini index
        this.fetchCensusData('', {
          get: 'NAME,B19083_001E',
          for: `zip code tabulation area:${zipCode}`
        })
      ]);

      // Parse responses
      const medianIncome = this.parseNumericValue(medianIncomeResponse.data, 1, 1);
      const familyIncome = this.parseNumericValue(familyIncomeResponse.data, 1, 1);
      const totalHouseholds = this.parseNumericValue(incomeDistributionResponse.data, 1, 1);
      
      // Parse income distribution
      const distribution = this.parseIncomeDistribution(incomeDistributionResponse.data);
      
      // Parse quintiles
      const quintiles = this.parseQuintiles(quintilesResponse.data, giniResponse.data);

      // Calculate confidence level based on data completeness
      let confidence = 0.5; // Base confidence
      if (medianIncome !== null) confidence += 0.2;
      if (totalHouseholds !== null && totalHouseholds > 100) confidence += 0.1;
      if (distribution && Object.values(distribution).some(v => v > 0)) confidence += 0.1;
      if (quintiles.gini_index !== null) confidence += 0.1;

      return {
        zcta: zipCode,
        median_household_income: medianIncome,
        median_family_income: familyIncome,
        total_households: totalHouseholds,
        income_distribution: distribution || this.getDefaultDistribution(),
        quintiles,
        data_year: 2023,
        confidence_level: Math.min(confidence, 1.0)
      };

    } catch (error) {
      console.error(`Error fetching comprehensive data for ZIP ${zipCode}:`, error);
      return null;
    }
  }

  private parseNumericValue(data: string[][] | undefined, row: number, col: number): number | null {
    if (!data || data.length <= row || data[row].length <= col) return null;
    const value = data[row][col];
    return value && value !== '-666666666' && value !== '.' ? parseInt(value) : null;
  }

  private parseIncomeDistribution(data: string[][] | undefined) {
    if (!data || data.length <= 1) return null;
    
    const row = data[1];
    if (row.length < 18) return null;

    try {
      return {
        under_10k: parseInt(row[2] || '0'),      // B19001_002E
        k10_15: parseInt(row[3] || '0'),         // B19001_003E
        k15_25: parseInt(row[4] || '0'),         // B19001_004E
        k25_35: parseInt(row[5] || '0'),         // B19001_005E
        k35_50: parseInt(row[6] || '0') + parseInt(row[7] || '0'), // B19001_006E + 007E
        k50_75: parseInt(row[8] || '0') + parseInt(row[9] || '0'), // B19001_008E + 009E
        k75_100: parseInt(row[10] || '0') + parseInt(row[11] || '0'), // B19001_010E + 011E
        k100_150: parseInt(row[12] || '0') + parseInt(row[13] || '0'), // B19001_012E + 013E
        k150_200: parseInt(row[14] || '0'),      // B19001_014E
        over_200k: parseInt(row[15] || '0') + parseInt(row[16] || '0') + parseInt(row[17] || '0') // B19001_015E + 016E + 017E
      };
    } catch (error) {
      return null;
    }
  }

  private parseQuintiles(quintilesData: string[][] | undefined, giniData: string[][] | undefined) {
    const quintiles = {
      q1_upper_limit: null as number | null,
      q2_upper_limit: null as number | null,
      q3_upper_limit: null as number | null,
      q4_upper_limit: null as number | null,
      q5_mean: null as number | null,
      gini_index: null as number | null
    };

    if (quintilesData && quintilesData.length > 1) {
      const row = quintilesData[1];
      quintiles.q1_upper_limit = this.parseNumericValue(quintilesData, 1, 2);
      quintiles.q2_upper_limit = this.parseNumericValue(quintilesData, 1, 3);
      quintiles.q3_upper_limit = this.parseNumericValue(quintilesData, 1, 4);
      quintiles.q4_upper_limit = this.parseNumericValue(quintilesData, 1, 5);
    }

    if (giniData && giniData.length > 1) {
      const giniValue = giniData[1][1];
      quintiles.gini_index = giniValue && giniValue !== '.' ? parseFloat(giniValue) : null;
    }

    return quintiles;
  }

  private getDefaultDistribution() {
    return {
      under_10k: 0, k10_15: 0, k15_25: 0, k25_35: 0, k35_50: 0,
      k50_75: 0, k75_100: 0, k100_150: 0, k150_200: 0, over_200k: 0
    };
  }

  // Calculate affluence metrics from ZIP income data
  calculateAffluenceMetrics(zipData: ZipIncomeData): AffluenceMetrics {
    const medianIncome = zipData.median_household_income || this.nationalMedian;
    const distribution = zipData.income_distribution;
    const totalHouseholds = Object.values(distribution).reduce((a, b) => a + b, 0);

    // Calculate high-income rates
    const highIncomeHouseholds = distribution.k150_200 + distribution.over_200k;
    const veryHighIncomeHouseholds = distribution.over_200k;
    const aboveMedianHouseholds = distribution.k75_100 + distribution.k100_150 + 
                                  distribution.k150_200 + distribution.over_200k;

    const highIncomeRate = totalHouseholds > 0 ? highIncomeHouseholds / totalHouseholds : 0;
    const veryHighIncomeRate = totalHouseholds > 0 ? veryHighIncomeHouseholds / totalHouseholds : 0;
    const aboveMedianRate = totalHouseholds > 0 ? aboveMedianHouseholds / totalHouseholds : 0.5;

    // Calculate affluence score (0-1 scale)
    const incomeRatio = medianIncome / this.nationalMedian;
    const wealthIndicator = (highIncomeRate * 0.4) + (veryHighIncomeRate * 0.6);
    const giniBonus = zipData.quintiles.gini_index ? 
                      Math.max(0, (zipData.quintiles.gini_index - 0.4) * 2) : 0; // Higher inequality often correlates with high earners

    const affluenceScore = Math.min(1.0, 
      (incomeRatio * 0.5) + (wealthIndicator * 0.3) + (giniBonus * 0.2)
    );

    // Estimate national percentile rank
    const percentileRank = Math.min(99, Math.max(1, 
      50 + (incomeRatio - 1) * 30 + (highIncomeRate * 40)
    ));

    return {
      affluence_score: affluenceScore,
      wealth_indicators: {
        above_median_rate: aboveMedianRate,
        high_income_rate: highIncomeRate,
        very_high_income_rate: veryHighIncomeRate,
        gini_coefficient: zipData.quintiles.gini_index || 0.4
      },
      comparison_to_national: {
        median_income_ratio: incomeRatio,
        percentile_rank: percentileRank
      }
    };
  }

  // Enhanced ZIP-based multiplier calculation
  async calculateZipBasedMultiplier(zipCode: string): Promise<{
    multiplier: number;
    factors: {
      median_income?: number;
      affluence_score?: number;
      high_income_rate?: number;
      confidence_level?: number;
      data_source: string;
    };
  }> {
    try {
      const zipData = await this.getComprehensiveZipData(zipCode);
      
      if (!zipData || zipData.confidence_level < 0.3) {
        // Fallback to basic median income lookup
        const medianIncome = await this.getZipMedianIncome(zipCode);
        if (medianIncome) {
          const incomeMultiplier = Math.sqrt(medianIncome / this.nationalMedian);
          return {
            multiplier: Math.max(0.6, Math.min(2.5, incomeMultiplier)),
            factors: {
              median_income: medianIncome,
              confidence_level: 0.3,
              data_source: 'CENSUS_ACS_BASIC'
            }
          };
        }

        // Final fallback - estimate from ZIP pattern
        return this.estimateFromZipPattern(zipCode);
      }

      // Full ACS data available - calculate comprehensive multiplier
      const affluenceMetrics = this.calculateAffluenceMetrics(zipData);
      
      // Base multiplier from income ratio
      let multiplier = Math.sqrt(affluenceMetrics.comparison_to_national.median_income_ratio);
      
      // Enhance with affluence indicators
      multiplier *= (1 + affluenceMetrics.affluence_score * 0.5); // Up to 50% boost for very affluent areas
      
      // High earner concentration bonus
      if (affluenceMetrics.wealth_indicators.very_high_income_rate > 0.15) {
        multiplier *= 1.3; // Significant boost for areas with >15% of households earning >$200k
      } else if (affluenceMetrics.wealth_indicators.high_income_rate > 0.25) {
        multiplier *= 1.15; // Moderate boost for areas with >25% earning >$150k
      }

      // Cap the multiplier to reasonable bounds
      const finalMultiplier = Math.max(0.5, Math.min(3.0, multiplier));

      return {
        multiplier: finalMultiplier,
        factors: {
          median_income: zipData.median_household_income || undefined,
          affluence_score: affluenceMetrics.affluence_score,
          high_income_rate: affluenceMetrics.wealth_indicators.high_income_rate,
          confidence_level: zipData.confidence_level,
          data_source: 'CENSUS_ACS_COMPREHENSIVE'
        }
      };

    } catch (error) {
      console.error(`Error calculating ZIP multiplier for ${zipCode}:`, error);
      return this.estimateFromZipPattern(zipCode);
    }
  }

  private estimateFromZipPattern(zipCode: string): {
    multiplier: number;
    factors: { data_source: string; confidence_level: number };
  } {
    // Very basic ZIP pattern estimation as ultimate fallback
    const firstDigit = parseInt(zipCode.charAt(0));
    
    // Rough geographic multipliers based on ZIP first digit
    const regionalMultipliers: Record<number, number> = {
      0: 1.2, // Northeast (CT, MA, ME, NH, NJ, NY, PR, RI, VT, VI)
      1: 1.1, // Northeast (DE, NY, PA)
      2: 1.0, // Southeast (DC, MD, NC, SC, VA, WV)
      3: 0.9, // Southeast (AL, FL, GA, MS, TN)
      4: 0.9, // Southeast (IN, KY, MI, OH)
      5: 0.8, // South Central (IA, MN, MT, ND, SD, WI)
      6: 0.9, // South Central (IL, KS, MO, NE)
      7: 0.9, // South Central (AR, LA, OK, TX)
      8: 1.0, // Western (AZ, CO, ID, NM, NV, UT, WY)
      9: 1.3  // Western (AK, CA, HI, OR, WA)
    };

    return {
      multiplier: regionalMultipliers[firstDigit] || 1.0,
      factors: {
        data_source: 'ZIP_PATTERN_FALLBACK',
        confidence_level: 0.1
      }
    };
  }
}

// Singleton instance
export const censusAPI = new CensusACSClient();

// Helper functions for ZIP code validation and conversion
export function validateZipCode(zip: string): string | null {
  // Clean and validate ZIP code
  const cleanZip = zip.replace(/\D/g, '').slice(0, 5);
  return cleanZip.length === 5 ? cleanZip : null;
}

export function zipToZCTA(zip: string): string {
  // Most ZIP codes map directly to ZCTAs, but this function could be enhanced
  // with a lookup table for edge cases where they differ
  return validateZipCode(zip) || zip;
}
