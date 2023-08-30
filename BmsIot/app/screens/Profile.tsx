import React, { FC } from "react"
import * as Application from "expo-application"
import { Linking, Platform, TextStyle, View, ViewStyle } from "react-native"
import { Button, ListItem, Screen, Text } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { isRTL } from "../i18n"
import { useStores } from "../models"
import { Card } from "../components"

export const Profile: FC<DemoTabScreenProps<"Profile">> = function Profile(_props) {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <View style={$title}>
        <Text preset="heading" text="Profile" />
        <Text preset="subheading" text="Details of your profile" />
      </View>

      <View style={$itemsContainer}>
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Crop Name</Text>
              <Text>Sweet Corn</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Variety</Text>
              <Text> F1 Hybrid INDAM - SURUCHI</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Harvest Period</Text>
              <Text>90 Days</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Soil Type</Text>
              <Text>Sandy Loam</Text>
            </View>
          }
        />

        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Expected Harvest Date</Text>
              <Text>May 11</Text>
            </View>
          }
        />
      </View>
    </Screen>
  )
}
const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingBottom: spacing.huge,
  paddingHorizontal: spacing.large,
  backgroundColor: colors.palette.accent400,
  height: "100%",
}

const $title: TextStyle = {
  marginBottom: spacing.huge,
}

const $item: ViewStyle = {
  marginBottom: spacing.medium,
  backgroundColor: colors.palette.accent100,
  width: "100%",
  borderRadius: 10,
  padding: "3%",
}

const $itemsContainer: ViewStyle = {
  marginBottom: spacing.extraLarge,
}
