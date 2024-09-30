const generateMarketData = () => {
  return {
    markets: {
      npe: {
        name: "npe",
        var_type: "energy",
        node: "electricitygrid",
        processgroup: "p1",
        direction: "none",
        realisation: {
          ts_data: [
            { scenario: "s1", series: {} },
            { scenario: "s2", series: {} }
          ]
        },
        reserve_type: "",  // reserve_type should be a string
        is_bid: true,
        is_limited: false,
        min_bid: 0.0,
        max_bid: 0.0,
        fee: 0.0,
        price: {
          ts_data: [
            { scenario: "s1", series: {} },
            { scenario: "s2", series: {} }
          ]
        },
        up_price: {
          ts_data: [
            { scenario: "s1", series: {} },
            { scenario: "s2", series: {} }
          ]
        },
        down_price: {
          ts_data: [
            { scenario: "s1", series: {} },
            { scenario: "s2", series: {} }
          ]
        },
        reserve_activation_price: {
          ts_data: [
            { scenario: "s1", series: {} },
            { scenario: "s2", series: {} }
          ]
        },
        fixed: []
      }
    }
  };
};

export default generateMarketData;
