// homeAssistantWebSocket.js
const connectWebSocket = (apiKey, onSensorUpdate) => {
    const ws = new WebSocket(`ws://192.168.247.96:8123/api/websocket`);

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: "auth", access_token: apiKey }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "auth_ok") {
        ws.send(JSON.stringify({ id: 1, type: "subscribe_events", event_type: "state_changed" }));
        }

        if (data.type === "event" && data.event.event_type === "state_changed") {
        const { entity_id, new_state } = data.event.data;
        onSensorUpdate(entity_id, new_state);
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(() => connectWebSocket(apiKey, onSensorUpdate), 5000);
    };
};

export default connectWebSocket;
  