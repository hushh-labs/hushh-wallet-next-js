# 🧮 HUSHH Networth Layer-1 — Complete Specification

## 0. Purpose & Constraints

### Goal
HUSHH Networth Layer-1 is a **deterministic estimation engine** that uses only existing user profile data combined with public statistical data sources to generate approximate net worth ranges for any `uid`.

### Core Principles
- **No User Input Required**: Uses only existing profile data (`age`, `zip`, `state`, `address`)
- **Public Data Only**: Census ACS API + Federal Reserve SCF + Optional Property AVM
- **Range-Based Output**: Always provides ranges, never point estimates
- **Privacy-First**: No access to financial accounts or salary information
- **Fairness**: Gender-neutral algorithms, geographic bias awareness

### Input Data (Available from Profile)
```json
{
  "uid": "string",
  "profile_age": "number (13-120)",
  "profile_state": "string (2-letter US code)",
  "profile_zip": "string (5 or 5+4 digits)",
  "profile_city": "string",
  "profile_street1": "string (optional for property signals)",
  "profile_gender": "string (NOT used in calculations)",
  "created_at": "ISO timestamp",
  "last_seen_at": "ISO timestamp"
}
```

### Constraints
- ❌ No asset/liability forms or salary inputs
- ❌ No gender-based predictions
- ❌ No exact point estimates
- ✅ Only ZIP, state, age, address + public statistical data
- ✅ Output always as confidence-scored ranges
- ✅ Transparent methodology with explainable factors

---

## 1. Layer-1 Function Specification

### 1.1 Input/Output Contract

**Input:** `uid` → profile data lookup  
**Output:** Layer-1 estimation object

```json
{
  "uid": "jNJXgr32",
  "layer1": {
    "networth_low_usd": 1200000,
    "networth_high_usd": 2500000,
    "networth_mid_usd": 1850000,
    "confidence_0_1": 0.73,
    "bands": {
      "networth_band_label": "1M–3M",
      "zip_affluence_band": "state_top_10",
      "age_networth_band": "p80_to_p90_for_age"
    },
    "signals": {
      "age": 42,
      "age_band": "35-44",
      "M_zip": 150000,
      "M_us": 80000,
      "affluence_index_zip": 1.87,
      "NW_median_age": 135600,
      "NW_p80_age": 546300,
      "NW_p90_age": 1042300,
      "home_value_mid": 2200000,
      "home_equity_est": 660000,
      "zip_income_percentile_state": 95,
      "p_high_income": 0.32,
      "has_property_signal": true,
      "posh_zip_qualifier": true
    }
  }
}
```

---

## 2. External Data Sources & API Endpoints

### 2.1 Census ACS (American Community Survey) 5-Year Data

**Base URLs:**
- Dataset Root: `https://api.census.gov/data/2023/acs/acs5.html`
- Variables List: `https://api.census.gov/data/2023/acs/acs5/variables.html`
- Geography Reference: `https://api.census.gov/data/2023/acs/acs5/geography.html`

> **Note:** Uses ZCTAs (ZIP Code Tabulation Areas), not USPS ZIP codes

#### (a) Median Household Income by ZCTA — Table B19013
```
GET https://api.census.gov/data/2023/acs/acs5
  ?get=NAME,B19013_001E
  &for=zip%20code%20tabulation%20area:98109
  &key=YOUR_CENSUS_API_KEY
```
- **Variable:** `B19013_001E` = Median household income
- **Output:** `M_zip` (median income for ZCTA)

#### (b) Income Distribution by Brackets — Table B19001
```
GET https://api.census.gov/data/2023/acs/acs5
  ?get=NAME,B19001_001E,B19001_002E,...,B19001_017E
  &for=zip%20code%20tabulation%20area:98109
  &key=YOUR_CENSUS_API_KEY
```
- **Variables:**
  - `B19001_001E` = Total households
  - `B19001_002E` through `B19001_017E` = Income brackets from <$10k to $200k+
- **Output:** Income distribution for `p_high_income` calculation

#### (c) Income Quintiles & Inequality — Tables B19080, B19081, B19082, B19083
```
GET https://api.census.gov/data/2023/acs/acs5
  ?get=NAME,B19080_002E,B19080_003E,B19080_004E,B19080_005E,B19083_001E
  &for=zip%20code%20tabulation%20area:98109
  &key=YOUR_CENSUS_API_KEY
```
- **B19080:** Quintile upper limits
- **B19081:** Mean income by quintile
- **B19082:** Income share by quintile
- **B19083:** Gini coefficient
- **Output:** Elite income distribution analysis

### 2.2 Net Worth by Age (Federal Reserve SCF Data)

