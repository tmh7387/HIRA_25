import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import useProjectStore from '../stores/projectStore';
import { generateProjectId } from '../utils/projectIdGenerator';
import FileUpload from './FileUpload';

function FormSection({ title, children }) {
  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-primary-main mb-6 pb-3 border-b-2 border-primary-light">
        {title}
      </h3>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

function AttendeeFields({ attendees, onAttendeeAdd, onAttendeeRemove, onAttendeeChange }) {
  return (
    <div className="space-y-4">
      {attendees.map((attendee, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={attendee.name}
              onChange={(e) => onAttendeeChange(index, 'name', e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-2 rounded-lg border-2 border-neutral-light focus:outline-none focus:border-primary-main hover:border-primary-main transition-colors duration-200"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={attendee.designation}
              onChange={(e) => onAttendeeChange(index, 'designation', e.target.value)}
              placeholder="Designation"
              className="w-full px-4 py-2 rounded-lg border-2 border-neutral-light focus:outline-none focus:border-primary-main hover:border-primary-main transition-colors duration-200"
            />
          </div>
          {index > 0 && (
            <button
              type="button"
              onClick={() => onAttendeeRemove(index)}
              className="mt-2 text-neutral-main hover:text-accent-main transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAttendeeAdd}
        className="inline-flex items-center text-sm text-primary-main hover:text-primary-hover transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Attendee
      </button>
    </div>
  );
}

export default function ProjectForm() {
  const { currentProject, createProject, updateProject, setCurrentStep } = useProjectStore();

  const [formData, setFormData] = useState({
    project_id: currentProject?.project_id || generateProjectId(),
    title: currentProject?.title || '',
    date: currentProject?.date || new Date().toISOString().split('T')[0],
    facilitator: currentProject?.facilitator || { name: '', designation: '' },
    attendees: currentProject?.attendees || [{ name: '', designation: '' }],
    operational_desc: currentProject?.operational_desc || '',
    operational_files: currentProject?.operational_files || []
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFacilitatorChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      facilitator: { ...prev.facilitator, [field]: value }
    }));
  };

  const handleAttendeeAdd = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', designation: '' }]
    }));
  };

  const handleAttendeeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) =>
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const handleAttendeeRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const handleFilesChange = (files) => {
    setFormData(prev => ({
      ...prev,
      operational_files: files
    }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Project title is required';
    if (!formData.facilitator.name.trim()) errors.facilitatorName = 'Facilitator name is required';
    if (!formData.facilitator.designation.trim()) errors.facilitatorDesignation = 'Facilitator designation is required';
    if (!formData.operational_desc.trim()) errors.operational_desc = 'Operational description is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const errors = validate();
      if (Object.keys(errors).length > 0) {
        setError('Please fill in all required fields');
        setTouched(Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        return;
      }

      const validAttendees = formData.attendees
        .filter(a => a.name.trim() || a.designation.trim())
        .map(a => ({
          name: a.name.trim(),
          designation: a.designation.trim()
        }));

      const projectData = {
        project_id: formData.project_id,
        title: formData.title.trim(),
        date: formData.date,
        facilitator: {
          name: formData.facilitator.name.trim(),
          designation: formData.facilitator.designation.trim()
        },
        attendees: validAttendees,
        operational_desc: formData.operational_desc.trim(),
        operational_files: formData.operational_files
      };

      if (currentProject?.id) {
        await updateProject(currentProject.id, projectData);
      } else {
        await createProject(projectData);
      }

      setCurrentStep(2);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-accent-light border border-accent-main rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-accent-main mr-2" />
              <span className="text-accent-dark">{error}</span>
            </div>
          </div>
        )}

        <FormSection title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-main mb-1">Project ID</label>
              <input
                type="text"
                value={formData.project_id}
                readOnly
                className="w-full px-4 py-2 rounded-lg border-2 border-neutral-light bg-neutral-lighter cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-main mb-1">Project Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  touched.title && !formData.title.trim() 
                    ? 'border-accent-main focus:border-accent-main' 
                    : 'border-neutral-light focus:border-primary-main'
                } focus:outline-none hover:border-primary-main transition-colors duration-200`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-main mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-neutral-light focus:outline-none focus:border-primary-main hover:border-primary-main transition-colors duration-200"
              required
            />
          </div>
        </FormSection>

        <FormSection title="Facilitator Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-main mb-1">Facilitator Name</label>
              <input
                type="text"
                value={formData.facilitator.name}
                onChange={(e) => handleFacilitatorChange('name', e.target.value)}
                onBlur={() => handleBlur('facilitatorName')}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  touched.facilitatorName && !formData.facilitator.name.trim() 
                    ? 'border-accent-main focus:border-accent-main' 
                    : 'border-neutral-light focus:border-primary-main'
                } focus:outline-none hover:border-primary-main transition-colors duration-200`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-main mb-1">Facilitator Designation</label>
              <input
                type="text"
                value={formData.facilitator.designation}
                onChange={(e) => handleFacilitatorChange('designation', e.target.value)}
                onBlur={() => handleBlur('facilitatorDesignation')}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  touched.facilitatorDesignation && !formData.facilitator.designation.trim() 
                    ? 'border-accent-main focus:border-accent-main' 
                    : 'border-neutral-light focus:border-primary-main'
                } focus:outline-none hover:border-primary-main transition-colors duration-200`}
                required
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Attendees">
          <AttendeeFields
            attendees={formData.attendees}
            onAttendeeAdd={handleAttendeeAdd}
            onAttendeeRemove={handleAttendeeRemove}
            onAttendeeChange={handleAttendeeChange}
          />
        </FormSection>

        <FormSection title="Operational System Description">
          <div>
            <textarea
              value={formData.operational_desc}
              onChange={(e) => handleInputChange('operational_desc', e.target.value)}
              onBlur={() => handleBlur('operational_desc')}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border-2 ${
                touched.operational_desc && !formData.operational_desc.trim() 
                  ? 'border-accent-main focus:border-accent-main' 
                  : 'border-neutral-light focus:border-primary-main'
              } focus:outline-none hover:border-primary-main transition-colors duration-200`}
              required
            />
          </div>
        </FormSection>

        <FormSection title="Operational Context Files">
          <FileUpload
            project_id={formData.project_id}
            onChange={handleFilesChange}
          />
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-neutral-light">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 bg-primary-main text-white rounded-lg font-medium shadow-sm hover:bg-primary-hover hover:shadow-md transition-all duration-200 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Next Step'}
          </button>
        </div>
      </form>
    </div>
  );
}
