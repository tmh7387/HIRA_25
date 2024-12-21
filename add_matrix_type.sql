-- Add matrix_type column with check constraint
ALTER TABLE hira_risk_assessments
ADD COLUMN matrix_type text NOT NULL DEFAULT 'icao'
CHECK (matrix_type IN ('icao', 'integrated'));
