import { NextRequest, NextResponse } from 'next/server';
import { fredAPI } from '@/lib/fredAPI';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FRED_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'FRED API key not configured',
        configured: false
      }, { status: 500 });
    }

    // Test FRED API connectivity
    const testResult = await fredAPI.getNationalNetWorthData();
    const geoTestResult = await fredAPI.calculateEnhancedGeoMultiplier('CA');

    return NextResponse.json({
      status: 'success',
      message: 'FRED API is fully functional',
      configured: true,
      connectivity: true,
      test_data: {
        national_networth_data_count: testResult.length,
        sample_age_group: testResult[0]?.age_group,
        sample_median: testResult[0]?.median_net_worth,
        geo_multiplier_ca: geoTestResult.multiplier,
        geo_factors_available: !!geoTestResult.factors
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'FRED API test failed',
      configured: !!process.env.FRED_API_KEY,
      connectivity: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
