-- Migration: Create networth_estimates table for AI-powered net worth calculations
-- Created: 2024-11-17
-- Description: Stores net worth estimates with Layer-1 (statistical) and Layer-2 (AI-enhanced) data

-- Create networth_estimates table
CREATE TABLE IF NOT EXISTS networth_estimates (
    -- Primary key and foreign key
    uid TEXT PRIMARY KEY REFERENCES members(uid) ON DELETE CASCADE,
    
    -- Estimation metadata
    method TEXT NOT NULL DEFAULT 'ai_estimated', -- 'ai_estimated', 'manual', 'external'
    estimated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Layer-1 (Statistical/Deterministic) estimates
    layer1_low INTEGER NOT NULL,
    layer1_high INTEGER NOT NULL,
    layer1_confidence DECIMAL(3,2) NOT NULL CHECK (layer1_confidence >= 0.0 AND layer1_confidence <= 1.0),
    layer1_signals_json JSONB, -- Store all the signals used (age_band, geo_multiplier, etc.)
    
    -- Layer-2 (AI-Enhanced) final estimates  
    final_low INTEGER NOT NULL,
    final_high INTEGER NOT NULL,
    final_confidence DECIMAL(3,2) NOT NULL CHECK (final_confidence >= 0.0 AND final_confidence <= 1.0),
    
    -- User-facing content
    band_label TEXT NOT NULL, -- e.g., "$500k - $1.2M"
    reasoning TEXT NOT NULL, -- AI-generated explanation
    disclaimer TEXT NOT NULL DEFAULT 'This is an estimate based on demographic and regional data, not your actual financial accounts. Individual circumstances vary significantly. Not financial advice.',
    
    -- System metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_networth_estimates_uid ON networth_estimates(uid);
CREATE INDEX IF NOT EXISTS idx_networth_estimates_estimated_at ON networth_estimates(estimated_at);
CREATE INDEX IF NOT EXISTS idx_networth_estimates_expires_at ON networth_estimates(expires_at);
CREATE INDEX IF NOT EXISTS idx_networth_estimates_method ON networth_estimates(method);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_networth_estimates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_networth_estimates_updated_at ON networth_estimates;
CREATE TRIGGER trigger_networth_estimates_updated_at
    BEFORE UPDATE ON networth_estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_networth_estimates_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE networth_estimates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own estimates (through API with proper auth)
-- For now, we'll allow service role full access since we're using supabaseAdmin
CREATE POLICY "Allow service role full access to networth_estimates" ON networth_estimates
    FOR ALL
    TO service_role
    USING (true);

-- Cleanup policy for expired estimates (optional, can be run manually or via cron)
-- This will help keep the table size manageable
CREATE OR REPLACE FUNCTION cleanup_expired_networth_estimates()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM networth_estimates 
    WHERE expires_at < NOW() - INTERVAL '7 days'; -- Keep for 7 days after expiry for debugging
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON networth_estimates TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_networth_estimates() TO service_role;
GRANT EXECUTE ON FUNCTION update_networth_estimates_updated_at() TO service_role;

-- Add comments for documentation
COMMENT ON TABLE networth_estimates IS 'Stores AI-powered net worth estimates for Gold Pass members';
COMMENT ON COLUMN networth_estimates.uid IS 'Foreign key to members table';
COMMENT ON COLUMN networth_estimates.method IS 'Estimation method: ai_estimated, manual, external';
COMMENT ON COLUMN networth_estimates.layer1_low IS 'Lower bound from statistical Layer-1 engine (USD)';
COMMENT ON COLUMN networth_estimates.layer1_high IS 'Upper bound from statistical Layer-1 engine (USD)';
COMMENT ON COLUMN networth_estimates.layer1_confidence IS 'Confidence score for Layer-1 estimate (0.0-1.0)';
COMMENT ON COLUMN networth_estimates.layer1_signals_json IS 'JSON object containing all signals used in Layer-1 calculation';
COMMENT ON COLUMN networth_estimates.final_low IS 'AI-enhanced lower bound estimate (USD)';
COMMENT ON COLUMN networth_estimates.final_high IS 'AI-enhanced upper bound estimate (USD)';
COMMENT ON COLUMN networth_estimates.final_confidence IS 'Final confidence score after AI enhancement (0.0-1.0)';
COMMENT ON COLUMN networth_estimates.band_label IS 'Human-readable band label (e.g., "$500k - $1.2M")';
COMMENT ON COLUMN networth_estimates.reasoning IS 'AI-generated explanation of the estimate';
COMMENT ON COLUMN networth_estimates.expires_at IS 'When this estimate expires and should be recalculated';

-- Sample data structure for layer1_signals_json:
-- {
--   "age_band": "35-44",
--   "nw_median_age": 135000,
--   "nw_p80_age": 550000,
--   "geo_multiplier": 1.4,
--   "address_multiplier": 1.3,
--   "has_address": true,
--   "state": "CA", 
--   "zip": "94102",
--   "income_data": {...},
--   "property_data": {...}
-- }
