# File Persistence Notes

## Key Learnings from HIRA AppBolt Implementation

### 1. Component Architecture
- Keep file upload components self-contained
- Let the file upload component manage its own state
- Pass only necessary props (project_id and onChange)
- Avoid over-engineering with complex state management

### 2. Database Integration
- Store file metadata in the project record
- Include essential file information:
  - name
  - path
  - url
  - size
  - type
  - project_id (for association)
- Use consistent naming (e.g., 'project_id' not 'projectId')

### 3. Storage Organization
- Use consistent folder structure (e.g., 'operational-images')
- Include project identifier in file paths
- Maintain clear naming conventions for uploaded files
- Store files in project-specific contexts

### 4. State Management
- Keep file state close to where it's used
- Update parent components only when necessary
- Use simple state patterns over complex ones
- Maintain clear data flow between components

### 5. Best Practices
- Validate files before upload
- Handle errors gracefully
- Provide clear feedback to users
- Maintain consistent naming across the application
- Keep storage paths organized and predictable

### 6. Common Pitfalls to Avoid
- Over-complicating state management
- Mixing naming conventions (e.g., camelCase vs snake_case)
- Trying to manage file state at too high a level
- Adding unnecessary abstraction layers

### 7. Successful Implementation Pattern
1. FileUpload component handles direct file operations
2. Parent components receive updates via onChange
3. Storage service (Supabase) manages physical files
4. Database stores file metadata with project association

### 8. Testing Considerations
- Test file upload functionality
- Verify file persistence across navigation
- Check file association with correct projects
- Ensure proper error handling
- Validate file metadata storage

### 9. Maintenance Tips
- Keep file paths consistent
- Regularly clean up unused files
- Monitor storage usage
- Maintain clear logging for debugging
- Document any special file handling requirements

### 10. Performance Considerations
- Limit file sizes appropriately
- Handle multiple file uploads efficiently
- Consider lazy loading for file lists
- Optimize file metadata queries

## Implementation Example

```jsx
// FileUpload Component
<FileUpload
  project_id={formData.project_id}
  onChange={handleFilesChange}
/>

// File Metadata Structure
{
  name: 'example.pdf',
  path: 'operational-images/project123/file.pdf',
  url: 'https://storage-url/path',
  size: 1024,
  type: 'application/pdf',
  project_id: 'project123'
}
```

Remember: Simpler solutions are often more maintainable and less prone to errors. Focus on clear data flow and consistent naming conventions.
