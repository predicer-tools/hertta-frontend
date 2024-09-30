// Input_BidSlots.js

const generateBidSlotsData = () => {
    return {
      bid_slots: {
        npe: {
          market: "npe",
          time_steps: [],
          slots: [],
          prices: new Map(),
          market_price_allocation: new Map()
        }
      }
    };
  };
  
  export default generateBidSlotsData;
  