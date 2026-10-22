import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconBook, IconChart } from "../../components/ui/Icons";
import { colors, fonts, radius } from "../../theme/colors";

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

const TAB_SCREENS: Record<string, { label: string; icon: typeof IconBook }> = {
  index: { label: "Baca", icon: IconBook },
  progress: { label: "Kemajuan", icon: IconChart },
};

function MenoTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.bar, { height: 72 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) }]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const config = TAB_SCREENS[route.name];
        if (!config) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={config.label}
            style={({ pressed }) => [styles.tab, focused && styles.tabFocused, pressed && styles.tabPressed]}
          >
            <config.icon size={24} color={focused ? colors.indigo : colors.inkMuted} />
            <Text style={[styles.label, focused && styles.labelFocused]}>{config.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <MenoTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Baca" }} />
      <Tabs.Screen name="progress" options={{ title: "Kemajuan" }} />
      <Tabs.Screen name="library" options={{ title: "Pilih kitab", href: null }} />
      <Tabs.Screen name="chapters/[book]" options={{ title: "Pilih pasal", href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.divider,
  },
  tab: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabFocused: {
    backgroundColor: colors.goldTint,
    borderColor: colors.gold,
  },
  tabPressed: {
    opacity: 0.75,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
  },
  labelFocused: {
    fontFamily: fonts.extrabold,
    color: colors.indigo,
  },
});
