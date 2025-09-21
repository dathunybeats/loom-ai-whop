-- Add missing fields to prospects table for enhanced web scraping
-- These fields were referenced in the video personalization API but don't exist yet

-- Add enhanced scraping fields to prospects table
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_title TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_description TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_content TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS website_scraped_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prospects_website_scraped_at ON prospects(website_scraped_at);
CREATE INDEX IF NOT EXISTS idx_prospects_screenshot_url ON prospects(screenshot_url) WHERE screenshot_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN prospects.website_title IS 'Website title extracted from Firecrawl scraping';
COMMENT ON COLUMN prospects.website_description IS 'Website meta description from Firecrawl';
COMMENT ON COLUMN prospects.website_content IS 'Main content text extracted from website (truncated to 5000 chars)';
COMMENT ON COLUMN prospects.screenshot_url IS 'Direct URL to screenshot from Firecrawl';
COMMENT ON COLUMN prospects.website_scraped_at IS 'Timestamp when the website was last scraped';

DO $$
BEGIN
    RAISE NOTICE 'Added enhanced scraping fields to prospects table';
END $$;