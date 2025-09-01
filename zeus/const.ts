/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Clock: "enum" as const,
	ConstraintFactorType: "enum" as const,
	ConstraintType: "enum" as const,
	Conversion: "enum" as const,
	JobState: "enum" as const,
	MarketDirection: "enum" as const,
	MarketType: "enum" as const,
	DurationInput:{

	},
	ForecastValueInput:{

	},
	InputDataSetupUpdate:{

	},
	LocationInput:{

	},
	NewGenConstraint:{
		gcType:"ConstraintType",
		constant:"ValueInput"
	},
	NewMarket:{
		mType:"MarketType",
		direction:"MarketDirection",
		price:"ForecastValueInput",
		upPrice:"ForecastValueInput",
		downPrice:"ForecastValueInput",
		reserveActivationPrice:"ValueInput"
	},
	NewNode:{
		cost:"ValueInput"
	},
	NewNodeDelay:{

	},
	NewNodeDiffusion:{
		coefficient:"ValueInput"
	},
	NewProcess:{
		conversion:"Conversion",
		cf:"ValueInput",
		effTs:"ValueInput"
	},
	NewRisk:{

	},
	NewSeries:{
		durations:"DurationInput"
	},
	NewTopology:{
		capTs:"ValueInput"
	},
	SettingsInput:{
		location:"LocationInput"
	},
	StateInput:{

	},
	StateUpdate:{

	},
	TimeLineUpdate:{
		duration:"DurationInput",
		step:"DurationInput"
	},
	ValueInput:{

	},
	DateTime: `scalar.DateTime` as const,
	Mutation:{
		updateTimeLine:{
			timeLineInput:"TimeLineUpdate"
		},
		createScenario:{

		},
		deleteScenario:{

		},
		updateInputDataSetup:{
			setupUpdate:"InputDataSetupUpdate"
		},
		createNodeGroup:{

		},
		createProcessGroup:{

		},
		deleteGroup:{

		},
		createProcess:{
			process:"NewProcess"
		},
		addProcessToGroup:{

		},
		deleteProcess:{

		},
		createTopology:{
			topology:"NewTopology"
		},
		deleteTopology:{

		},
		createNode:{
			node:"NewNode"
		},
		addNodeToGroup:{

		},
		setNodeState:{
			state:"StateInput"
		},
		updateNodeState:{
			state:"StateUpdate"
		},
		connectNodeInflowToTemperatureForecast:{

		},
		deleteNode:{

		},
		createNodeDiffusion:{
			newDiffusion:"NewNodeDiffusion"
		},
		deleteNodeDiffusion:{

		},
		createNodeDelay:{
			delay:"NewNodeDelay"
		},
		deleteNodeDelay:{

		},
		createNodeHistory:{

		},
		deleteNodeHistory:{

		},
		addStepToNodeHistory:{
			step:"NewSeries"
		},
		clearNodeHistorySteps:{

		},
		createMarket:{
			market:"NewMarket"
		},
		connectMarketPricesToForecast:{

		},
		deleteMarket:{

		},
		createRisk:{
			risk:"NewRisk"
		},
		deleteRisk:{

		},
		createGenConstraint:{
			constraint:"NewGenConstraint"
		},
		deleteGenConstraint:{

		},
		createFlowConFactor:{
			factor:"ValueInput"
		},
		deleteFlowConFactor:{

		},
		createStateConFactor:{
			factor:"ValueInput"
		},
		deleteStateConFactor:{

		},
		createOnlineConFactor:{
			factor:"ValueInput"
		},
		deleteOnlineConFactor:{

		},
		updateSettings:{
			settingsInput:"SettingsInput"
		}
	},
	Query:{
		genConstraint:{

		},
		nodeGroup:{

		},
		nodesInGroup:{

		},
		processGroup:{

		},
		processesInGroup:{

		},
		market:{

		},
		node:{

		},
		groupsForNode:{

		},
		nodeDiffusion:{

		},
		groupsForProcess:{

		},
		process:{

		},
		conFactorsForProcess:{

		},
		scenario:{

		},
		jobStatus:{

		},
		jobOutcome:{

		}
	}
}

