const STORAGE_KEYS = {
  PROJECT: 'hira_project',
  HAZARDS: 'hira_hazards',
  ASSESSMENTS: 'hira_assessments',
  CONTROLS: 'hira_controls'
};

export function saveProject(projectData) {
  localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(projectData));
}

export function saveHazards(hazardsData) {
  localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(hazardsData));
}

export function saveAssessments(assessmentsData) {
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessmentsData));
}

export function saveControls(controlsData) {
  localStorage.setItem(STORAGE_KEYS.CONTROLS, JSON.stringify(controlsData));
}

export function getProject() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving project data:', error);
    return null;
  }
}

export function getHazards() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HAZARDS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving hazards data:', error);
    return null;
  }
}

export function getAssessments() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving assessments data:', error);
    return null;
  }
}

export function getControls() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTROLS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving controls data:', error);
    return null;
  }
}

export function clearStorage() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}