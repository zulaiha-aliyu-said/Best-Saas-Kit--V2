-- ============================================================================
-- BLACK FRIDAY SALES TRACKING TABLE
-- ============================================================================
-- This table tracks all Black Friday sales made through Flutterwave

CREATE TABLE IF NOT EXISTS black_friday_sales (
    id SERIAL PRIMARY KEY,
    
    -- Transaction details
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    tx_ref VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    
    -- User details
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    
    -- Plan details
    plan_type VARCHAR(50) NOT NULL, -- 'pro_trial' or 'ltd'
    tier INTEGER, -- For LTD plans (1-4), NULL for pro_trial
    monthly_credits INTEGER, -- Credits granted
    
    -- Payment details
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(50) DEFAULT 'flutterwave',
    
    -- Metadata
    metadata JSONB, -- Store additional Flutterwave data
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bf_sales_user_id ON black_friday_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_bf_sales_transaction_id ON black_friday_sales(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bf_sales_created_at ON black_friday_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_bf_sales_plan_type ON black_friday_sales(plan_type);
CREATE INDEX IF NOT EXISTS idx_bf_sales_tier ON black_friday_sales(tier);

-- Add comments for documentation
COMMENT ON TABLE black_friday_sales IS 'Tracks all Black Friday sales made through Flutterwave payment gateway';
COMMENT ON COLUMN black_friday_sales.transaction_id IS 'Flutterwave transaction ID';
COMMENT ON COLUMN black_friday_sales.tx_ref IS 'Flutterwave transaction reference';
COMMENT ON COLUMN black_friday_sales.plan_type IS 'Type of plan purchased: pro_trial or ltd';
COMMENT ON COLUMN black_friday_sales.tier IS 'LTD tier number (1-4) for LTD plans, NULL for pro_trial';

