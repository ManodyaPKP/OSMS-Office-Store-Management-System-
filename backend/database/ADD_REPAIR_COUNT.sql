-- Add repair_count column to assets table if it doesn't exist
ALTER TABLE assets 
ADD COLUMN repair_count INT DEFAULT 0 AFTER status;

-- Optional: Update repair_count based on existing repair records
UPDATE assets a
SET repair_count = (
  SELECT COUNT(*) FROM repairs r WHERE r.asset_id = a.id
)
WHERE repair_count = 0;
