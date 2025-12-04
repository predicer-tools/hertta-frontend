
// src/graphql/queries.js

import { gql } from '@apollo/client';

export const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql';

export const GET_SETTINGS_QUERY = gql`
  query {
    settings {
      location {
        country
        place
      }
    }
  }
`;

export const MODEL_QUERY = gql`
  query Model {
    model {
      inputData {
        scenarios { name weight }
      }
    }
  }
`;

export const GET_MODEL_QUERY = gql`
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
        start {
          ... on ClockChoice {
            choice
          }
          ... on CustomStartTime {
            startTime
          }
        }
      }
      inputData {
        scenarios {
          name
          weight
        }
        setup {
          reserveRealisation
          useMarketBids
          useReserves
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
          minOffline
          maxOnline
          maxOffline
          isScenarioIndependent
          cf {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
          effTs {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
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
          cost {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
          inflow {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
              ... on Forecast {
                name
                fType
              }
            }
          }
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
          realisation {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
          reserveType {
            name
            rampRate
          }
          isBid
          isLimited
          minBid
          maxBid
          fee
          price {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
              ... on Forecast {
                name
                fType
              }
            }
          }
          upPrice {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
              ... on Forecast {
                name
                fType
              }
            }
          }
          downPrice {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
              ... on Forecast {
                name
                fType
              }
            }
          }
          reserveActivationPrice {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
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
          data {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
        }
        genConstraints {
          name
          gcType
          isSetpoint
          penalty
          constant {
            scenario
            value {
              ... on Constant {
                value
              }
              ... on FloatList {
                values
              }
            }
          }
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
            data {
              scenario
              value {
                ... on Constant {
                  value
                }
                ... on FloatList {
                  values
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_GEN_CONSTRAINT_QUERY = gql`
  query GetGenConstraint($name: String!) {
    genConstraint(name: $name) {
      name
      gcType
      isSetpoint
      penalty
      constant {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
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
        data {
          scenario
          value {
            ... on Constant {
              value
            }
            ... on FloatList {
              values
            }
          }
        }
      }
    }
  }
`;

export const GET_NODE_GROUP_QUERY = gql`
  query GetNodeGroup($name: String!) {
    nodeGroup(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_NODES_IN_GROUP_QUERY = gql`
  query GetNodesInGroup($name: String!) {
    nodesInGroup(name: $name) {
      name
    }
  }
`;

export const GET_PROCESS_GROUP_QUERY = gql`
  query GetProcessGroup($name: String!) {
    processGroup(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_PROCESSES_IN_GROUP_QUERY = gql`
  query GetProcessesInGroup($name: String!) {
    processesInGroup(name: $name) {
      name
    }
  }
`;

export const GET_MARKET_QUERY = gql`
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
      realisation {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
      reserveType {
        name
        rampRate
      }
      isBid
      isLimited
      minBid
      maxBid
      fee
      price {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
          ... on Forecast {
            name
            fType
          }
        }
      }
      upPrice {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
          ... on Forecast {
            name
            fType
          }
        }
      }
      downPrice {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
          ... on Forecast {
            name
            fType
          }
        }
      }
      reserveActivationPrice {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
      fixed {
        name
        factor
      }
    }
  }
