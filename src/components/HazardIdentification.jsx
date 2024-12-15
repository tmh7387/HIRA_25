import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { PlusCircle } from 'lucide-react';

function HazardIdentification() {
  const { currentProject, updateProject } = useProjectStore();
  const [hazards, setHazards] = useState(currentProject?.hazards || []);
  const [newHazard, setNewHazard] = useState('');

  useEffect(() => {
    setHazards(currentProject?.hazards || []);
  }, [currentProject]);

  const handleAddHazard = () => {
    if (newHazard.trim()) {
      const updatedHazards = [...hazards, { description: newHazard }];
      setHazards(updatedHazards);
      updateProject({ ...currentProject, hazards: updatedHazards });
      setNewHazard('');
    }
  };

  const handleRemoveHazard = (index) => {
    const updatedHazards = hazards.filter((_, i) => i !== index);
    setHazards(updatedHazards);
    updateProject({ ...currentProject, hazards: updatedHazards });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Hazard Identification</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newHazard}
          onChange={(e) => setNewHazard(e.target.value)}
          placeholder="Enter a new hazard"
          className="border rounded-lg p-2 mr-2 w-2/3"
        />
        <button
          onClick={handleAddHazard}
          className="inline-flex items-center px-4 py-2 bg-primary-main text-white rounded-lg font-medium shadow-sm hover:bg-primary-hover transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Hazard
        </button>
      </div>
      <ul className="list-disc pl-5">
        {hazards.map((hazard, index) => (
          <li key={index} className="mb-2">
            {hazard.description}
            <button
              onClick={() => handleRemoveHazard(index)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HazardIdentification;