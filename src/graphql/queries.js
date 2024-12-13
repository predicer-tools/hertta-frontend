// src/graphql/queries.js

export const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql';

// Mutations
export const CLEAR_INPUT_DATA_MUTATION = `
  mutation ClearInputData {
    clearInputData {
      error
    }
  }
`;

export const UPDATE_INPUT_DATA_SETUP_MUTATION = `
  mutation UpdateInputDataSetup($setupUpdate: InputDataSetupUpdate!) {
    updateInputDataSetup(setupUpdate: $setupUpdate) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_MARKET_MUTATION = `
  mutation CreateMarket($market: NewMarket!) {
    createMarket(market: $market) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_NODE_MUTATION = `
  mutation CreateNode($node: NewNode!) {
    createNode(node: $node) {
      errors {
        field
        message
      }
    }
  }
`;

export const SET_NODE_STATE_MUTATION = `
  mutation SetNodeState($nodeName: String!, $state: StateInput) {
    setNodeState(state: $state, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_PROCESS_GROUP_MUTATION = `
  mutation CreateProcessGroup($name: String!) {
    createProcessGroup(name: $name) {
      error
    }
  }
`;
