-- Check relationships between consequences and risk assessments
SELECT 
    c.id as consequence_id,
    c.description as consequence_description,
    h.description as hazard_description,
    e.name as event_name,
    ra.id as risk_assessment_id,
    ra.probability,
    ra.severity,
    ra.likelihood,
    ra.impact
FROM 
    hira_consequences c
    LEFT JOIN hira_hazards h ON c.hazard_id = h.id
    LEFT JOIN hira_events e ON h.event_id = e.id
    LEFT JOIN hira_risk_assessments ra ON ra.consequence_id = c.id
WHERE 
    e.project_id = '[your-project-id]'  -- Replace with actual project ID
ORDER BY 
    e.name, h.description, c.description;