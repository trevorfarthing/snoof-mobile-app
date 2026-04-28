-- Additional activity types
ALTER TYPE activity_type ADD VALUE 'vaccination';
ALTER TYPE activity_type ADD VALUE 'weight';

-- Add foreign keys to activity_logs for additional tables
ALTER TABLE medication_logs ADD COLUMN activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE;
ALTER TABLE vaccinations ADD COLUMN activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE;
ALTER TABLE vet_visits ADD COLUMN activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE;
ALTER TABLE weight_logs ADD COLUMN activity_log_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE UNIQUE;