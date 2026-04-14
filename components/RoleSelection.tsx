/**
 * RoleSelection Component
 * Allows user to select target job role
 */

'use client';

import React, { useState } from 'react';

interface RoleSelectionProps {
  onRoleSelected: (role: string) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected }) => {
  const [customRole, setCustomRole] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const commonRoles = [
    'Software Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Machine Learning Engineer',
    'Product Manager',
    'Data Scientist',
    'Systems Architect',
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setCustomRole('');
    onRoleSelected(role);
  };

  const handleCustomRole = () => {
    if (customRole.trim()) {
      setSelectedRole(customRole);
      onRoleSelected(customRole);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Target Role</h2>
      <p className="text-gray-600 mb-6">
        Choose the position you&apos;re interviewing for, or enter a custom role.
      </p>

      {/* Common Roles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {commonRoles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSelect(role)}
            className={`p-3 rounded-lg font-semibold transition ${
              selectedRole === role
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Custom Role Input */}
      <div className="border-t pt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Or enter a custom role:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="e.g., Cloud Architect, Security Engineer"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomRole()}
          />
          <button
            onClick={handleCustomRole}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Select
          </button>
        </div>
      </div>

      {/* Selected Role Display */}
      {selectedRole && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✓ Selected Role: <span className="text-lg">{selectedRole}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
