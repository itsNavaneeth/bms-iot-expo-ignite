import React from "react"
import axios, { AxiosRequestConfig } from "axios"
import { useState, useEffect } from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { isRTL } from "../i18n"
import { spacing } from "../theme"
import { styled } from "nativewind"
const StyledView = styled(View)
const StyledText = styled(Text)

// new imports
import { Card } from "../components"
import { colors } from "../theme"

const ICON_SIZE = 14

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
const optionsOpenWeather: AxiosRequestConfig = {
  method: "GET",
  url: "https://api.openweathermap.org/data/2.5/weather",
  params: {
    lat: "13",
    lon: "77.5",
    appid: "406b154331868aa69ddc3dd64454c8c6",
  },
}

const InfoPage: React.FC = () => {
  // useStates
  const [moistureLevel, setMoistureLevel] = useState(0.0)
  const [moistureLevelMV, setMoistureLevelMV] = useState(0.0)
  const [moistureLastUpdated, setMoistureLastUpdated] = useState("")

  const [nextWater, setNextWater] = useState(0.0)
  const [nextWaterLastUpdated, setNextWaterLastUpdated] = useState("")

  const [temperature, setTemperature] = useState(0.0)
  const [rainfall, setRainfall] = useState(0.0)
  const [humidity, setHumidity] = useState(0.0)
  const [openWeatherLastUpdated, setOpenWeatherLastUpdated] = useState("")

  const [valveLastUpdated, setValveLastUpdated] = useState("")
  const [realTimeFlowRate, setRealTimeFlowRate] = useState(0.0)
  const [totalWaterUsed, setTotalWaterUsed] = useState(0.0)
  const [valvePosition, setValvePosition] = useState("")
  const [valvePosNumber, setValvePositionNumber] = useState(-1.0)

  // next day water requirement use states
  const [tomPrediction, setTomPrediction] = useState(0.0)
  const [fieldValue, setFieldValue] = useState(null)
  const [gcpLastUpdated, setGCPLastUpdated] = useState("")

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
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  // axios for real time flow rate, total water used, valve position
  const fetchValveInfo = async () => {
    axios
      .request(optionsValve)
      .then(function (response) {
        let water = response.data.feeds[0].field2
        let new_water = Number(water).toFixed(2)

        let valve_pos = response.data.feeds[0].field1
        let new_valve_pos
        new_valve_pos = valve_pos == 1 ? "Closed" : "Open"

        setValveLastUpdated(convertUTCToIST(response.data.feeds[0].created_at))
        setValvePositionNumber(valve_pos)
        setValvePosition(new_valve_pos)
        setTotalWaterUsed(Number(new_water))
        setRealTimeFlowRate(response.data.feeds[0].field3)
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  // axios for next water requirement
  async function fetchData() {
    const response = await fetch(
      "https://api.thingspeak.com/channels/1978647/fields/3.json?results=1",
    )
    const data = await response.json()
    setFieldValue(data.feeds[0].field3)
    setGCPLastUpdated(convertUTCToIST(data.feeds[0].created_at))

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

  // axios for temperature, humidity and rainfall (on button click)
  const getEnvironment = () => {
    axios
      .request(optionsOpenWeather)
      .then(function (response) {
        console.table(response.data)

        //Temperature
        let temp: any = response.data.main.temp - 273.15
        temp = temp.toFixed(2)
        setTemperature(temp)

        //Humidity
        let humid = response.data.main.humidity
        setHumidity(humid)

        // time last updated
        let onclickTime = new Date()
        const year = onclickTime.getFullYear()
        const month = formatDoubleDigit(onclickTime.getMonth() + 1) // Add 1 to account for zero-based indexing
        const day = formatDoubleDigit(onclickTime.getDate())
        const hours = formatDoubleDigit(onclickTime.getHours())
        const minutes = formatDoubleDigit(onclickTime.getMinutes())
        const seconds = formatDoubleDigit(onclickTime.getSeconds())

        const onclickIstTime = `${hours}:${minutes}:${seconds} | ${day}/${month}/${year}`
        setOpenWeatherLastUpdated(onclickIstTime)

        // //Rainfall
        // let rainz = response.data.main;
        // humid = humid.toFixed(2);
        // setHumidity(humid);
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  // * use effect 2 sec
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMoisture()
      fetchValveInfo()
      fetchData()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // use effect on page refresh for openweathermap

  // * all functions
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
    // const istTime = new Date(date.getTime()).toLocaleString()

    return istTime
  }
  // helper function for double digit date parsing
  const formatDoubleDigit = (value: number) => {
    return value < 10 ? `0${value}` : value.toString()
  }

  // * use effect for current time
  useEffect(() => {
    let secTimer = setInterval(() => {
      setDt(new Date().toLocaleString())
    }, 1000)

    return () => clearInterval(secTimer)
  }, [])

  return (
    <>
      <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
        {/* card 0  - current date */}
        <Card
          style={$item}
          verticalAlignment="top"
          HeadingComponent={
            <>
              <Text
                style={$metadataText}
                size="xxs"
                weight="semiBold"
                text="Current Date and Time"
              />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text={`${dt}`} />}
        />

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

        {/* card 5 - Real Time Flow Rate */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={valveLastUpdated} />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Real Time Flow Rate (L/min)" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text
                style={$righttext}
                size="xxl"
                weight="bold"
                text={`${realTimeFlowRate} L/min`}
              />
            </View>
          }
        />

        {/* card 6 - Total Water Used */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={valveLastUpdated} />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Total Water Used (Ltr)" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text style={$righttext} size="xxl" weight="bold" text={`${totalWaterUsed}`} />
            </View>
          }
        />

        {/* card 7 - Valve Position */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={valveLastUpdated} />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Valve Position" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={`${valvePosNumber}`} />
              <Text style={$righttext} size="xxl" weight="bold" text={`${valvePosition}`} />
            </View>
          }
        />

        {/* card 2  - water requirement */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={gcpLastUpdated} />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Water Requirement" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text style={$righttext} size="xxl" weight="bold" text={`${tomPrediction} L`} />
            </View>
          }
        />

        {/* card 3 - Temperature */}
        <Card
          onPress={getEnvironment}
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text
                style={$metadataText}
                size="xxs"
                weight="semiBold"
                text={openWeatherLastUpdated}
              />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Temperature" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text style={$righttext} size="xxl" weight="bold" text={`${temperature} °C`} />
            </View>
          }
        />

        {/* card 8 - Rainfall */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text
                style={$metadataText}
                size="xxs"
                weight="semiBold"
                text={openWeatherLastUpdated}
              />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Rainfall" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text style={$righttext} size="xxl" weight="bold" text={`0 %`} />
            </View>
          }
        />

        {/* card 4 - Humidity */}
        <Card
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text
                style={$metadataText}
                size="xxs"
                weight="semiBold"
                text={openWeatherLastUpdated}
              />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Humidity" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text style={$righttext} size="xxl" weight="bold" text={`${humidity}`} />
            </View>
          }
        />
      </Screen>
    </>
  )
}

// my css again
const $mycard: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  height: 120,
  // justifyContent: "space-between",
  // padding: 15,
  backgroundColor: "white",
  borderRadius: 10,
  marginVertical: 8,

  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.3,
  shadowRadius: 12.81,
  elevation: 16,
}

const $myleft: ViewStyle = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "space-between",
  // backgroundColor: "pink",
}

const $myright: ViewStyle = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "space-between",
  // backgroundColor: "violet",
}

const $lefttop: TextStyle = {
  flex: 1,
  // backgroundColor: "yellow",
  // textAlign: "center",
  flexWrap: "wrap",
  marginVertical: 10,
  marginHorizontal: 15,
  color: colors.textDim,
}

const $leftbottom: TextStyle = {
  flex: 5,
  // backgroundColor: "indigo",
  // textAlign: "center",
  justifyContent: "center",
  alignItems: "flex-end",
  flexWrap: "wrap",
  paddingLeft: 15,
  // paddingVertical: "auto",
}

const $righttop: ViewStyle = {
  flex: 1,
  // backgroundColor: "yellow",
  // textAlign: "center",
  flexWrap: "wrap",
  marginVertical: 10,
  marginHorizontal: 15,
}

const $rightbottom: ViewStyle = {
  display: "flex",
  flex: 5,
  // backgroundColor: "purple",
  // textAlign: "center",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  paddingLeft: 15,
  paddingVertical: "auto",
}

const $righttext: TextStyle = {
  // color: colors.textDim,
}
// end of my css

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

// my css
const $cardright: ViewStyle = {
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
}

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
  // padding: spacing.medium,
  marginTop: spacing.medium,
  minHeight: 100,
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
  marginTop: spacing.micro,
  flexDirection: "row",
  flex: 1,
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

export default InfoPage
