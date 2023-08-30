import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import React from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "../components"
import { translate } from "../i18n"
import { Graphboard } from "../screens"
import { HomePage } from "../screens/Homepage"
import InfoPage from "../screens/InfoPage"
import { Profile } from "../screens/Profile"
import WaterPage from "../screens/WaterPage"
import { colors, spacing, typography } from "../theme"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"

export type DemoTabParamList = {
  HomePage: undefined
  InfoPage: undefined
  WaterPage: undefined
  Graphboard: undefined
  Profile: undefined
}

export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<DemoTabParamList>()

export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [$tabBar, { height: bottom + 70 }],
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
      }}
    >
      <Tab.Screen
        name="HomePage"
        component={HomePage}
        options={{
          tabBarLabel: translate("demoNavigator.homePage"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="home" color={focused && colors.tint} size={40} />
          ),
        }}
      />

      <Tab.Screen
        name="InfoPage"
        component={InfoPage}
        options={{
          tabBarLabel: translate("demoNavigator.infoPage"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="view" color={focused && colors.tint} size={40} />
          ),
        }}
      />

      <Tab.Screen
        name="WaterPage"
        component={WaterPage}
        options={{
          tabBarLabel: translate("demoNavigator.waterPage"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="bell" color={focused && colors.tint} size={40} />
          ),
        }}
      />

      <Tab.Screen
        name="Graphboard"
        component={Graphboard}
        options={{
          tabBarLabel: translate("demoNavigator.graphboardPage"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="graph" color={focused && colors.tint} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <Icon icon="community" color={focused && colors.tint} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.medium,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  flex: 1,
}
