// src/graphql/inputdatasetup/useUpdateInputDataSetup.js

import { useMutation } from '@apollo/client';
import { UPDATE_INPUT_DATA_SETUP } from './updateInputDataSetup';

// Hardcoded values for InputDataSetupInput
const setupUpdate = {
  containsReserves: false,
  containsOnline: false,
  containsStates: true,
  containsPiecewiseEff: false,
  containsRisk: false,
  containsDiffusion: true,
  containsDelay: false,
  containsMarkets: true,
  reserveRealization: true,
  useMarketBids: true,
  commonTimesteps: 0,
  commonScenarioName: 'ALL',
  useNodeDummyVariables: true,
  useRampDummyVariables: true,
  nodeDummyVariableCost: 10000.0,
  rampDummyVariableCost: 10000.0,
};

export function useUpdateInputDataSetup() {
  const [updateInputDataSetupMutation, { data, loading, error }] = useMutation(UPDATE_INPUT_DATA_SETUP);

  // Function to execute the mutation
  const updateInputDataSetup = () => {
    return updateInputDataSetupMutation({ variables: { setupUpdate } });
  };

  return { updateInputDataSetup, data, loading, error };
}
