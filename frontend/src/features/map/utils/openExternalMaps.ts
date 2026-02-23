import { Linking, Platform } from 'react-native';

export async function openExternalMaps(lat: number, lng: number, label: string) {
  const encodedLabel = encodeURIComponent(label);

  const iosUrl = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodedLabel}`;
  const androidGeo = `geo:${lat},${lng}?q=${lat},${lng}(${encodedLabel})`;
  const googleFallback = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const primary = Platform.OS === 'ios' ? iosUrl : androidGeo;

  const canOpenPrimary = await Linking.canOpenURL(primary);
  if (canOpenPrimary) {
    await Linking.openURL(primary);
    return;
  }

  await Linking.openURL(googleFallback);
}

export async function openExternalMapsByQuery(query: string) {
  const encodedQuery = encodeURIComponent(query);
  const appleUrl = `http://maps.apple.com/?q=${encodedQuery}`;
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const primary = Platform.OS === 'ios' ? appleUrl : googleUrl;

  const canOpenPrimary = await Linking.canOpenURL(primary);
  if (canOpenPrimary) {
    await Linking.openURL(primary);
    return;
  }

  await Linking.openURL(googleUrl);
}
