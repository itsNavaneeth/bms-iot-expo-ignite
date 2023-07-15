import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import React from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "../components"
import { translate } from "../i18n"
import { Graphboard, DemoShowroomScreen } from "../screens"
import { colors, spacing, typography } from "../theme"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import InfoPage from "../screens/InfoPage"
import { HomePage } from "../screens/HomePage"
import WaterPage from "../screens/WaterPage"
import { Profile } from "../screens/Profile"

export type DemoTabParamList = {
  Graphboard: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  DemoDebug: undefined
  DemoPodcastList: undefined
  HomePage: undefined
  InfoPage: undefined
  WaterPage: undefined
  Profile: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
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

      {/* <Tab.Screen
        name="DemoShowroom"
        component={DemoShowroomScreen}
        options={{
          tabBarLabel: translate("demoNavigator.componentsTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="settings" color={focused && colors.tint} size={30} />
          ),
        }}
      /> */}

      {/* <Tab.Screen
        name="DemoPodcastList"
        component={DemoPodcastListScreen}
        options={{
          tabBarLabel: translate("demoNavigator.podcastListTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="components" color={focused && colors.tint} size={30} />
          ),
        }}
      /> */}

      {/* <Tab.Screen
        name="DemoDebug"
        component={DemoDebugScreen}
        options={{
          tabBarLabel: translate("demoNavigator.debugTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="components" color={focused && colors.tint} size={30} />
          ),
        }}
      /> */}
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

// @demo remove-file
