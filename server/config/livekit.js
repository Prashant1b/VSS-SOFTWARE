import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');

export function getLiveKitConfig() {
  const serverUrl = cleanEnv(process.env.LIVEKIT_URL);
  const apiKey = cleanEnv(process.env.LIVEKIT_API_KEY);
  const apiSecret = cleanEnv(process.env.LIVEKIT_API_SECRET);

  if (!serverUrl || !apiKey || !apiSecret) {
    throw new Error('LiveKit is not configured. Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to the server environment.');
  }

  return { serverUrl, apiKey, apiSecret };
}

export function getLiveKitRoomClient() {
  const { serverUrl, apiKey, apiSecret } = getLiveKitConfig();
  return new RoomServiceClient(serverUrl, apiKey, apiSecret);
}

export async function createLiveKitToken({
  identity,
  name,
  roomName,
  metadata,
  canPublish,
  canSubscribe,
  canPublishData = canPublish,
}) {
  const { apiKey, apiSecret } = getLiveKitConfig();
  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: '2h',
  });

  token.metadata = JSON.stringify(metadata || {});
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe,
    canPublishData,
  });

  return token.toJwt();
}