`;

export const GET_NODE_QUERY = gql`
  query GetNode($name: String!) {
    node(name: $name) {
      name
      isCommodity
      isMarket
      isRes
      cost {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
      inflow {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
          ... on Forecast {
            name
            fType
          }
        }
      }
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

export const GET_GROUPS_FOR_NODE_QUERY = gql`
  query GroupsForNode($name: String!) {
    groupsForNode(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_NODE_DIFFUSION_QUERY = gql`
  query NodeDiffusion($fromNode: String!, $toNode: String!) {
    nodeDiffusion(fromNode: $fromNode, toNode: $toNode) {
      fromNode {
        name
      }
      toNode {
        name
      }
      coefficient {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
    }
  }
`;

export const GET_GROUPS_FOR_PROCESS_QUERY = gql`
  query GroupsForProcess($name: String!) {
    groupsForProcess(name: $name) {
      name
      members {
        name
      }
    }
  }
`;

export const GET_PROCESS_QUERY = gql`
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
      cf {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
      effTs {
        scenario
        value {
          ... on Constant {
            value
          }
          ... on FloatList {
            values
          }
        }
      }
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

export const GET_SCENARIO_QUERY = gql`
  query GetScenario($name: String!) {
    scenario(name: $name) {
      name
      weight
    }
  }
`;

export const GET_JOB_OUTCOME_QUERY = gql`
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
      ... on ElectricityPriceOutcome {
        time
        price
      }
    }
  }
`;

// MUTATIONS
export const CLEAR_INPUT_DATA_MUTATION = gql`
  mutation ClearInputData {
    clearInputData {
      message
    }
  }
`;

export const UPDATE_INPUT_DATA_SETUP_MUTATION = gql`
  mutation UpdateInputDataSetup($setupUpdate: InputDataSetupInput!) {
    createInputDataSetup(setupUpdate: $setupUpdate) {
      errors {
        field
        message
      }
    }
  }
`;

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

export const SET_NODE_STATE_MUTATION = gql`
  mutation SetNodeState($nodeName: String!, $state: NewState) {
    setNodeState(state: $state, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_PROCESS_GROUP_MUTATION = gql`
  mutation CreateProcessGroup($name: String!) {
    createProcessGroup(name: $name) {
      message
    }
  }
`;

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

export const START_OPTIMIZATION_MUTATION = gql`
  mutation StartOptimization {
    startOptimization
  }
`;

export const START_WEATHER_FORECAST_FETCH_MUTATION = gql`
  mutation StartWeatherForecastFetch {
    startWeatherForecastFetch
  }
`;

export const UPDATE_TIME_LINE_MUTATION = gql`
  mutation UpdateTimeLine($timeLineInput: TimeLineUpdate!) {
    updateTimeLine(timeLineInput: $timeLineInput) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_SCENARIO_MUTATION = gql`
  mutation CreateScenario($name: String!, $weight: Float!) {
    createScenario(name: $name, weight: $weight) {
      message
    }
  }
`;

export const SAVE_MODEL_MUTATION = gql`
  mutation SaveModel {
    saveModel {
      message
    }
  }
`;

export const CREATE_NODE_GROUP_MUTATION = gql`
  mutation CreateNodeGroup($name: String!) {
    createNodeGroup(name: $name) {
      message
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

export const ADD_PROCESS_TO_GROUP_MUTATION = gql`
  mutation AddProcessToGroup($processName: String!, $groupName: String!) {
    addProcessToGroup(processName: $processName, groupName: $groupName) {
      message
    }
  }
`;

export const CREATE_TOPOLOGY_MUTATION = gql`
  mutation CreateTopology($topology: NewTopology!, $sourceNodeName: String, $processName: String!, $sinkNodeName: String) {
    createTopology(topology: $topology, sourceNodeName: $sourceNodeName, processName: $processName, sinkNodeName: $sinkNodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const ADD_NODE_TO_GROUP_MUTATION = gql`
  mutation AddNodeToGroup($nodeName: String!, $groupName: String!) {
    addNodeToGroup(nodeName: $nodeName, groupName: $groupName) {
      message
    }
  }
`;

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

export const CREATE_NODE_DIFFUSION_MUTATION = gql`
  mutation CreateNodeDiffusion($newDiffusion: NewNodeDiffusion!) {
    createNodeDiffusion(newDiffusion: $newDiffusion) {
      errors {
        field
        message
      }
    }
  }
`;

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

export const CREATE_FLOW_CON_FACTOR_MUTATION = gql`
  mutation CreateFlowConFactor($factor: [ValueInput!]!, $constraintName: String!, $processName: String!, $sourceOrSinkNodeName: String!) {
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

export const CREATE_STATE_CON_FACTOR_MUTATION = gql`
  mutation CreateStateConFactor($factor: [ValueInput!]!, $constraintName: String!, $nodeName: String!) {
    createStateConFactor(factor: $factor, constraintName: $constraintName, nodeName: $nodeName) {
      errors {
        field
        message
      }
    }
  }
`;

export const CREATE_ONLINE_CON_FACTOR_MUTATION = gql`
  mutation CreateOnlineConFactor($factor: [ValueInput!]!, $constraintName: String!, $processName: String!) {
    createOnlineConFactor(factor: $factor, constraintName: $constraintName, processName: $processName) {
      errors {
        field
        message
      }
    }
  }
`;

export const UPDATE_SETTINGS_MUTATION = gql`
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

export const JOB_STATUS_QUERY = gql`
  query JobStatus($jobId: Int!) {
    jobStatus(jobId: $jobId) {
      state
      message
    }
  }
`;
;


export const GET_JOB_STATUS_QUERY = gql`
  query JobStatus($jobId: Int!) {
    jobStatus(jobId: $jobId) {
      state
      message
    }
  }
`;

export const START_ELECTRICITY_PRICE_FETCH_MUTATION = `
  mutation {
    startElectricityPriceFetch
  }
`;

// MUTATIONS
// Query to get names of all nodes in the model's input data
export const GET_NODE_NAMES_QUERY = gql`
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

// Query to get names of all scenarios in the model's input data
export const GET_SCENARIOS_QUERY = gql`
  query GetScenarios {
    model {
      inputData {
        scenarios {
          name
        }
      }
    }
  }
`;

// Query to get names of all processes in the model's input data
export const GET_PROCESS_NAMES_QUERY = gql`
  query GetProcessNames {
    model {
      inputData {
        processes {
          name
        }
      }
    }
  }
`;

export const CREATE_ROOM_GEN_CONSTRAINTS_MUTATION = `
  mutation CreateRoomGenConstraints(
    $upConstraint: NewGenConstraint!,
    $downConstraint: NewGenConstraint!
  ) {
    up: createGenConstraint(constraint: $upConstraint) {
      errors { field message }
    }
    down: createGenConstraint(constraint: $downConstraint) {
      errors { field message }
    }
  }
`;

export const CONNECT_NODE_INFLOW_TO_TEMP_FORECAST = gql`
  mutation ConnectNodeInflowToTempForecast($nodeName: String!, $forecastName: String!, $forecastType: String!) {
    connectNodeInflowToTemperatureForecast(
      nodeName: $nodeName,
      forecastName: $forecastName,
      forecastType: $forecastType
    ) {
      message
    }
  }
`;

