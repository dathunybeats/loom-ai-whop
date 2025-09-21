-- Add enhanced web scraping fields to support Firecrawl v2 integration
-- This migration adds fields to store scraped website content and metadata

-- Add enhanced scraping fields to prospects table
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_title TEXT; -- Website title from scraping
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_description TEXT; -- Website meta description
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_content TEXT; -- Extracted main content (first 5000 chars)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS screenshot_url TEXT; -- Direct URL to Firecrawl screenshot
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_scraped_at TIMESTAMPTZ; -- When the website was scraped

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prospects_website_scraped_at ON prospects(website_scraped_at);
CREATE INDEX IF NOT EXISTS idx_prospects_screenshot_url ON prospects(screenshot_url) WHERE screenshot_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN prospects.website_title IS 'Website title extracted from Firecrawl scraping';
COMMENT ON COLUMN prospects.website_description IS 'Website meta description from Firecrawl';
COMMENT ON COLUMN prospects.website_content IS 'Main content text extracted from website (truncated to 5000 chars)';
COMMENT ON COLUMN prospects.screenshot_url IS 'Direct URL to screenshot from Firecrawl (no need to store locally)';
COMMENT ON COLUMN prospects.website_scraped_at IS 'Timestamp when the website was last scraped with enhanced content extraction';

-- Update RLS policies to include new fields (if needed)
-- The existing policies should already cover these new columns
