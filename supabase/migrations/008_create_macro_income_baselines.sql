-- Create macro_income_baselines table for FRED national income medians
-- Used for Layer-1 affluence_index_zip = M_zip / M_us_nominal calculations

CREATE TABLE IF NOT EXISTS macro_income_baselines (
  year INTEGER PRIMARY KEY,
  median_household_income_nominal NUMERIC,
  median_household_income_real NUMERIC,
  median_personal_income_nominal NUMERIC,
  median_personal_income_real NUMERIC,
  median_family_income_nominal NUMERIC,
  source_updated_at TIMESTAMPTZ,
  source_release TEXT DEFAULT 'Income and Poverty in the United States',
  fred_series_household_nominal TEXT DEFAULT 'MEHOINUSA646N',
  fred_series_household_real TEXT DEFAULT 'MEHOINUSA672N',
  fred_series_personal_nominal TEXT DEFAULT 'MEPAINUSA646N',
  fred_series_personal_real TEXT DEFAULT 'MEPAINUSA672N',
  fred_series_family_nominal TEXT DEFAULT 'MEFAINUSA646N',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convenience view for Layer-1 calculations
CREATE VIEW IF NOT EXISTS layer1_income_baselines AS
SELECT 
  year,
  median_household_income_nominal as M_us_nominal,
  median_personal_income_nominal as M_personal_us_nominal,
  median_family_income_nominal as M_family_us_nominal,
  source_updated_at,
  created_at,
  updated_at
FROM macro_income_baselines
ORDER BY year DESC;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_macro_income_baselines_year ON macro_income_baselines(year DESC);

-- Insert current fallback data (2023 estimates) for immediate use
INSERT INTO macro_income_baselines (
  year,
  median_household_income_nominal,
  median_personal_income_nominal,
  median_family_income_nominal,
  source_updated_at,
  source_release
) VALUES (
  2023,
  80000,  -- Approximate US median household income 2023
  45000,  -- Approximate US median personal income 2023  
  85000,  -- Approximate US median family income 2023
  NOW(),
  'FALLBACK_ESTIMATES_2023'
) ON CONFLICT (year) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE macro_income_baselines IS 'FRED national income medians for Layer-1 net worth calculations';
COMMENT ON COLUMN macro_income_baselines.year IS 'Observation year (e.g. 2024)';
COMMENT ON COLUMN macro_income_baselines.median_household_income_nominal IS 'FRED MEHOINUSA646N - Median household income, current dollars';
COMMENT ON COLUMN macro_income_baselines.median_personal_income_nominal IS 'FRED MEPAINUSA646N - Median personal income, current dollars';
COMMENT ON COLUMN macro_income_baselines.median_family_income_nominal IS 'FRED MEFAINUSA646N - Median family income, current dollars';
COMMENT ON COLUMN macro_income_baselines.source_updated_at IS 'When this data was fetched from FRED';
