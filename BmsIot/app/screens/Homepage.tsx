import { Link, RouteProp, useRoute } from "@react-navigation/native"
import React, { FC, ReactElement, useEffect, useRef, useState } from "react"
import axios, { AxiosRequestConfig } from "axios"
import { colors, typography } from "../theme"
import {
  FlatList,
  ImageStyle,
  Platform,
  SectionList,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { DrawerLayout } from "react-native-gesture-handler"
import { useSharedValue } from "react-native-reanimated"
import { Button, Card, ListItem, Screen, Text } from "../components"
import { isRTL } from "../i18n"
import { DemoTabParamList, DemoTabScreenProps } from "../navigators/DemoNavigator"
import { spacing } from "../theme"
import * as Demos from "./DemoShowroomScreen/demos"
import {
  VictoryAnimation,
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  VictoryLabel,
  VictoryPie,
  VictoryTheme,
} from "victory-native"
// import { Defs } from "react-native-svg"
import Svg, { Use, Image } from "react-native-svg"

const optionsMoisture: AxiosRequestConfig = {
  method: "GET",
  url: "https://api.thingspeak.com/channels/2028980/fields/2.json",
  params: { results: "1", api_key: "SO50RIFJSC1IIO7K" },
}

const optionsValve: AxiosRequestConfig = {
  method: "GET",
  url: "https://api.thingspeak.com/channels/2028983/feeds.json",
  params: { results: "1", api_key: "SO50RIFJSC1IIO7K" },
}

const optionsUbidotsON: AxiosRequestConfig = {
  method: "POST",
  url: "https://industrial.api.ubidots.com/api/v1.6/variables/639179fb72ec12000c900fb2/values/",
  headers: {
    "content-type": "application/json",
    "X-Auth-Token": "BBFF-LtAIEbHEpPlRavdXFOC9Nu8SRnTN9y",
  },
  data: { value: 0 },
}

const optionsUbidotsOFF: AxiosRequestConfiguration = {
  method: "POST",
  url: "https://industrial.api.ubidots.com/api/v1.6/variables/639179fb72ec12000c900fb2/values/",
  headers: {
    "content-type": "application/json",
    "X-Auth-Token": "BBFF-LtAIEbHEpPlRavdXFOC9Nu8SRnTN9y",
  },
  data: { value: 1 },
}

export const HomePage: React.FC = () => {
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  //   usestate
  const [percent, setPercent] = useState(25)
  const [data, setData] = useState([
    { x: 1, y: 25 },
    { x: 2, y: 75 },
  ])
  const [moistureLevel, setMoistureLevel] = useState(0.0)
  const [moistureLevelMV, setMoistureLevelMV] = useState(0.0)
  const [moistureLastUpdated, setMoistureLastUpdated] = useState("")

  //   on off usestates
  const [wateringStatus, setWateringStatus] = useState("OFF")
  const [btnState, setBtnState] = useState("")
  const [textState, setTextState] = useState("text-error")

  // current time
  const [dt, setDt] = useState(new Date().toLocaleString())

  // * all axios statements
  // axios for moisture level
  const fetchMoisture = async () => {
    axios
      .request(optionsMoisture)
      .then(function (response) {
        setMoistureLastUpdated(convertUTCToIST(response.data.feeds[0].created_at))
        setMoistureLevelMV(response.data.feeds[0].field2)
        setMoistureLevel(convertMVtoPercentage(response.data.feeds[0].field2))
        setPercent(convertMVtoPercentage(response.data.feeds[0].field2))
        setData(getData(convertMVtoPercentage(response.data.feeds[0].field2)))
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  //   axios ubidots ON
  const turnOn = async () => {
    axios
      .request(optionsUbidotsON)
      .then(function (response) {
        setWateringStatus("ON")
        setTextState("text-success")
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  //   axios ubidots OFF
  const turnOff = async () => {
    axios
      .request(optionsUbidotsOFF)
      .then(function (response) {
        setWateringStatus("OFF")
        setTextState("text-error")
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  // * use effect 2 sec
  useEffect(() => {
    // let percent = 25
    const setStateInterval = setInterval(() => {
      fetchMoisture()
    }, 2000)
    return () => clearInterval(setStateInterval)
  }, [])

  // * use effect for current time
  useEffect(() => {
    let secTimer = setInterval(() => {
      setDt(new Date().toLocaleString())
    }, 1000)

    return () => clearInterval(secTimer)
  }, [])

  const getData = (percent: number) => {
    return [
      { x: 1, y: percent },
      { x: 2, y: 100 - percent },
    ]
  }

  // * functions
  // function to convert mV to percentage
  const convertMVtoPercentage = (mV: number): number => {
    let in_min = 3200
    let in_max = 1300
    let out_min = 0
    let out_max = 100
    let percentage = ((mV - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min

    // helper code to ensure percentage isnt > 100 or < 0
    if (percentage > 100) {
      percentage = 100
    } else if (percentage < 0) {
      percentage = 0
    }

    return Number(percentage.toFixed(2))
  }

  // function to convert UTC to IST
  const convertUTCToIST = (utcDate: string): string => {
    const date = new Date(utcDate)
    const istDate = new Date(date.getTime())

    const year = istDate.getFullYear()
    const month = formatDoubleDigit(istDate.getMonth() + 1) // Add 1 to account for zero-based indexing
    const day = formatDoubleDigit(istDate.getDate())
    const hours = formatDoubleDigit(istDate.getHours())
    const minutes = formatDoubleDigit(istDate.getMinutes())
    const seconds = formatDoubleDigit(istDate.getSeconds())

    const istTime = `${hours}:${minutes}:${seconds} | ${day}/${month}/${year}`

    return istTime
  }
  // helper function for double digit date parsing
  const formatDoubleDigit = (value: number) => {
    return value < 10 ? `0${value}` : value.toString()
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <View
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* heading - Welcome */}
        <View style={$heading}>
          <Text preset="heading" text="Welcome" />
        </View>
        {/* current date and time */}
        <Text
          style={$metadataText}
          size="xxs"
          weight="semiBold"
          text={`Current Date and Time ${dt}`}
        />

        {/* graph */}
        <Svg viewBox="0 0 400 400" width="100%" height="40%">
          <VictoryPie
            standalone={false}
            animate={{ duration: 1000 }}
            width={400}
            height={400}
            data={data}
            innerRadius={120}
            cornerRadius={25}
            labels={() => null}
            style={{
              data: {
                fill: ({ datum }) => {
                  let color = "green"
                  if (datum.y < 20) {
                    color = colors.palette.angry200
                  } else {
                    color = colors.palette.secondary300
                  }
                  return datum.x === 1 ? color : "transparent"
                },
              },
            }}
          />

          <VictoryAnimation duration={1000} data={{ percent }}>
            {(newProps) => (
              <VictoryLabel
                textAnchor="middle"
                verticalAnchor="middle"
                x={200}
                y={200}
                text={`${moistureLevel} %`}
                style={{ fontSize: 36, lineHeight: 44, fontFamily: "Helvetica" }}
              />
            )}
          </VictoryAnimation>
        </Svg>

        <View>
          {/* card 1  - moisture level */}
          <Card
            style={$item}
            verticalAlignment="space-between"
            HeadingComponent={
              <>
                <Text
                  style={$metadataText}
                  size="xxs"
                  weight="semiBold"
                  text={moistureLastUpdated}
                />
              </>
            }
            ContentComponent={<Text size="lg" weight="bold" text="Moisture Level" />}
            RightComponent={
              <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
                <Text
                  style={$metadataText}
                  size="xxs"
                  weight="semiBold"
                  text={`${moistureLevelMV} mV`}
                />
                <Text size="xxl" weight="bold" text={`${moistureLevel} %`} />
              </View>
            }
          />

          {/* buttons UI */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              //   padding: spacing.extraSmall,
              marginVertical: spacing.large,
            }}
          >
            <Text size="lg" weight="bold" text="Valve Control" />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: spacing.medium,
              }}
            >
              <Button
                style={{
                  flex: 1,
                  marginRight: spacing.small,
                  backgroundColor: colors.palette.secondary300,
                }}
                onPress={turnOn}
              >
                On
              </Button>
              <Button
                style={{
                  flex: 1,
                  marginLeft: spacing.small,
                  backgroundColor: colors.palette.angry200,
                }}
                onPress={turnOff}
              >
                Off
              </Button>
            </View>

            <Text size="lg" weight="bold" text={`Watering system is now ${wateringStatus}`} />
          </View>
        </View>
      </View>
    </Screen>
  )
}

const $metadataText: TextStyle = {
  color: colors.textDim,
  marginEnd: spacing.medium,
  marginBottom: spacing.extraSmall,
}

const $item: ViewStyle = {
  // padding: spacing.medium,
  marginTop: spacing.medium,
  minHeight: 100,
}

const $victoryitem: ViewStyle = {
  padding: spacing.medium,
  marginTop: spacing.medium,
  minHeight: 100,
}

const $screenContainer: ViewStyle = {
  //   flex: 1,
  paddingTop: spacing.large,
  paddingHorizontal: spacing.large,
}

const $drawer: ViewStyle = {
  flex: 1,
}

const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: spacing.large,
}

const $sectionListContentContainer: ViewStyle = {
  paddingHorizontal: spacing.large,
}

const $heading: ViewStyle = {
  marginBottom: spacing.medium,
}

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-start",
  height: 56,
  paddingHorizontal: spacing.large,
}

const $menuContainer: ViewStyle = {
  paddingBottom: spacing.extraSmall,
  paddingTop: spacing.large,
}

const $demoItemName: TextStyle = {
  fontSize: 24,
  marginBottom: spacing.medium,
}

const $demoItemDescription: TextStyle = {
  marginBottom: spacing.huge,
}

const $demoUseCasesSpacer: ViewStyle = {
  paddingBottom: spacing.huge,
}

// @demo remove-file
