// src/graphql/queries.js

import { gql } from '@apollo/client';

export const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql';

// QUERIES
export const GET_API_VERSION_QUERY = `
  query {
    apiVersion
  }
`;

export const GET_SETTINGS_QUERY = `
  query {
    settings {
      location {
        country
        place
      }
    }
  }
`;

export const GET_MODEL_QUERY = `
  query {
    model {
      timeLine {
        duration {
          hours
          minutes
          seconds
        }
        step {
          hours
          minutes
          seconds
        }
      }
      inputData {
        scenarios {
          name
          weight
        }
        setup {
          containsReserves
          containsOnline
          containsStates
          containsPiecewiseEff
          containsRisk
          containsDiffusion
          containsDelay
          containsMarkets
          reserveRealisation
          useMarketBids
          commonTimeSteps
          commonScenario {
            name
            weight
          }
          useNodeDummyVariables
          useRampDummyVariables
          nodeDummyVariableCost
          rampDummyVariableCost
        }
        processes {
          name
          conversion
          isCf
          isCfFix
          isOnline
          isRes
          eff
          loadMin
          loadMax
          startCost
          minOnline
          maxOnline
          minOffline
          maxOffline
          isScenarioIndependent
          cf
          effTs
          effOps
          effFun {
            x
            y
          }
          topos {
            source {
              ... on Node {
                name
              }
              ... on Process {
                name
              }
            }
            sink {
              ... on Node {
                name
              }
              ... on Process {
                name
              }
            }
          }
        }
        nodes {
          name
          isCommodity
          isMarket
          isRes
          cost
          inflow
          state {
            inMax
            outMax
            stateLossProportional
            stateMax
            stateMin
            initialState
            isScenarioIndependent
            isTemp
            tEConversion
            residualValue
          }
          groups {
            name
          }
        }
        markets {
          name
          mType
          node {
            name
          }
          processGroup {
            name
          }
          direction
          realisation
          reserveType {
            name
            rampRate
          }
          isBid
          isLimited
          minBid
          maxBid
          fee
          price
          upPrice
          downPrice
          reserveActivationPrice
          fixed {
            name
            factor
          }
        }
        processGroups {
          name
          members {
            name
          }
        }
        nodeGroups {
          name
          members {
            name
          }
        }
        reserveType {
          name
          rampRate
        }
        risk {
          parameter
          value
        }
        inflowBlocks {
          name
          node {
            name
          }
          data
        }
        genConstraints {
          name
          gcType
          isSetpoint
          penalty
          constant
          factors {
            varType
            varTuple {
              entity {
                ... on Node {
                  name
                }
                ... on Process {
                  name
                }
              }
              identifier {
                name
              }
            }
            data
          }
        }
      }
    }
  }
`;

export const GET_GEN_CONSTRAINT_QUERY = `
  query GetGenConstraint($name: String!) {
    genConstraint(name: $name) {
      name
      gcType
      isSetpoint
      penalty
      constant
      factors {
        varType
        varTuple {
          entity {
            ... on Node {
              name
            }
            ... on Process {
              name
            }
          }
          identifier {
            name
          }
        }
        data
      }
    }
  }
`;

export const GET_NODE_GROUP_QUERY = `
  query GetNodeGroup($name: String!) {
    nodeGroup(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_NODES_IN_GROUP_QUERY = `
  query GetNodesInGroup($name: String!) {
    nodesInGroup(name: $name) {
      name
    }
  }
