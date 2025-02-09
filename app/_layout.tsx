// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import Colors from "@/constants/Colors";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarTranslucent: true,
        statusBarBackgroundColor: Colors.primary,
        contentStyle: { backgroundColor: Colors.primary },
        keyboardHandlingEnabled: true,
      }}
    />
  );
}
