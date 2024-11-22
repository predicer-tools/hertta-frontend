// src/homeAssistantWebSocket.js

const connectWebSocket = (apiKey, onEntityUpdate) => {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${protocol}192.168.41.27:8123/api/websocket`; // Correct WebSocket URL
  
    let ws;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
  
    const connect = () => {
      ws = new WebSocket(wsUrl);
  
      ws.onopen = () => {
        console.log('WebSocket connection opened.');
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
  
        // Authenticate
        ws.send(JSON.stringify({ type: "auth", access_token: apiKey }));
      };
  
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
  
          if (data.type === "auth_ok") {
            console.log('WebSocket authentication successful.');
  
            // Subscribe to state_changed events
            ws.send(
              JSON.stringify({
                id: 1,
                type: "subscribe_events",
                event_type: "state_changed",
              })
            );
          } else if (data.type === "auth_invalid") {
            console.error('WebSocket authentication failed. Invalid API key.');
            ws.close();
          } else if (
            data.type === "event" &&
            data.event.event_type === "state_changed"
          ) {
            const { entity_id, new_state } = data.event.data;
            if (entity_id && new_state) {
              onEntityUpdate(entity_id, new_state);
            } else {
              console.warn(
                'Received state_changed event with missing data:',
                data.event.data
              );
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
  
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
  
      ws.onclose = (event) => {
        console.warn(
          `WebSocket connection closed (Code: ${event.code}, Reason: ${event.reason}).`
        );
        if (reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(
            1000 * 2 ** reconnectAttempts,
            30000
          ); // Exponential backoff up to 30 seconds
          console.log(`Attempting to reconnect in ${timeout / 1000} seconds...`);
          setTimeout(() => {
            reconnectAttempts += 1;
            connect();
          }, timeout);
        } else {
          console.error(
            'Max reconnect attempts reached. Could not reconnect to WebSocket.'
          );
        }
      };
    };
  
    connect();
  
    // Return a function to close the WebSocket connection manually
    return () => {
      if (ws) {
        ws.close();
      }
    };
};
  
export default connectWebSocket;
  