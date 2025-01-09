import { gql } from '@apollo/client';

// Update Input Data Setup Mutation
export const UPDATE_INPUT_DATA_SETUP_MUTATION = gql`
  mutation UpdateInputDataSetup($setupUpdate: InputDataSetupUpdate!) {
    updateInputDataSetup(setupUpdate: $setupUpdate) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_PROCESS_MUTATION = gql`
  mutation CreateProcess($process: NewProcess!) {
    createProcess(process: $process) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_NODE_MUTATION = gql`
  mutation CreateNode($node: NewNode!) {
    createNode(node: $node) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create New Scenario
export const CREATE_SCENARIO_MUTATION = gql`
  mutation CreateScenario($name: String!, $weight: Float!) {
    createScenario(name: $name, weight: $weight) {
      message
    }
  }
`;

export const SET_NODE_STATE_MUTATION = gql`
  mutation SetNodeState($state: StateInput!, $nodeName: String!) {
    setNodeState(state: $state, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create New Process Group
export const CREATE_PROCESS_GROUP_MUTATION = gql`
  mutation CreateProcessGroup($name: String!) {
    createProcessGroup(name: $name) {
      message
    }
  }
`;

// Mutation: Create New Topology
export const CREATE_TOPOLOGY_MUTATION = gql`
  mutation CreateTopology(
    $topology: NewTopology!
    $sourceNodeName: String
    $processName: String!
    $sinkNodeName: String
  ) {
    createTopology(
      topology: $topology
      sourceNodeName: $sourceNodeName
      processName: $processName
      sinkNodeName: $sinkNodeName
    ) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Add Process to Process Group
export const ADD_PROCESS_TO_GROUP_MUTATION = gql`
  mutation AddProcessToGroup($processName: String!, $groupName: String!) {
    addProcessToGroup(processName: $processName, groupName: $groupName) {
      message
    }
  }
`;

// Mutation: Create New Node Group
export const CREATE_NODE_GROUP_MUTATION = gql`
  mutation CreateNodeGroup($name: String!) {
    createNodeGroup(name: $name) {
      message
    }
  }
`;

// Mutation: Add Node to Node Group
export const ADD_NODE_TO_GROUP_MUTATION = gql`
  mutation AddNodeToGroup($nodeName: String!, $groupName: String!) {
    addNodeToGroup(nodeName: $nodeName, groupName: $groupName) {
      message
    }
  }
`;

export const CREATE_NODE_DELAY_MUTATION = gql`
  mutation CreateNodeDelay($delay: NewNodeDelay!) {
    createNodeDelay(delay: $delay) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Node History
export const CREATE_NODE_HISTORY_MUTATION = gql`
  mutation CreateNodeHistory($nodeName: String!) {
    createNodeHistory(nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Market
export const CREATE_MARKET_MUTATION = gql`
  mutation CreateMarket($market: NewMarket!) {
    createMarket(market: $market) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Node Diffusion
export const CREATE_NODE_DIFFUSION_MUTATION = gql`
  mutation CreateNodeDiffusion($fromNode: String!, $toNode: String!, $coefficient: Float!) {
    createNodeDiffusion(fromNode: $fromNode, toNode: $toNode, coefficient: $coefficient) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Risk
export const CREATE_RISK_MUTATION = gql`
  mutation CreateRisk($risk: NewRisk!) {
    createRisk(risk: $risk) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Generic Constraint
export const CREATE_GEN_CONSTRAINT_MUTATION = gql`
  mutation CreateGenConstraint($constraint: NewGenConstraint!) {
    createGenConstraint(constraint: $constraint) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Flow Constraint Factor
export const CREATE_FLOW_CON_FACTOR_MUTATION = gql`
  mutation CreateFlowConFactor(
    $factor: Float!
    $constraintName: String!
    $processName: String!
    $sourceOrSinkNodeName: String!
  ) {
    createFlowConFactor(
      factor: $factor
      constraintName: $constraintName
      processName: $processName
      sourceOrSinkNodeName: $sourceOrSinkNodeName
    ) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create State Constraint Factor
export const CREATE_STATE_CON_FACTOR_MUTATION = gql`
  mutation CreateStateConFactor($factor: Float!, $constraintName: String!, $nodeName: String!) {
    createStateConFactor(factor: $factor, constraintName: $constraintName, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Create Online Constraint Factor
export const CREATE_ONLINE_CON_FACTOR_MUTATION = gql`
  mutation CreateOnlineConFactor($factor: Float!, $constraintName: String!, $processName: String!) {
    createOnlineConFactor(factor: $factor, constraintName: $constraintName, processName: $processName) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Start Optimization Job
export const START_OPTIMIZATION_MUTATION = gql`
  mutation StartOptimization {
    startOptimization
  }
`;

// Mutation: Start Electricity Price Fetch Job
export const START_ELECTRICITY_PRICE_FETCH_MUTATION = gql`
  mutation StartElectricityPriceFetch {
    startElectricityPriceFetch
  }
`;

// Mutation: Start Weather Forecast Job
export const START_WEATHER_FORECAST_FETCH_MUTATION = gql`
  mutation StartWeatherForecastFetch {
    startWeatherForecastFetch
  }
`;

// Mutation: Save Model on Disk
export const SAVE_MODEL_MUTATION = gql`
  mutation SaveModel {
    saveModel {
      message
    }
  }
`;

// Mutation: Clear Input Data from Model
export const CLEAR_INPUT_DATA_MUTATION = gql`
  mutation ClearInputData {
    clearInputData {
      message
    }
  }
`;

// Mutation: Update State of a Node
export const UPDATE_NODE_STATE_MUTATION = gql`
  mutation UpdateNodeState($state: StateUpdate!, $nodeName: String!) {
    updateNodeState(state: $state, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

// Mutation: Connect Node Inflow to Temperature Forecast
export const CONNECT_NODE_INFLOW_TO_TEMPERATURE_FORECAST_MUTATION = gql`
  mutation ConnectNodeInflowToTemperatureForecast($nodeName: String!, $forecastName: String!) {
    connectNodeInflowToTemperatureForecast(nodeName: $nodeName, forecastName: $forecastName) {
      message
    }
  }
`;

// Mutation: Connect Market Prices to Forecast
export const CONNECT_MARKET_PRICES_TO_FORECAST_MUTATION = gql`
  mutation ConnectMarketPricesToForecast($marketName: String!, $forecastName: String!) {
    connectMarketPricesToForecast(marketName: $marketName, forecastName: $forecastName) {
      message
    }
  }
`;

// Mutation: Update Settings
export const UPDATE_SETTINGS_MUTATION = gql`
  mutation UpdateSettings($settingsInput: SettingsInput!) {
    updateSettings(settingsInput: $settingsInput) {
      ... on Settings {
        location {
          country
          place
        }
      }
      ... on ValidationErrors {
        errors {
          field
          message
        }
      }
    }
  }
`;

// Query: Fetch job status by jobId
export const JOB_STATUS_QUERY = gql`
  query JobStatus($jobId: Int!) {
    jobStatus(jobId: $jobId) {
      state
      message
    }
  }
`;

export const GET_NODE_NAMES = gql`
  query GetNodeNames {
    model {
      inputData {
        nodes {
          name
        }
      }
    }
  }
`;

export default {
  UPDATE_INPUT_DATA_SETUP_MUTATION,
  CREATE_PROCESS_MUTATION,
  CREATE_NODE_MUTATION,
  CREATE_SCENARIO_MUTATION,
  SET_NODE_STATE_MUTATION,
  CREATE_PROCESS_GROUP_MUTATION,
  CREATE_TOPOLOGY_MUTATION,
  CREATE_NODE_GROUP_MUTATION,
  CREATE_NODE_DELAY_MUTATION,
  CREATE_NODE_HISTORY_MUTATION,
  CREATE_MARKET_MUTATION,
  CREATE_NODE_DIFFUSION_MUTATION,  
  CREATE_RISK_MUTATION,
  CREATE_GEN_CONSTRAINT_MUTATION,
  CREATE_FLOW_CON_FACTOR_MUTATION,
  CREATE_STATE_CON_FACTOR_MUTATION,
  CREATE_ONLINE_CON_FACTOR_MUTATION,
  ADD_PROCESS_TO_GROUP_MUTATION,
  ADD_NODE_TO_GROUP_MUTATION,
  START_ELECTRICITY_PRICE_FETCH_MUTATION,
  START_WEATHER_FORECAST_FETCH_MUTATION,
  UPDATE_NODE_STATE_MUTATION,
  CONNECT_NODE_INFLOW_TO_TEMPERATURE_FORECAST_MUTATION,
  CONNECT_MARKET_PRICES_TO_FORECAST_MUTATION,
  CLEAR_INPUT_DATA_MUTATION,
  SAVE_MODEL_MUTATION,
  START_OPTIMIZATION_MUTATION,

  UPDATE_SETTINGS_MUTATION,
  JOB_STATUS_QUERY,
  GET_NODE_NAMES,
};