**Static Configuration Table** (embedded, no API):
```json
{
  "18-34": { "median": 39000, "p80": 200000, "p90": 400000 },
  "35-44": { "median": 135600, "p80": 546300, "p90": 1042300 },
  "45-54": { "median": 246000, "p80": 850000, "p90": 1960000 },
  "55-64": { "median": 364000, "p80": 1200000, "p90": 2800000 },
  "65-74": { "median": 410000, "p80": 1300000, "p90": 3200000 },
  "75+": { "median": 335000, "p80": 950000, "p90": 2400000 }
}
```
- **Source:** Federal Reserve Survey of Consumer Finances (2022)
- **Variables:** `NW_median_age`, `NW_p80_age`, `NW_p90_age`

### 2.3 National Baseline Income

**Constant:** `M_us = 80000` (US median household income, 2023)
- **Alternative:** FRED API `MEHOINUSA646N` for real-time updates

### 2.4 Property AVM (Optional Enhancement)

**APIs:** RentCast, Zillow-style AVM services
- **Input:** `profile_street1` + `profile_city` + `profile_state` + `profile_zip`
- **Output:** `home_value_low`, `home_value_high` → `home_value_mid`, `home_equity_est`

---

## 3. Database Schema (Supabase)

### 3.1 `geo_zcta_signals` Table

**Purpose:** Precomputed Census signals per ZCTA

