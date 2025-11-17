import { NextRequest, NextResponse } from 'next/server';
import { censusAPI, validateZipCode } from '@/lib/censusAPI';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CENSUS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Census API key not configured',
        configured: false
      }, { status: 500 });
    }

    // Test Census API connectivity with a sample ZIP code
    const testZip = validateZipCode('10001'); // Manhattan, NY
    if (!testZip) {
      throw new Error('Invalid test ZIP code');
    }
    const testResult = await censusAPI.calculateZipBasedMultiplier(testZip);

    return NextResponse.json({
      status: 'success',
      message: 'Census API is fully functional',
      configured: true,
      connectivity: true,
      test_data: {
        test_zip: testZip,
        multiplier: testResult.multiplier,
        factors: testResult.factors,
        confidence_level: testResult.factors.confidence_level,
        affluence_score: testResult.factors.affluence_score
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Census API test failed',
      configured: !!process.env.CENSUS_API_KEY,
      connectivity: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
