// src/Input_Markets.js

const generateMarketData = () => {
  return {
    markets: {
      npe: {
        name: "npe",
        m_type: "energy",
        node: "electricitygrid",
        processgroup: "p1",
        direction: "none",
        realisation: {
          ts_data: [],
          index: {}
        },
        reserve_type: "none",
        is_bid: true,
        is_limited: false,
        min_bid: 0.0,
        max_bid: 0.0,
        fee: 0.0,
        price: {
          ts_data: [],
          index: {}
        },
        up_price: {
          ts_data: [],
          index: {}
        },
        down_price: {
          ts_data: [],
          index: {}
        },
        reserve_activation_price: {
          ts_data: [],
          index: {}
        },
        fixed: []
      }
    }
  };
};

export default generateMarketData;
