import axios from 'axios';
const homeAssistantURL = 'http://192.168.1.110:8123/api';

export async function sendControlSignalToHomeAssistant(apiKey, entityId, value) {
  try {
    const domain = entityId.split('.')[0];
    let service; 
    let payload = { entity_id: entityId };

    if (domain === 'switch' || domain === 'light') {
      service = value > 0 ? 'turn_on' : 'turn_off';
    } else if (domain === 'climate') {
      service = 'set_temperature';
      payload.temperature = value;
    } else {
      service = value > 0 ? 'turn_on' : 'turn_off';
    }

    await axios.post(
        `${homeAssistantURL}/services/${domain}/${service}`,
        payload,
        { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );
    console.log(`Sent ${value} to ${entityId} via ${domain}/${service}`);
  } catch (err) {
    console.error('Error sending control signal:', err);
  }
}
