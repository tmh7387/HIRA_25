/**
 * @typedef {Object} Facilitator
 * @property {string} name - Facilitator's name
 * @property {string} designation - Facilitator's designation
 */

/**
 * @typedef {Object} Attendee
 * @property {string} name - Attendee's name
 * @property {string} designation - Attendee's designation
 */

/**
 * @typedef {Object} FileInfo
 * @property {string} url - File's public URL
 * @property {string} name - Original file name
 */

/**
 * @typedef {'LOW'|'MEDIUM'|'HIGH'} RiskLevel
 */

/**
 * @typedef {Object} Consequence
 * @property {string} uniqueId - Unique identifier
 * @property {string} description - Description of the consequence
 * @property {string} currentControls - Current control measures
 * @property {Object} [assessment] - Risk assessment details
 * @property {Object} [controls] - Risk control measures
 */

/**
 * @typedef {Object} Hazard
 * @property {string} uniqueId - Unique identifier
 * @property {string} description - Description of the hazard
 * @property {Consequence[]} consequences - List of consequences
 */

/**
 * @typedef {Object} Event
 * @property {string} uniqueId - Unique identifier
 * @property {string} name - Event name
 * @property {Hazard[]} hazards - List of hazards
 */

/**
 * @typedef {Object} Project
 * @property {string} projectId - Unique project identifier
 * @property {string} title - Project title
 * @property {string} date - Project date
 * @property {Facilitator} facilitator - Project facilitator
 * @property {Attendee[]} attendees - List of attendees
 * @property {string} operational_desc - Operational system description
 * @property {FileInfo[]} operational_files - List of operational context files
 * @property {Event[]} [events] - List of safety events
 * @property {RiskLevel} [risk_level] - Overall project risk level
 * @property {string} [matrixType] - Type of risk matrix used
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} ProjectFormData
 * @property {string} [projectId] - Project ID (for updates)
 * @property {string} title - Project title
 * @property {string} date - Project date
 * @property {Object} facilitator - Facilitator information
 * @property {string} facilitator.name - Facilitator name
 * @property {string} facilitator.designation - Facilitator designation
 * @property {Array<{name: string, designation: string}>} attendees - List of attendees
 * @property {string} operational_desc - Operational description
 * @property {FileInfo[]} operational_files - Uploaded files
 */

/**
 * @typedef {Object} ProjectStore
 * @property {Project[]} projects - List of all projects
 * @property {Project|null} currentProject - Currently selected project
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message
 * @property {number} currentStep - Current form step
 * @property {Function} setProjects - Update projects list
 * @property {Function} setCurrentProject - Update current project
 * @property {Function} setError - Set error message
 * @property {Function} clearError - Clear error message
 * @property {Function} setLoading - Set loading state
 * @property {Function} setCurrentStep - Set current step
 * @property {Function} loadProjects - Load all projects
 * @property {Function} createProject - Create new project
 * @property {Function} updateProject - Update existing project
 * @property {Function} deleteProject - Delete project
 */

// Export empty object to make this a module
export {};
