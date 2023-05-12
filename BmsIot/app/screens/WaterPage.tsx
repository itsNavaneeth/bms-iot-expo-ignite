import React from "react"
import axios, { AxiosRequestConfig } from "axios"
import { useState, useEffect } from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "../components"
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

const WaterPage: React.FC = () => {
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
  const [prevFieldValue, setPrevFieldValue] = useState(null)
  const [gcpLastUpdated, setGCPLastUpdated] = useState("")
  const [field5, setField5] = useState(0)

  // current time
  const [dt, setDt] = useState(new Date().toLocaleString())

  //   today's and tomorrow's date
  const [today, setToday] = useState("2023-04-17")
  const [tmrw, setTmrw] = useState("2023-04-18")

  //   today's water consumtion
  const [todayWater, setTodayWater] = useState(0)
  const [thingspeakNumber, setThingspeakNumber] = useState("1")

  // * all axios statements

  //   axios config

  const optionsTSwrite: AxiosRequestConfig = {
    method: "POST",
    url: "https://api.thingspeak.com/update.json",
    params: {
      api_key: "ZHOH25HNVZC2KLJM",
      field5: thingspeakNumber,
    },
  }

  const optionsWater: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.thingspeak.com/channels/2028983/fields/2.json",
    params: {
      start: { today },
      end: { tmrw },
      api_key: "E0TVAT7SEAK0ALI9",
      timezone: "Asia%2FKolkata",
    },
  }

  //   axios for updating thingspeak value
  const updateGCP = async () => {
    axios
      .request(optionsTSwrite)
      .then(function (response) {
        console.log(response)
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  //   axios for getting today's water json
  const todayWaterAPI = async () => {
    axios
      .request(optionsWater)
      .then(function (response) {
        let total = 0
        const feeds = response.data.feeds
        // console.log(feeds[0].created_at)
        for (let i = 1; i < feeds.length; i++) {
          if (feeds[i].field2 > feeds[i - 1].field2) {
            total += feeds[i].field2 - feeds[i - 1].field2
          }
        }
        let new_total = total.toFixed(2)
        // console.log(new_total)
        setTodayWater(Number(new_total))
      })
      .catch(function (error) {
        console.error(error)
      })
  }

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
    const response = await fetch("https://api.thingspeak.com/channels/1978647/feeds.json?results=1")
    const data = await response.json()
    setPrevFieldValue(Number(data.feeds[0].field4).toFixed(2))
    setFieldValue(Number(data.feeds[0].field3).toFixed(2))
    setGCPLastUpdated(convertUTCToIST(data.feeds[0].created_at))
    setField5(Number(data.feeds[0].field5))

    // let temp = (fieldValue * 100) / 0.72
    // let percentage = 0.0
    // let empty = 0
    // let full = 100
    // let min_moisture = 800
    // let max_moisture = 2800

    // percentage =
    //   full - ((full - empty) * (temp - min_moisture)) / (max_moisture - min_moisture) + empty

    // let duration = (70 - percentage) * 3
    // if (duration < 0) {
    //   duration = 0
    // }
    // duration = Number(duration.toFixed(0))
    // let ltr = (duration * 20) / 7.5
    // ltr = Number(ltr.toFixed(2))

    let ltr = (17 - data.feeds[0].field3) * 200
    setTomPrediction(Number(ltr.toFixed(2)))
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

  // use effect on page refresh
  useEffect(() => {
    let today = new Date()
    let tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let todayYear = today.getFullYear()
    let todayMonth = ("0" + (today.getMonth() + 1)).slice(-2)
    let todayDay = ("0" + today.getDate()).slice(-2)
    let todayFormatted = todayYear + "-" + todayMonth + "-" + todayDay

    let tmrwYear = tomorrow.getFullYear()
    let tmrwMonth = ("0" + (tomorrow.getMonth() + 1)).slice(-2)
    let tmrwDay = ("0" + tomorrow.getDate()).slice(-2)
    let tmrwFormatted = tmrwYear + "-" + tmrwMonth + "-" + tmrwDay

    console.log("Today: " + todayFormatted) // Output: "Today: 2023-04-19"
    console.log("Tomorrow: " + tmrwFormatted) // Output: "Tomorrow: 2023-04-20"

    setToday(todayFormatted)
    setTmrw(tmrwFormatted)

    // today's water used
    // todayWaterAPI()
  }, [])

  // * all functions
  // function to convert mV to percentage
  const convertMVtoPercentage = (mV: number): number => {
    let in_min = 4000
    let in_max = 2000
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
        
      <View style={$title}>
          <Text preset="heading" text="Water Center" />
          <Text preset="subheading" text="Control your water estimates" />
        </View>
        {/* buttons UI */}
        <View style={$bgm}>
        
        <Text

          size="lg"
          weight="bold"
          text="Update Water Needed"
          style={$whiteText}
        />
        <TextField
          style={{}}
          placeholder="useless placeholder"
          keyboardType="numeric"
          onChangeText={setThingspeakNumber}
          value={thingspeakNumber}
        />
        <Button
          style={{
            flex: 1,
            backgroundColor: colors.palette.secondary600,
            borderColor:colors.palette.secondary600,
            marginBottom: spacing.large,
            marginTop: spacing.medium,
          }}
          onPress={updateGCP}
        >
          Update Thingspeak Field 5
        </Button>
        </View>

        <View style={$bgm}>
        {/* card 6 - Water Used Today */}
        <Card
          onPress={todayWaterAPI}
          style={$item}
          verticalAlignment="space-between"
          HeadingComponent={
            <>
              <Text style={$metadataText} size="xxs" weight="semiBold" text={valveLastUpdated} />
            </>
          }
          ContentComponent={<Text size="lg" weight="bold" text="Water Used Today (Ltr)" />}
          RightComponent={
            <View style={{ flex: 1, justifyContent: "space-between", alignItems: "flex-end" }}>
              <Text style={$metadataText} size="xxs" weight="semiBold" />
              <Text style={$righttext} size="xl" weight="bold" text={`${todayWater}`} />
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
              <Text style={$righttext} size="xl" weight="bold" text={`${valvePosition}`} />
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
              <Text style={$righttext} size="xl" weight="bold" text={`${field5} L`} />
            </View>
          }
        />
        </View>
      </Screen>
    </>
  )
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



const $container: ViewStyle = {
  height:"100%",
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.large,
  backgroundColor:colors.palette.accent200
}


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


export default WaterPage
