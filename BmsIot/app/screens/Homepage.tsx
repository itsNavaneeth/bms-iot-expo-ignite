import React from "react"
import axios from "axios"
import { useState, useEffect } from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Screen, Text } from "../components"
import { isRTL } from "../i18n"
import { spacing } from "../theme"

import { styled } from "nativewind"
const StyledView = styled(View)
const StyledText = styled(Text)

// new imports
import { Card } from "../components"
import { colors } from "../theme"

const ICON_SIZE = 14

interface Feed {
  field2: string
}

interface ResponseData {
  feeds: Feed[]
}

const Homepage: React.FC = () => {
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< State Change Variables >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const [moisturePercentageColor, setMoisturePercentageColor] = useState("bg-neutral")
  const [btnState, setBtnState] = useState("")
  const [textState, setTextState] = useState("text-error")
  const [wateringSystemMode, setWateringSystemMode] = useState("AUTOMATIC")
  const [wateringStatus, setWateringStatus] = useState("OFF")
  const [soilDetails, setSoilDetails] = useState(false)
  const [waterDetails, setWaterDetails] = useState(false)

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Data Display Variables >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  const [currentMoisture, setCurrentMoisture] = useState(80.0)
  const [temperature, setTemperature] = useState(0.0)
  const [humidity, setHumidity] = useState(0.0)
  const [rainfall, setRainfall] = useState(0.0)
  const [fieldValue, setFieldValue] = useState(null)
  const [irrigationDuration, setIrrigationDuration] = useState(0.0)
  const [irrigationQuantity, setIrrigationQuantity] = useState(0.0)
  const [moisturePercentage, setMoisturePercentage] = useState(0.0)
  const [tomPrediction, setTomPrediction] = useState(0.0)
  const [sensor1Data, setSensor1Data] = useState(0.0)
  const [sensor2Data, setSensor2Data] = useState(0.0)
  const [sensor3Data, setSensor3Data] = useState(0.0)
  const [flowData, setFlowData] = useState(0)
  const [totalWaterUsed, setTotalWaterUsed] = useState(0)
  const [realTimeFlowRate, setRealTimeFlowRate] = useState(0)
  const [valvePosition, setValvePosition] = useState("off")
  const [averagePercentage, setAveragePercentage] = useState(0)

  // nava code temp
  const [sensor1mV, setSensor1mV] = useState(0)
  const [lastUpdated, setLastUpdated] = useState("")

  // ---------------------------------------------------------------------Valve Related---------------------------------------------------------------------------------------

  // ----------------Toggle between MANUAL and AUTOMATIC Mode----------------------
  useEffect(() => {
    let temp
    if (wateringSystemMode === "AUTOMATIC") {
      setBtnState("disabled")
    } else {
      setBtnState("")
    }
  }, [wateringSystemMode])

  // ---------------------------------------------------------------------Field Data Display---------------------------------------------------------------------------------------

  // ----------------Convert Moisture to Percentage TODO:Change to be triggered by average moisture instead ----------------------
  useEffect(() => {
    let percentage = 0.0
    let empty = 0
    let full = 100
    let min_moisture = 800
    let max_moisture = 2800

    percentage =
      full -
      ((full - empty) * (currentMoisture - min_moisture)) / (max_moisture - min_moisture) +
      empty
    // percentage = 80;
    if (percentage > 100) {
      percentage = 100
    }
    if (percentage < 0) {
      percentage = 0
    }
    percentage = Number(percentage.toFixed(2))
    setMoisturePercentage(percentage)

    if (percentage < 30) {
      setMoisturePercentageColor("error")
    } else if (percentage < 60) {
      setMoisturePercentageColor("warning")
    } else {
      setMoisturePercentageColor("success")
    }
  }, [currentMoisture])

  // ---------------- Data Fetch from Thingspeak ----------------------
  useEffect(() => {
    const interval = setInterval(() => {
      //--------------Automatic mode data TODO:Change to be triggered by average moisture instead--------------

      //--------------Sensor 1--------------
      fetch("https://api.thingspeak.com/channels/2028980/feeds.json?results=2")
        .then((response) => response.json())
        .then((data) => {
          let temp = map_range(data.feeds[0].field2)
          // console.log(data.feeds[0].field2)
          setSensor1mV(data.feeds[0].field2)
          // let temp = map_range(3000);

          setSensor1Data(Number(temp))
        })
        .catch((error) => {
          console.error(error)
        })

      // console.log(data.feeds[0].created_at)

      //axios get request template
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // ---------------- Calculate Average Moisture ----------------------
  useEffect(() => {
    let x = (sensor1Data + sensor2Data + sensor3Data) / 3
    x = Number(x.toFixed(2))
    setAveragePercentage(x)
  }, [sensor1Data, sensor2Data, sensor3Data])

  // ---------------- Calculate Irrigation Duration and Irrigation Quantity TODO:Modify to use average moisture ----------------------
  useEffect(() => {
    let duration = 0.0
    let drip_ltr = 40
    let ltr = 0.0
    duration = (70 - moisturePercentage) * 3
    if (duration < 0) {
      duration = 0
    }
    duration = Number(duration.toFixed(0))
    setIrrigationDuration(duration)

    ltr = (duration * 20) / 7.5
    ltr = Number(ltr.toFixed(2))
    setIrrigationQuantity(ltr)
  }, [moisturePercentage])

  // ---------------- Field Value? TODO:Modify to use average moisture ----------------------
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "https://api.thingspeak.com/channels/1978647/fields/3.json?results=1",
      )
      const data = await response.json()
      setFieldValue(data.feeds[0].field3)

      let temp = (fieldValue * 100) / 0.72
      let percentage = 0.0
      let empty = 0
      let full = 100
      let min_moisture = 800
      let max_moisture = 2800

      percentage =
        full - ((full - empty) * (temp - min_moisture)) / (max_moisture - min_moisture) + empty

      let duration = (70 - percentage) * 3
      if (duration < 0) {
        duration = 0
      }
      duration = Number(duration.toFixed(0))
      let ltr = (duration * 20) / 7.5
      ltr = Number(ltr.toFixed(2))
      setTomPrediction(ltr)
    }
    fetchData()
  }, [fieldValue])

  // ---------------- Convert Moisture Voltage to Percentages ----------------------
  const convertToPercentage = (data) => {
    let temp = data
    let percentage = 0.0
    let empty = 0
    let full = 100
    let min_moisture = 1100
    let max_moisture = 4000
    percentage =
      full - ((full - empty) * (temp - min_moisture)) / (max_moisture - min_moisture) + empty
    let new_percentage = percentage.toFixed(2)

    // return Math.round(new_percentage);
    return new_percentage
  }

  const map_range = (data) => {
    let in_min = 3200
    let in_max = 1300
    let out_min = 0
    let out_max = 100
    let new_percentage = ((data - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    return new_percentage.toFixed(2)
  }

  return (
    <>
      <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top"]}>
        <StyledView className="flex-1 items-center justify-center my-2">
          <StyledView className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
            <StyledText className="font-normal text-gray-700 dark:text-gray-400">
              {`Last updated at: ${lastUpdated}`}
            </StyledText>
            <StyledText className="mb-2 text-lg font-bold tracking-tight text-gray-900">
              {`Sensor Reading: ${sensor1Data} % (${sensor1mV} mV)`}
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="flex-1 items-center justify-center my-2">
          <StyledView className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
            <StyledText className="font-normal text-gray-700 dark:text-gray-400">
              {`Last updated at: ${lastUpdated}`}
            </StyledText>
            <StyledText className="mb-2 text-xl font-bold tracking-tight text-gray-900">
              {`Sensor Reading: ${sensor1Data} % (${sensor1mV} mV)`}
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="flex-1 items-center justify-center my-2">
          <StyledView className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
            <StyledText className="font-normal text-gray-700 dark:text-gray-400">
              {`Last updated at: ${lastUpdated}`}
            </StyledText>
            <StyledText className="mb-2 text-xl font-bold tracking-tight text-gray-900">
              {`Sensor Reading: ${sensor1Data} % (${sensor1mV} mV)`}
            </StyledText>
          </StyledView>
        </StyledView>
      </Screen>
    </>
  )
}

const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.large,
}

const $title: TextStyle = {
  marginBottom: spacing.small,
}

const $tagline: TextStyle = {
  marginBottom: spacing.huge,
}

const $description: TextStyle = {
  marginBottom: spacing.large,
}

const $sectionTitle: TextStyle = {
  marginTop: spacing.huge,
}

const $logoContainer: ViewStyle = {
  marginEnd: spacing.medium,
  flexDirection: "row",
  flexWrap: "wrap",
  alignContent: "center",
}

const $logo: ImageStyle = {
  height: 38,
  width: 38,
}

// @demo remove-file

// #region Styles
const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: spacing.large,
  paddingTop: spacing.large + spacing.extraLarge,
  paddingBottom: spacing.large,
}

const $heading: ViewStyle = {
  marginBottom: spacing.medium,
}

const $item: ViewStyle = {
  padding: spacing.medium,
  marginTop: spacing.medium,
  minHeight: 120,
}

const $itemThumbnail: ImageStyle = {
  marginTop: spacing.small,
  borderRadius: 50,
  alignSelf: "flex-start",
}

const $toggle: ViewStyle = {
  marginTop: spacing.medium,
}

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $iconContainer: ViewStyle = {
  height: ICON_SIZE,
  width: ICON_SIZE,
  flexDirection: "row",
  marginEnd: spacing.small,
}

const $metadata: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.extraSmall,
  flexDirection: "row",
}

const $metadataText: TextStyle = {
  color: colors.textDim,
  marginEnd: spacing.medium,
  marginBottom: spacing.extraSmall,
}

const $favoriteButton: ViewStyle = {
  borderRadius: 17,
  marginTop: spacing.medium,
  justifyContent: "flex-start",
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.medium,
  paddingTop: spacing.micro,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
}

const $unFavoriteButton: ViewStyle = {
  borderColor: colors.palette.primary100,
  backgroundColor: colors.palette.primary100,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.huge,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}
// #endregion

// @demo remove-file

export default Homepage
