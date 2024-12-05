// src/graphql/inputdatasetup/UpdateInputDataSetup.js
/*
import React, { useEffect } from 'react';
import { useUpdateInputDataSetup } from './useUpdateInputDataSetup';

function UpdateInputDataSetup() {
  const { updateInputDataSetup, data, loading, error } = useUpdateInputDataSetup();

  useEffect(() => {
    // Execute the mutation when the component mounts
    updateInputDataSetup()
      .then((response) => {
        console.log('Mutation response:', response);
      })
      .catch((err) => {
        console.error('Mutation error:', err);
      });
  }, [updateInputDataSetup]);

  if (loading) return <p>Updating Input Data Setup...</p>;
  if (error) return <p>Error updating Input Data Setup: {error.message}</p>;

  if (data && data.updateInputDataSetup.errors.length > 0) {
    return (
      <div>
        <p>Validation errors while updating Input Data Setup:</p>
        <ul>
          {data.updateInputDataSetup.errors.map((err, index) => (
            <li key={index}>
              {err.field}: {err.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (data && data.updateInputDataSetup.errors.length === 0) {
    return <p>Input Data Setup updated successfully.</p>;
  }

  return null; // Or any other fallback UI
}

export default UpdateInputDataSetup;*/
