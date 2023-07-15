import axios, { AxiosRequestConfig } from "axios"
import React, { FC, useEffect, useState } from "react"
import {
  useWindowDimensions,
  ImageStyle,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  Dimensions,
} from "react-native"
import Svg from "react-native-svg"
import {
  VictoryAnimation,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryPie,
  VictoryTheme,
  VictoryTooltip,
} from "victory-native"
import { Card, Screen, Text } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"

const optionsMoisture: AxiosRequestConfig = {

  method: "GET",

  url: "https://api.thingspeak.com/channels/2028980/fields/2.json",

  params: { results: "1", api_key: "SO50RIFJSC1IIO7K" },

}

const optionsMoisture2: AxiosRequestConfig = {

  method: "GET",

  url: "https://api.thingspeak.com/channels/2028980/fields/2.json",

  params: { results: "15", api_key: "SO50RIFJSC1IIO7K" },

}

export const Graphboard: FC<DemoTabScreenProps<"Graphboard">> = function Graphboard(_props) {
  //   usestate
  const [thingData, setThingData] = useState([])

  // useStates
  const [moistureLevel, setMoistureLevel] = useState(0.0)
  const [moistureLevelMV, setMoistureLevelMV] = useState(0.0)
  const [moistureLastUpdated, setMoistureLastUpdated] = useState("")

  // * all axios statements
  // axios for moisture level
  const fetchLiveMoisture = async () => {
    axios
      .request(optionsMoisture2)
      .then((response) => {
        const newData = response.data.feeds.map((feed: { created_at: string; field1: string }) => ({
          created_at: convertUTCToISTTime(feed.created_at),
          field2: parseInt(feed.field1),
        }))
        setThingData(newData)
      })
      .catch((error) => console.error(error))
  }

  // axios for moisture level
  const fetchMoisture = async () => {
    axios
      .request(optionsMoisture)
      .then(function (response) {
        setMoistureLastUpdated(convertUTCToIST(response.data.feeds[0].created_at))
        setMoistureLevelMV(response.data.feeds[0].field1)
        setMoistureLevel(convertMVtoPercentage(response.data.feeds[0].field1))
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  // * all functions
  // function to convert mV to percentage
  const convertMVtoPercentage = (mV: number): number => {
    let in_min = 3000
    let in_max = 1000
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
    // const istTime = new Date(date.getTime()).toLocaleString()

    return istTime
  }

  // * use effect 2 sec
  useEffect(() => {
    const setStateInterval = setInterval(() => {
      fetchMoisture()
      fetchLiveMoisture()
    }, 2000)
    return () => clearInterval(setStateInterval)
  }, [])

  useEffect(() => {
    fetch("https://api.thingspeak.com/channels/2028980/fields/2.json?results=5")
      .then((response) => response.json())
      .then((jsonData) => {
        const newData = jsonData.feeds.map((feed) => ({
          created_at: convertUTCToISTTime(feed.created_at),
          field2: parseInt(feed.field2),
        }))
        setThingData(newData)
      })
      .catch((error) => console.error(error))
  }, [])

  const getData = (percent: number) => {
    return [
      { x: 1, y: percent },
      { x: 2, y: 100 - percent },
    ]
  }

  // * functions

  // function to convert UTC to IST time

  const convertUTCToISTTime = (utcDate: string): string => {
    const date = new Date(utcDate)
    const istDate = new Date(date.getTime())

    const year = istDate.getFullYear()
    const month = formatDoubleDigit(istDate.getMonth() + 1) // Add 1 to account for zero-based indexing
    const day = formatDoubleDigit(istDate.getDate())
    const hours = formatDoubleDigit(istDate.getHours())
    const minutes = formatDoubleDigit(istDate.getMinutes())
    const seconds = formatDoubleDigit(istDate.getSeconds())

    const istTime = `${seconds}`

    return istTime
  }
  // helper function for double digit date parsing
  const formatDoubleDigit = (value: number) => {
    return value < 10 ? `0${value}` : value.toString()
  }

  // const { width } = Dimensions.get("screen")
  const { height, width, scale, fontScale } = useWindowDimensions()
  const parentWidth = Dimensions.get("window").width * 0.85
  const parentHeight = Dimensions.get("window").height * 0.35

  const [selectedPoint, setSelectedPoint] = useState(null)

  const handlePointClick = (point) => {
    setSelectedPoint(point)
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container} safeAreaEdges={["top"]}>
      <View style={$title}>
            <Text  preset="heading" text="Graphboard" />
            <Text preset="subheading" text="Visualize your data in various graphs" />
            </View>
      <View style={$topContainer1}>
      <Text  preset="formLabel" text="Live Voltage Reading Graph" />
        {/* graph */}
        <VictoryChart
          width={parentWidth}
          height={parentHeight}
          theme={VictoryTheme.material}
          domain={{ y: [500, 3000] }}
        >
          <VictoryLine
            style={{ data: { stroke: "green", strokeWidth: 5 } }}
            // barWidth={15}
            // animate={{
            //   duration: 3000,
            //   onLoad: {
            //     duration: 500,
            //   },
            // }}
            data={thingData}
            x="created_at"
            y="field2"
          />
        </VictoryChart>
      </View>
      <View style={$topContainer2}>
        {/* card 1  - moisture level */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={moistureLastUpdated} />
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
              <Text style={$righttext} size="xxl" weight="bold" text={`${moistureLevel} %`} />
            </View>
          }
        />
      </View>
    </Screen>
  )
}


const $topContainer1: ViewStyle = {
    backgroundColor:colors.palette.accent100,
    borderRadius:10,
  paddingLeft:"1%",
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  // height: 15,
}
const $topContainer2: ViewStyle = {
  // backgroundColor: "pink",
  flex: 1,
  alignItems: "center",
  // height: 5,
}

const $container: ViewStyle = {
    backgroundColor:colors.palette.accent200,
  paddingHorizontal: spacing.large,
  height: "100%",
  paddingTop:"10%"
}



const $bgm: ViewStyle = {
  borderColor: colors.palette.accent100,
  backgroundColor: colors.palette.accent500,
  padding: "5%",
  borderRadius: 10,
  marginTop: spacing.small,
}




const $righttext: TextStyle = {
  // color: colors.textDim,
}
// end of my css



// const $container: ViewStyle = {
//   height:"100%",
//   paddingTop: spacing.large + spacing.extraLarge,
//   paddingHorizontal: spacing.large,

// }


// my css

const $title: ViewStyle = {
  marginBottom: spacing.medium,
}




const $item: ViewStyle = {
  // padding: spacing.medium,
  marginTop: spacing.medium,
  minHeight: 100,
  backgroundColor: colors.palette.accent100
}


const $metadataText: TextStyle = {
  color: colors.textDim,
  marginEnd: spacing.medium,
}

const $whiteText: TextStyle = {
  color: "white",

}
