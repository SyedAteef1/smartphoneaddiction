import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { BackgroundNotificationManager } from '../components/BackgroundNotificationManager';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <BackgroundNotificationManager />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
