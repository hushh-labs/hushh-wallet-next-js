import { NextRequest, NextResponse } from 'next/server';
import { blsAPI, mapUserAgeToAgeBand, calculateAgeIncomeEffect } from '@/lib/blsAPI';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BLS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'BLS API key not configured',
        configured: false
      }, { status: 500 });
    }

    // Test BLS API connectivity with a sample age
    const testAge = 35;
    const testAgeBand = mapUserAgeToAgeBand(testAge);
    const testResult = await blsAPI.getAgeEarnings(testAgeBand);
    
    let ageIncomeEffect = null;
    let ageAnalysis = null;
    
    if (testResult) {
      ageIncomeEffect = calculateAgeIncomeEffect(testResult.age_income_index);
      ageAnalysis = blsAPI.analyzeAgeIncome(testAge, testResult);
    }

    return NextResponse.json({
      status: 'success',
      message: 'BLS API is fully functional',
      configured: true,
      connectivity: true,
      test_data: {
        test_age: testAge,
        age_band: testAgeBand,
        age_earnings_data: testResult,
        age_income_effect: ageIncomeEffect,
        analysis: ageAnalysis
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'BLS API test failed',
      configured: !!process.env.BLS_API_KEY,
      connectivity: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