```sql
CREATE TABLE geo_zcta_signals (
  zcta TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  median_household_income NUMERIC,
  income_bracket_counts_json JSONB,
  households_total NUMERIC,
  p_high_income NUMERIC, -- Share of HH with income ≥ $200k
  income_quintile_limits_json JSONB,
  gini_index NUMERIC,
  affluence_index_zip NUMERIC, -- M_zip / M_us, clamped 0.5-2.0
  income_percentile_state NUMERIC, -- 0-100 rank within state
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 `networth_layer1` Table

**Purpose:** Store Layer-1 results per UID

```sql
CREATE TABLE networth_layer1 (
  uid TEXT PRIMARY KEY,
  networth_low_usd NUMERIC NOT NULL,
  networth_high_usd NUMERIC NOT NULL,
  networth_mid_usd NUMERIC NOT NULL,
  confidence_0_1 NUMERIC NOT NULL,
  networth_band_label TEXT NOT NULL,
  geo_zcta_used TEXT,
  age_band TEXT NOT NULL,
  signals_json JSONB NOT NULL,
  source_version TEXT NOT NULL, -- e.g., 'ACS5_2023_SCF_v1'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Offline Data Ingestion Pipeline

### 4.1 ZCTA Universe Selection

**Option A (Complete):** Ingest all ~33,000 US ZCTAs
**Option B (Lazy):** Only ZCTAs that appear in `members.profile_zip`

### 4.2 Census Data Ingestion Workflow

#### Step 1: Median Income Collection
```python
for zcta in zcta_list:
    response = census_api.get(
        variables=['NAME', 'B19013_001E'],
        for_clause=f'zip code tabulation area:{zcta}',
        year=2023,
        dataset='acs/acs5'
    )
    
    M_zip = parse_numeric(response['B19013_001E'])
    affluence_index_zip = clamp(M_zip / M_us, 0.5, 2.0)
    
    # Store in geo_zcta_signals
```

#### Step 2: Income Distribution Analysis
```python
# Fetch all B19001 variables for income brackets
income_brackets = census_api.get(
    variables=['B19001_001E'] + [f'B19001_{i:03d}E' for i in range(2, 18)],
    for_clause=f'zip code tabulation area:{zcta}'
)

total_households = income_brackets['B19001_001E']
high_income_count = income_brackets['B19001_016E'] + income_brackets['B19001_017E']
p_high_income = high_income_count / total_households if total_households > 0 else 0
```

#### Step 3: State Percentile Ranking
```python
# After all ZCTAs in a state are processed
state_incomes = get_all_M_zip_for_state(state)
for zcta in state_zctas:
    percentile = scipy.stats.percentileofscore(state_incomes, zcta.M_zip)
    zcta.income_percentile_state = percentile
```

---

## 5. Per-UID Inference Pipeline (Core Algorithm)

### 5.1 Feature Extraction

```python
# From user profile
age = profile.profile_age
zcta = normalize_zip(profile.profile_zip)  # First 5 digits
state = profile.profile_state
has_address = bool(profile.profile_street1)

# Age band mapping
age_band = map_age_to_band(age)  # 18-34, 35-44, etc.

# From geo_zcta_signals
geo_data = get_zcta_signals(zcta)
M_zip = geo_data.median_household_income
affluence_index_zip = geo_data.affluence_index_zip
p_high_income = geo_data.p_high_income
income_percentile_state = geo_data.income_percentile_state

# From SCF config
scf_data = get_scf_data(age_band)
NW_median_age = scf_data.median
NW_p80_age = scf_data.p80
NW_p90_age = scf_data.p90
```

### 5.2 Core Calculation Formula

#### Step A: Age + Geographic Baseline
```python
# Base calculation
NW_geo_age_base = NW_median_age * affluence_index_zip

# Extreme value protection
min_bound = 0.5 * NW_median_age
max_bound = 3 * NW_p90_age
NW_geo_age_clamped = clamp(NW_geo_age_base, min_bound, max_bound)

# Initial range
baseline_low = 0.7 * NW_geo_age_clamped
baseline_high = 1.3 * NW_geo_age_clamped
```

#### Step B: Property Ownership Adjustment
```python
if has_address and avm_available:
    home_equity_est = estimate_home_equity(profile)
    
    home_low = baseline_low + (0.8 * home_equity_est)
    home_high = baseline_high + (1.2 * home_equity_est)
else:
    home_low = baseline_low
    home_high = baseline_high
```

#### Step C: "POSH ZIP" Affluence Boost
```python
# Define high-affluence areas
posh_zip_qualifier = (
    p_high_income > 0.30 or 
    income_percentile_state > 90
)

if posh_zip_qualifier:
    boost_factor = 1.2
    boosted_low = home_low * boost_factor
    boosted_high = home_high * boost_factor
    
    # Ultimate safety cap
    ultimate_max = 5 * NW_p90_age
    final_low = min(boosted_low, ultimate_max)
    final_high = min(boosted_high, ultimate_max)
else:
    final_low = home_low
    final_high = home_high
```

#### Step D: Final Values & Confidence
```python
final_mid = (final_low + final_high) / 2

# Confidence scoring (0-1 scale)
confidence = 0.2  # Base confidence

# Data availability bonuses
if M_zip is not None: confidence += 0.2
if scf_data: confidence += 0.2  # Always available
if p_high_income and income_percentile_state: confidence += 0.1
if home_equity_est: confidence += 0.3

confidence = min(confidence, 1.0)  # Cap at 100%
```

### 5.3 Band Classification

#### Net Worth Bands
```python
def classify_networth_band(final_mid):
    if final_mid < 25000: return "< 25k"
    elif final_mid < 100000: return "25k–100k"
    elif final_mid < 250000: return "100k–250k"
    elif final_mid < 1000000: return "250k–1M"
    elif final_mid < 3000000: return "1M–3M"
    elif final_mid < 10000000: return "3M–10M"
    else: return "10M+"
```

#### ZIP Affluence Classification
```python
def classify_zip_affluence(income_percentile_state):
    if income_percentile_state <= 25: return "state_low"
    elif income_percentile_state <= 60: return "state_mid"
    elif income_percentile_state <= 90: return "state_upper_mid"
    else: return "state_top_10"
```

#### Age-Relative Classification
```python
def classify_age_networth_band(final_mid, NW_median_age, NW_p80_age, NW_p90_age):
    if final_mid < NW_median_age: return "below_median_for_age"
    elif final_mid < NW_p80_age: return "around_median_to_p80"
    elif final_mid < NW_p90_age: return "p80_to_p90_for_age"
    else: return "above_p90_for_age"
```

---

## 6. Data Storage & Retrieval

### 6.1 Layer-1 Result Storage
```python
# Upsert to networth_layer1 table
layer1_result = {
    'uid': uid,
    'networth_low_usd': final_low,
    'networth_high_usd': final_high, 
    'networth_mid_usd': final_mid,
    'confidence_0_1': confidence,
    'networth_band_label': networth_band_label,
    'geo_zcta_used': zcta,
    'age_band': age_band,
    'signals_json': {
        'age': age,
        'M_zip': M_zip,
        'M_us': M_us,
        'affluence_index_zip': affluence_index_zip,
        'NW_median_age': NW_median_age,
        'p_high_income': p_high_income,
        'income_percentile_state': income_percentile_state,
        'has_property_signal': has_address,
        'posh_zip_qualifier': posh_zip_qualifier,
        # ... all intermediate calculations
    },
    'source_version': 'ACS5_2023_SCF_v1'
}
```

### 6.2 API Integration Points

#### Layer-1 Endpoint
- **URL:** `/api/networth/layer1/{uid}`
- **Function:** Compute or retrieve Layer-1 estimates
- **Cache:** Check for recent estimates, recompute if stale

#### Layer-2 Input
- **Source:** Layer-1 results + raw profile data  
- **Target:** Claude AI for enhanced reasoning and explanation
- **Output:** Human-readable estimates with confidence explanations

---

## 7. Governance, Ethics & Limitations

### 7.1 Fairness Principles

#### Gender Neutrality
- **✅ Enforced:** `profile_gender` explicitly excluded from all calculations
- **✅ Rationale:** Avoid perpetuating historical gender wealth gaps
- **✅ Monitoring:** Regular audits to ensure no indirect gender bias

#### Geographic Bias Awareness
- **⚠️ Risk:** Place-based averages may reflect historical redlining patterns
- **✅ Mitigation:** Transparent methodology, periodic bias audits
- **✅ Disclosure:** Clear disclaimers about statistical nature of estimates

### 7.2 Privacy & Data Protection

#### Data Minimization
- **✅ Only Public Data:** Census statistics, Federal Reserve surveys
- **✅ No Financial Access:** No bank accounts, credit reports, or income verification
- **✅ Profile Data Only:** Age, location, address (optional for property signals)

#### User Transparency
- **✅ Methodology Disclosure:** Clear explanation of data sources and calculations
- **✅ Confidence Scoring:** Always include uncertainty measures
- **✅ Disclaimer Requirement:** "Based on statistical averages, not individual accounts"

### 7.3 Technical Limitations

#### Data Staleness
- **ACS Data:** 5-year rolling averages, 1-2 year publication lag
- **SCF Data:** Triennial survey, 2-3 year lag for analysis
- **Mitigation:** Version tracking (`source_version`) for systematic updates

#### Geographic Precision
- **ZCTA vs ZIP:** ~95% overlap, some edge cases in rural areas
- **Coverage Gaps:** Limited data for very small or new ZCTAs
- **Fallback:** State-level averages when ZCTA data unavailable

#### Algorithmic Bounds
- **Range Estimates:** Always provide uncertainty ranges, never point estimates
- **Confidence Caps:** Maximum 100% confidence, typical range 20-80%
- **Extreme Value Protection:** Multiple clamping layers prevent unrealistic estimates

---

## 8. Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Database schema creation (`geo_zcta_signals`, `networth_layer1`)
- [ ] Census API integration and authentication
- [ ] Basic ZCTA data ingestion pipeline
- [ ] SCF configuration tables

### Phase 2: Algorithm Implementation (Week 3-4)
- [ ] Feature extraction pipeline
- [ ] Core calculation formulas (Steps A-D)
- [ ] Band classification logic
- [ ] Confidence scoring system

### Phase 3: Data Population (Week 5-6)
- [ ] Full ZCTA ingestion (target states/regions)
- [ ] State percentile calculations
- [ ] Data quality validation and cleanup
- [ ] Performance optimization

### Phase 4: API & Integration (Week 7-8)
- [ ] Layer-1 API endpoint implementation
- [ ] Caching and staleness logic
- [ ] Integration with existing profile system
- [ ] Layer-2 (Claude AI) input preparation

### Phase 5: Testing & Validation (Week 9-10)
- [ ] Algorithm validation against known benchmarks
- [ ] Bias testing across demographic groups
- [ ] Performance testing with production load
- [ ] Documentation and team training

---

## 9. Success Metrics

### 9.1 Technical Metrics
- **Coverage:** % of active UIDs with successful Layer-1 estimates
- **Latency:** < 500ms for cached results, < 2s for fresh computation
- **Accuracy:** Confidence scores correlate with estimate precision in validation sets
- **Reliability:** 99.5% uptime for Layer-1 API endpoint

### 9.2 Data Quality Metrics  
- **Freshness:** Data sources updated within defined SLA (monthly for ACS, annually for SCF)
- **Completeness:** < 5% of estimates rely on fallback data
- **Consistency:** Estimates stable for same profile data across time

### 9.3 Fairness Metrics
- **Gender Neutrality:** No statistical difference in confidence scores by gender
- **Geographic Fairness:** Confidence scores proportional to data availability across regions
- **Transparency:** User comprehension scores for estimate explanations

---

## TL;DR: Layer-1 Algorithm Summary

**HUSHH Networth Layer-1** = Deterministic statistical engine using public data only:

1. **Input:** User profile (`age`, `zip`, `state`, optional `address`)
2. **Data Sources:** Census ACS income data + Federal Reserve SCF net worth data + Optional property AVM  
3. **Algorithm:** Age-based baseline × Geographic affluence index × Property ownership premium × High-affluence area boost
4. **Output:** Confidence-scored net worth ranges with explanatory band classifications
5. **Storage:** Cached in `networth_layer1` table for 24-hour reuse
6. **Integration:** Feeds into Layer-2 (Claude AI) for enhanced reasoning and user-friendly explanations

**Next Steps:** Ready for technical implementation, Jira epic breakdown, or integration into existing HUSHH architecture.