export const ReturnTypes: Record<string,any> = {
	DateTime: `scalar.DateTime` as const,
	ClockChoice:{
		choice:"Clock"
	},
	ConFactor:{
		varType:"ConstraintFactorType",
		varTuple:"VariableId",
		data:"Value"
	},
	Constant:{
		value:"Float"
	},
	ControlSignal:{
		name:"String",
		signal:"Float"
	},
	CustomStartTime:{
		startTime:"DateTime"
	},
	Delay:{
		fromNode:"Node",
		toNode:"Node",
		delay:"Float",
		minDelayFlow:"Float",
		maxDelayFlow:"Float"
	},
	Duration:{
		hours:"Int",
		minutes:"Int",
		seconds:"Int"
	},
	ElectricityPriceOutcome:{
		time:"DateTime",
		price:"Float"
	},
	FloatList:{
		values:"Float"
	},
	Forecast:{
		name:"String"
	},
	ForecastValue:{
		scenario:"String",
		value:"Forecastable"
	},
	GenConstraint:{
		name:"String",
		gcType:"ConstraintType",
		isSetpoint:"Boolean",
		penalty:"Float",
		factors:"ConFactor",
		constant:"Value"
	},
	InflowBlock:{
		name:"String",
		node:"Node",
		data:"Value"
	},
	InputData:{
		scenarios:"Scenario",
		setup:"InputDataSetup",
		processes:"Process",
		nodes:"Node",
		nodeDiffusion:"NodeDiffusion",
		nodeDelay:"Delay",
		nodeHistories:"NodeHistory",
		markets:"Market",
		nodeGroups:"NodeGroup",
		processGroups:"ProcessGroup",
		reserveType:"ReserveType",
		risk:"Risk",
		inflowBlocks:"InflowBlock",
		genConstraints:"GenConstraint"
	},
	InputDataSetup:{
		containsReserves:"Boolean",
		containOnline:"Boolean",
		containsStates:"Boolean",
		containsPiecewiseEff:"Boolean",
		containsRisk:"Boolean",
		containsDiffusion:"Boolean",
		containsDelay:"Boolean",
		containsMarkets:"Boolean",
		reserveRealisation:"Boolean",
		useMarketBids:"Boolean",
		commonTimeSteps:"Int",
		commonScenario:"Scenario",
		useNodeDummyVariables:"Boolean",
		useRampDummyVariables:"Boolean",
		nodeDummyVariableCost:"Float",
		rampDummyVariableCost:"Float"
	},
	JobStatus:{
		state:"JobState",
		message:"String"
	},
	LocationSettings:{
		country:"String",
		place:"String"
	},
	Market:{
		name:"String",
		mType:"MarketType",
		node:"Node",
		processGroup:"ProcessGroup",
		direction:"MarketDirection",
		realisation:"Float",
		reserveType:"ReserveType",
		isBid:"Boolean",
		isLimited:"Boolean",
		minBid:"Float",
		maxBid:"Float",
		fee:"Float",
		price:"ForecastValue",
		upPrice:"ForecastValue",
		downPrice:"ForecastValue",
		reserveActivationPrice:"Value",
		fixed:"MarketFix"
	},
	MarketFix:{
		name:"String",
		factor:"Float"
	},
	MaybeError:{
		message:"String"
	},
	Model:{
		timeLine:"TimeLineSettings",
		inputData:"InputData"
	},
	Mutation:{
		startOptimization:"Int",
		startElectricityPriceFetch:"Int",
		startWeatherForecastFetch:"Int",
		updateTimeLine:"ValidationErrors",
		createScenario:"MaybeError",
		deleteScenario:"MaybeError",
		saveModel:"MaybeError",
		clearInputData:"MaybeError",
		updateInputDataSetup:"ValidationErrors",
		createNodeGroup:"MaybeError",
		createProcessGroup:"MaybeError",
		deleteGroup:"MaybeError",
		createProcess:"ValidationErrors",
		addProcessToGroup:"MaybeError",
		deleteProcess:"MaybeError",
		createTopology:"ValidationErrors",
		deleteTopology:"MaybeError",
		createNode:"ValidationErrors",
		addNodeToGroup:"MaybeError",
		setNodeState:"ValidationErrors",
		updateNodeState:"ValidationErrors",
		connectNodeInflowToTemperatureForecast:"MaybeError",
		deleteNode:"MaybeError",
		createNodeDiffusion:"ValidationErrors",
		deleteNodeDiffusion:"MaybeError",
		createNodeDelay:"ValidationErrors",
		deleteNodeDelay:"MaybeError",
		createNodeHistory:"ValidationErrors",
		deleteNodeHistory:"MaybeError",
		addStepToNodeHistory:"ValidationErrors",
		clearNodeHistorySteps:"MaybeError",
		createMarket:"ValidationErrors",
		connectMarketPricesToForecast:"MaybeError",
		deleteMarket:"MaybeError",
		createRisk:"ValidationErrors",
		deleteRisk:"MaybeError",
		createGenConstraint:"ValidationErrors",
		deleteGenConstraint:"MaybeError",
		createFlowConFactor:"ValidationErrors",
		deleteFlowConFactor:"MaybeError",
		createStateConFactor:"ValidationErrors",
		deleteStateConFactor:"MaybeError",
		createOnlineConFactor:"ValidationErrors",
		deleteOnlineConFactor:"MaybeError",
		updateSettings:"SettingsResult"
	},
	Node:{
		name:"String",
		groups:"NodeGroup",
		isCommodity:"Boolean",
		isMarket:"Boolean",
		isRes:"Boolean",
		state:"State",
		cost:"Value",
		inflow:"Forecastable"
	},
	NodeDiffusion:{
		fromNode:"Node",
		toNode:"Node",
		coefficient:"Value"
	},
	NodeGroup:{
		name:"String",
		members:"Node"
	},
	NodeHistory:{
		node:"Node",
		steps:"Series"
	},
	OptimizationOutcome:{
		time:"DateTime",
		controlSignals:"ControlSignal"
	},
	Point:{
		x:"Float",
		y:"Float"
	},
	Process:{
		name:"String",
		groups:"ProcessGroup",
		conversion:"Conversion",
		isCf:"Boolean",
		isCfFix:"Boolean",
		isOnline:"Boolean",
		isRes:"Boolean",
		eff:"Float",
		loadMin:"Float",
		loadMax:"Float",
		startCost:"Float",
		minOnline:"Float",
		minOffline:"Float",
		maxOnline:"Float",
		maxOffline:"Float",
		isScenarioIndependent:"Boolean",
		topos:"Topology",
		cf:"Value",
		effTs:"Value",
		effOps:"String",
		effFun:"Point"
	},
	ProcessGroup:{
		name:"String",
		members:"Process"
	},
	Query:{
		settings:"Settings",
		model:"Model",
		genConstraint:"GenConstraint",
		nodeGroup:"NodeGroup",
		nodesInGroup:"Node",
		processGroup:"ProcessGroup",
		processesInGroup:"Process",
		market:"Market",
		node:"Node",
		groupsForNode:"NodeGroup",
		nodeDiffusion:"NodeDiffusion",
		groupsForProcess:"ProcessGroup",
		process:"Process",
		conFactorsForProcess:"ConFactor",
		scenario:"Scenario",
		jobStatus:"JobStatus",
		jobOutcome:"JobOutcome"
	},
	ReserveType:{
		name:"String",
		rampRate:"Float"
	},
	Risk:{
		parameter:"String",
		value:"Float"
	},
	Scenario:{
		name:"String",
		weight:"Float"
	},
	Series:{
		scenario:"String",
		durations:"Duration",
		values:"Float"
	},
	Settings:{
		location:"LocationSettings"
	},
	State:{
		inMax:"Float",
		outMax:"Float",
		stateLossProportional:"Float",
		stateMax:"Float",
		stateMin:"Float",
		initialState:"Float",
		isScenarioIndependent:"Boolean",
		isTemp:"Boolean",
		tEConversion:"Float",
		residualValue:"Float"
	},
	TimeLineSettings:{
		duration:"Duration",
		step:"Duration",
		start:"TimeLineStart"
	},
	Topology:{
		source:"NodeOrProcess",
		sink:"NodeOrProcess"
	},
	ValidationError:{
		field:"String",
		message:"String"
	},
	ValidationErrors:{
		errors:"ValidationError"
	},
	Value:{
		scenario:"String",
		value:"SeriesValue"
	},
	VariableId:{
		entity:"NodeOrProcess",
		identifier:"Node"
	},
	WeatherForecastOutcome:{
		time:"DateTime",
		temperature:"Float"
	},
	Forecastable:{
		"...on Constant":"Constant",
		"...on FloatList":"FloatList",
		"...on Forecast":"Forecast"
	},
	JobOutcome:{
		"...on ElectricityPriceOutcome":"ElectricityPriceOutcome",
		"...on OptimizationOutcome":"OptimizationOutcome",
		"...on WeatherForecastOutcome":"WeatherForecastOutcome"
	},
	NodeOrProcess:{
		"...on Node":"Node",
		"...on Process":"Process"
	},
	SeriesValue:{
		"...on Constant":"Constant",
		"...on FloatList":"FloatList"
	},
	SettingsResult:{
		"...on Settings":"Settings",
		"...on ValidationErrors":"ValidationErrors"
	},
	TimeLineStart:{
		"...on ClockChoice":"ClockChoice",
		"...on CustomStartTime":"CustomStartTime"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}