`;

export const GET_PROCESS_GROUP_QUERY = `
  query GetProcessGroup($name: String!) {
    processGroup(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_PROCESSES_IN_GROUP_QUERY = `
  query GetProcessesInGroup($name: String!) {
    processesInGroup(name: $name) {
      name
    }
  }
`;

export const GET_MARKET_QUERY = `
  query GetMarket($name: String!) {
    market(name: $name) {
      name
      mType
      node {
        name
      }
      processGroup {
        name
      }
      direction
      realisation
      reserveType {
        name
        rampRate
      }
      isBid
      isLimited
      minBid
      maxBid
      fee
      price
      upPrice
      downPrice
      reserveActivationPrice
      fixed {
        name
        factor
      }
    }
  }
`;

export const GET_NODE_QUERY = `
  query GetNode($name: String!) {
    node(name: $name) {
      name
      isCommodity
      isMarket
      isRes
      cost
      inflow
      state {
        inMax
        outMax
        stateLossProportional
        stateMax
        stateMin
        initialState
        isScenarioIndependent
        isTemp
        tEConversion
        residualValue
      }
      groups {
        name
      }
    }
  }
`;

export const GET_GROUPS_FOR_NODE_QUERY = `
  query GroupsForNode($name: String!) {
    groupsForNode(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_NODE_DIFFUSION_QUERY = `
  query NodeDiffusion($fromNode: String!, $toNode: String!) {
    nodeDiffusion(fromNode: $fromNode, toNode: $toNode) {
      fromNode {
        name
      }
      toNode {
        name
      }
      coefficient
    }
  }
`;

export const GET_GROUPS_FOR_PROCESS_QUERY = `
  query GroupsForProcess($name: String!) {
    groupsForProcess(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_PROCESS_QUERY = `
  query GetProcess($name: String!) {
    process(name: $name) {
      name
      conversion
      isCf
      isCfFix
      isOnline
      isRes
      eff
      loadMin
      loadMax
      startCost
      minOnline
      minOffline
      maxOnline
      maxOffline
      isScenarioIndependent
      cf
      effTs
      effOps
      effFun {
        x
        y
      }
      groups {
        name
      }
      topos {
        source {
          ... on Node {
            name
          }
          ... on Process {
            name
          }
        }
        sink {
          ... on Node {
            name
          }
          ... on Process {
            name
          }
        }
      }
    }
  }
`;

export const GET_SCENARIO_QUERY = `
  query GetScenario($name: String!) {
    scenario(name: $name) {
      name
      weight
    }
  }
`;

export const GET_JOB_STATUS_QUERY = `
  query JobStatus($jobId: Int!) {
    jobStatus(jobId: $jobId) {
      state
      message
    }
  }
`;

export const GET_JOB_OUTCOME_QUERY = `
  query JobOutcome($jobId: Int!) {
    jobOutcome(jobId: $jobId) {
      ... on OptimizationOutcome {
        time
        controlSignals {
          name
          signal
        }
      }
      ... on WeatherForecastOutcome {
        time
        temperature
      }
    }
  }
`;

// MUTATIONS
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

export const CREATE_RISK_MUTATION = `
  mutation CreateRisk($risk: NewRisk!) {
    createRisk(risk: $risk) {
      errors {
        field
        message
      }
    }
  }
`;

export const START_OPTIMIZATION_MUTATION = `
  mutation {
    startOptimization
  }
`;

export const START_WEATHER_FORECAST_FETCH_MUTATION = `
  mutation {
    startWeatherForecastFetch
  }
`;

export const UPDATE_TIME_LINE_MUTATION = `
  mutation UpdateTimeLine($timeLineInput: TimeLineUpdate!) {
    updateTimeLine(timeLineInput: $timeLineInput) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_SCENARIO_MUTATION = `
  mutation CreateScenario($name: String!, $weight: Float!) {
    createScenario(name: $name, weight: $weight) {
      error
    }
  }
`;

export const SAVE_MODEL_MUTATION = `
  mutation {
    saveModel {
      error
    }
  }
`;

export const CREATE_NODE_GROUP_MUTATION = `
  mutation CreateNodeGroup($name: String!) {
    createNodeGroup(name: $name) {
      error
    }
  }
`;

export const CREATE_PROCESS_MUTATION = `
  mutation CreateProcess($process: NewProcess!) {
    createProcess(process: $process) {
      errors {
        field
        message
      }
    }
  }
`;

export const ADD_PROCESS_TO_GROUP_MUTATION = `
  mutation AddProcessToGroup($processName: String!, $groupName: String!) {
    addProcessToGroup(processName: $processName, groupName: $groupName) {
      error
    }
  }
`;

export const CREATE_TOPOLOGY_MUTATION = `
  mutation CreateTopology($topology: NewTopology!, $sourceNodeName: String, $processName: String!, $sinkNodeName: String) {
    createTopology(topology: $topology, sourceNodeName: $sourceNodeName, processName: $processName, sinkNodeName: $sinkNodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const ADD_NODE_TO_GROUP_MUTATION = `
  mutation AddNodeToGroup($nodeName: String!, $groupName: String!) {
    addNodeToGroup(nodeName: $nodeName, groupName: $groupName) {
      error
    }
  }
`;

export const UPDATE_NODE_STATE_MUTATION = `
  mutation UpdateNodeState($state: StateUpdate!, $nodeName: String!) {
    updateNodeState(state: $state, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_NODE_DIFFUSION_MUTATION = `
  mutation CreateNodeDiffusion($fromNode: String!, $toNode: String!, $coefficient: Float!) {
    createNodeDiffusion(fromNode: $fromNode, toNode: $toNode, coefficient: $coefficient) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_GEN_CONSTRAINT_MUTATION = `
  mutation CreateGenConstraint($constraint: NewGenConstraint!) {
    createGenConstraint(constraint: $constraint) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_FLOW_CON_FACTOR_MUTATION = `
  mutation CreateFlowConFactor($factor: Float!, $constraintName: String!, $processName: String!, $sourceOrSinkNodeName: String!) {
    createFlowConFactor(
      factor: $factor, 
      constraintName: $constraintName, 
      processName: $processName, 
      sourceOrSinkNodeName: $sourceOrSinkNodeName
    ) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_STATE_CON_FACTOR_MUTATION = `
  mutation CreateStateConFactor($factor: Float!, $constraintName: String!, $nodeName: String!) {
    createStateConFactor(factor: $factor, constraintName: $constraintName, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_ONLINE_CON_FACTOR_MUTATION = `
  mutation CreateOnlineConFactor($factor: Float!, $constraintName: String!, $processName: String!) {
    createOnlineConFactor(factor: $factor, constraintName: $constraintName, processName: $processName) {
      errors {
        field
        message
      }
    }
  }
`;

export const UPDATE_SETTINGS_MUTATION = `
  mutation UpdateSettings($settingsInput: SettingsInput!) {
    updateSettings(settingsInput: $settingsInput) {
      ... on ValidationErrors {
        errors {
          field
          message
        }
      }
      ... on Settings {
        location {
          country
          place
        }
      }
    }
  }
`;
