import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fredAPI, determineAgeGroup } from '@/lib/fredAPI';

// Log event helper
async function logEvent(uid: string, type: string, meta: any = {}) {
  try {
    await supabaseAdmin
      .from('pass_events')
      .insert({
        uid,
        type,
        meta_json: meta
      });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

// Check if profile is complete enough for net worth estimation
function checkProfileCompleteness(member: any): { complete: boolean; missing: string[] } {
  const required = ['profile_age', 'profile_state', 'profile_zip'];
  const optional = ['profile_city', 'profile_street1', 'profile_gender'];
  
  const missing: string[] = [];
  const present: string[] = [];

  // Check required fields
  for (const field of required) {
    if (!member[field]) {
      missing.push(field.replace('profile_', ''));
    } else {
      present.push(field);
    }
  }

  // Check optional fields for better estimates
  for (const field of optional) {
    if (member[field]) {
      present.push(field);
    }
  }

  return {
    complete: missing.length === 0,
    missing: missing
  };
}

// Enhanced Layer-1 Net Worth Engine with FRED API Integration
async function calculateLayer1Estimate(member: any): Promise<{
  networth_low_usd: number;
  networth_high_usd: number;
  networth_mid_usd: number;
  confidence_0_1: number;
  signals: any;
}> {
  const age = member.profile_age || 30;
  const zip = member.profile_zip;
  const state = member.profile_state;
  const hasAddress = !!member.profile_street1;

  // Determine age band using helper function
  const ageBand = determineAgeGroup(age);

  try {
    // Get enhanced Federal Reserve data
    const [netWorthData, geoData] = await Promise.all([
      fredAPI.getNationalNetWorthData(),
      fredAPI.calculateEnhancedGeoMultiplier(state)
    ]);

    // Find matching age group data
    const ageData = netWorthData.find(data => data.age_group === ageBand);
    
    if (!ageData) {
      throw new Error(`No data found for age group: ${ageBand}`);
    }

    // Use enhanced geographic multiplier from FRED API
    const geoMultiplier = geoData.multiplier;
    const geoFactors = geoData.factors;

    // Address premium (property ownership proxy)
    let addressMultiplier = 1.0;
    if (hasAddress) {
      addressMultiplier = 1.3; // Homeowners typically have higher net worth
    }

    // Calculate enhanced estimate using real FRED data
    const baseMedian = ageData.median_net_worth * geoMultiplier * addressMultiplier;
    const baseP90 = ageData.p90_net_worth * geoMultiplier * addressMultiplier;

    // Create range using percentile data
    const low = Math.round(ageData.p25_net_worth * geoMultiplier * addressMultiplier);
    const high = Math.round(baseP90 * 1.1); // Slight adjustment for upper bound
    const mid = Math.round((baseMedian + ageData.p75_net_worth * geoMultiplier * addressMultiplier) / 2);

    // Enhanced confidence calculation
    let confidence = 0.4; // Higher base confidence with real data
    if (age && state) confidence += 0.2;
    if (zip) confidence += 0.1;
    if (hasAddress) confidence += 0.2;
    if (member.profile_city) confidence += 0.1;
    
    // Bonus confidence for real-time FRED data availability
    if (geoFactors.median_income) confidence += 0.1;
    if (geoFactors.unemployment_rate) confidence += 0.05;

    const signals = {
      age_band: ageBand,
      nw_median_age: ageData.median_net_worth,
      nw_p25_age: ageData.p25_net_worth,
      nw_p75_age: ageData.p75_net_worth,
      nw_p90_age: ageData.p90_net_worth,
      geo_multiplier: geoMultiplier,
      geo_factors: geoFactors,
      address_multiplier: addressMultiplier,
      has_address: hasAddress,
      state: state,
      zip: zip,
      data_source: ageData.source,
      data_year: ageData.year,
      fred_enhanced: true
    };

    return {
      networth_low_usd: low,
      networth_high_usd: high,
      networth_mid_usd: mid,
      confidence_0_1: Math.min(confidence, 0.8), // Cap at 80%
      signals
    };

  } catch (error) {
    console.error('FRED API error, falling back to static data:', error);
    
    // Fallback to static SCF 2022 data if FRED API fails
    const staticNetWorthByAge: Record<string, { median: number; p80: number; p90: number }> = {
      '18-34': { median: 39000, p80: 170000, p90: 400000 },
      '35-44': { median: 135000, p80: 550000, p90: 1040000 },
      '45-54': { median: 246000, p80: 850000, p90: 1960000 },
      '55-64': { median: 364000, p80: 1200000, p90: 2800000 },
      '65-74': { median: 410000, p80: 1300000, p90: 3200000 },
      '75+': { median: 335000, p80: 950000, p90: 2400000 }
    };

    const ageData = staticNetWorthByAge[ageBand];
    
    // Basic geographic adjustment (fallback)
    const highIncomeStates = ['CA', 'NY', 'MA', 'CT', 'NJ', 'WA', 'MD'];
    const moderateStates = ['TX', 'FL', 'VA', 'CO', 'IL', 'NC'];
    
    let geoMultiplier = 1.0;
    if (highIncomeStates.includes(state)) {
      geoMultiplier = 1.4;
    } else if (moderateStates.includes(state)) {
      geoMultiplier = 1.1;
    }

    let addressMultiplier = 1.0;
    if (hasAddress) {
      addressMultiplier = 1.3;
    }

    const baseMedian = ageData.median * geoMultiplier * addressMultiplier;
    const baseP80 = ageData.p80 * geoMultiplier * addressMultiplier;

    const low = Math.round(baseMedian * 0.7);
    const high = Math.round(baseP80 * 1.2);
    const mid = Math.round((low + high) / 2);

    let confidence = 0.3; // Lower confidence for static data
    if (age && state) confidence += 0.2;
    if (zip) confidence += 0.1;
    if (hasAddress) confidence += 0.2;
    if (member.profile_city) confidence += 0.1;

    const signals = {
      age_band: ageBand,
      nw_median_age: ageData.median,
      nw_p80_age: ageData.p80,
      geo_multiplier: geoMultiplier,
      address_multiplier: addressMultiplier,
      has_address: hasAddress,
      state: state,
      zip: zip,
      data_source: 'SCF_2022_FALLBACK',
      fred_enhanced: false,
      fallback_reason: error instanceof Error ? error.message : 'Unknown error'
    };

    return {
      networth_low_usd: low,
      networth_high_usd: high,
      networth_mid_usd: mid,
      confidence_0_1: Math.min(confidence, 0.8),
      signals
    };
  }
}

// Claude AI Layer-2 Enhancement
async function enhanceWithClaudeAI(layer1Result: any, member: any): Promise<{
  final_estimate_low: number;
  final_estimate_high: number;
  band_label: string;
  reasoning_summary: string;
  confidence_0_1: number;
  disclaimer: string;
}> {
  const { networth_low_usd, networth_high_usd, confidence_0_1, signals } = layer1Result;
  
  // Format band label
  const formatBand = (low: number, high: number): string => {
    const formatMoney = (amount: number) => {
      if (amount >= 1000000) {
        return `$${Math.round(amount / 100000) / 10}M`;
      }
      return `$${Math.round(amount / 1000)}k`;
    };
    return `${formatMoney(low)} - ${formatMoney(high)}`;
  };

  // Try Claude AI enhancement if API key is available
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  if (claudeApiKey) {
    try {
      // Prepare context for Claude
      const context = {
        profile: {
          age: member.profile_age,
          state: member.profile_state,
          zip: member.profile_zip,
          city: member.profile_city,
          has_address: signals.has_address
        },
        layer1_estimate: {
          low: networth_low_usd,
          high: networth_high_usd,
          confidence: confidence_0_1
        },
        signals: signals
      };

      const systemPrompt = `You are a financial estimation engine for HUSHH. Analyze the provided demographic and statistical data to refine a net worth estimate.

CONTEXT: You have Layer-1 statistical data based on Federal Reserve SCF data, age demographics, and geographic indicators.

TASK: Provide a refined estimate with human-readable reasoning.

CONSTRAINTS:
- Always provide a range, never a point estimate
- Base reasoning on demographic patterns and economic indicators
- Include confidence assessment
- Be transparent about limitations
- Keep reasoning concise but informative

Respond with JSON only:
{
  "final_estimate_low": number,
  "final_estimate_high": number,
  "band_label": "string like $X-$Y",
  "reasoning_summary": "concise explanation",
  "confidence_0_1": 0.1-0.8,
  "disclaimer": "standard disclaimer"
}`;

      const userPrompt = `Profile: Age ${context.profile.age}, ${context.profile.state} state${context.profile.has_address ? ', homeowner indicator' : ''}
Layer-1 estimate: $${(context.layer1_estimate.low / 1000).toFixed(0)}k - $${(context.layer1_estimate.high / 1000).toFixed(0)}k
Signals: ${JSON.stringify(context.signals)}

Refine this estimate and provide reasoning.`;

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userPrompt
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const claudeResponse = data.content[0].text;
        
        // Parse Claude's JSON response
        try {
          const parsed = JSON.parse(claudeResponse);
          
          // Validate the response structure
          if (parsed.final_estimate_low && parsed.final_estimate_high && parsed.reasoning_summary) {
            return {
              final_estimate_low: Math.round(parsed.final_estimate_low),
              final_estimate_high: Math.round(parsed.final_estimate_high),
              band_label: parsed.band_label || formatBand(parsed.final_estimate_low, parsed.final_estimate_high),
              reasoning_summary: parsed.reasoning_summary,
              confidence_0_1: Math.min(Math.max(parsed.confidence_0_1 || confidence_0_1, 0.1), 0.8),
              disclaimer: parsed.disclaimer || "This is an AI-powered estimate based on demographic and regional data, not your actual financial accounts. Individual circumstances vary significantly. Not financial advice."
            };
          }
        } catch (parseError) {
          console.error('Failed to parse Claude response:', parseError);
        }
      }
    } catch (error) {
      console.error('Claude API error:', error);
    }
  }

  // Fallback to Layer-1 with enhanced reasoning if Claude fails
  let reasoning = `Based on your age (${member.profile_age}) and location (${member.profile_state}), `;
  reasoning += `you fall into the ${signals.age_band} demographic where median net worth is around `;
  reasoning += `$${(signals.nw_median_age / 1000).toFixed(0)}k. `;
  
  if (signals.geo_multiplier > 1.2) {
    reasoning += `Your state has higher-than-average income levels, which typically correlates with higher net worth. `;
  }
  
  if (signals.has_address) {
    reasoning += `Having a street address suggests homeownership, and homeowners in your age group typically have `;
    reasoning += `30-50% higher net worth due to real estate equity. `;
  }
  
  reasoning += `This estimate combines Federal Reserve Survey of Consumer Finances data with regional economic indicators.`;

  return {
    final_estimate_low: networth_low_usd,
    final_estimate_high: networth_high_usd,
    band_label: formatBand(networth_low_usd, networth_high_usd),
    reasoning_summary: reasoning,
    confidence_0_1: confidence_0_1,
    disclaimer: "This is an estimate based on demographic and regional data, not your actual financial accounts. Individual circumstances vary significantly. Not financial advice."
  };
}

// Store estimate in database
async function storeEstimate(uid: string, layer1: any, layer2: any) {
  try {
    const estimateData = {
      uid,
      method: 'ai_estimated',
      layer1_low: layer1.networth_low_usd,
      layer1_high: layer1.networth_high_usd,
      layer1_confidence: layer1.confidence_0_1,
      layer1_signals_json: layer1.signals,
      final_low: layer2.final_estimate_low,
      final_high: layer2.final_estimate_high,
      final_confidence: layer2.confidence_0_1,
      band_label: layer2.band_label,
      reasoning: layer2.reasoning_summary,
      disclaimer: layer2.disclaimer,
      estimated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Upsert estimate
    const { error } = await supabaseAdmin
      .from('networth_estimates')
      .upsert(estimateData, { onConflict: 'uid' });

    if (error) {
      console.error('Failed to store estimate:', error);
    }
  } catch (error) {
    console.error('Error storing estimate:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'UID parameter is required' },
        { status: 400 }
      );
    }

    // Get member from database
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('uid', uid)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if member's pass is active
    if (member.pass_status !== 'active') {
      return NextResponse.json(
        { error: 'Pass is not active' },
        { status: 403 }
      );
    }

    // Log net worth request
    await logEvent(uid, 'networth_requested', {
      user_agent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Check if profile is complete enough
    const profileCheck = checkProfileCompleteness(member);
    if (!profileCheck.complete) {
      // Enhanced profile completion with redirect logic
      const requiredFields = profileCheck.missing.join(',');
      const redirectUrl = `/complete/${uid}?required=${requiredFields}&return=/networth/${uid}`;
      
      return NextResponse.json(
        { 
          error: 'Profile incomplete', 
          message: `Please complete your profile first. Missing: ${profileCheck.missing.join(', ')}`,
          missing_fields: profileCheck.missing,
          redirect_url: redirectUrl,
          action: 'redirect_to_profile'
        },
        { status: 400 }
      );
    }

    // Check for existing recent estimate (within last 24 hours)
    const { data: existingEstimate } = await supabaseAdmin
      .from('networth_estimates')
      .select('*')
      .eq('uid', uid)
      .gte('estimated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('estimated_at', { ascending: false })
      .limit(1)
      .single();

    if (existingEstimate && !searchParams.get('refresh')) {
      // Return cached estimate
      await logEvent(uid, 'networth_served_cached', {});
      
      return NextResponse.json({
        uid: existingEstimate.uid,
        estimateLow: existingEstimate.final_low,
        estimateHigh: existingEstimate.final_high,
        bandLabel: existingEstimate.band_label,
        confidence: existingEstimate.final_confidence,
        reasoning: existingEstimate.reasoning,
        disclaimer: existingEstimate.disclaimer,
        lastUpdated: existingEstimate.estimated_at,
        cached: true
      });
    }

    // Generate new estimate
    const layer1Result = await calculateLayer1Estimate(member);
    const layer2Result = await enhanceWithClaudeAI(layer1Result, member);

    // Store the estimate
    await storeEstimate(uid, layer1Result, layer2Result);

    // Log successful estimation
    await logEvent(uid, 'networth_estimated', {
      method: 'ai_estimated',
      confidence: layer2Result.confidence_0_1,
      band: layer2Result.band_label
    });

    // Return the estimate
    return NextResponse.json({
      uid,
      estimateLow: layer2Result.final_estimate_low,
      estimateHigh: layer2Result.final_estimate_high,
      bandLabel: layer2Result.band_label,
      confidence: layer2Result.confidence_0_1,
      reasoning: layer2Result.reasoning_summary,
      disclaimer: layer2Result.disclaimer,
      lastUpdated: new Date().toISOString(),
      cached: false
    });

  } catch (error) {
    console.error('Net worth estimation error:', error);
    
    // Log error
    if (request.nextUrl.searchParams.get('uid')) {
      await logEvent(request.nextUrl.searchParams.get('uid')!, 'networth_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
