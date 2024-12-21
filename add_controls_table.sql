-- Create controls table
CREATE TABLE hira_controls (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    consequence_id uuid NOT NULL REFERENCES hira_consequences(id),
    additional_mitigation text NOT NULL,
    risk_owner text NOT NULL,
    target_date date,
    date_implemented date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
