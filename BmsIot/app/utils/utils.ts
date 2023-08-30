import axios, { AxiosRequestConfig } from "axios"

// fetch moisture
let wateringStatus: any
let moistureLastUpdated: any
let moistureLevelMV: any
let moistureLevel: any
let percent: any
let data: any

// fetch valve info
let valveLastUpdated: any
let valvePositionNumber: any
let valvePosition: any
let totalWaterUsed: any
let realTimeFlowRate: any

// fetch data
let prevFieldValue: any
let fieldValue: any
let gcpLastUpdated: any
let tomPrediction: any

// get environment
let temperature: any
let humidity: any
let openWeatherLastUpdated: any

// todayWaterAPI
let todayWater: any

const optionsUbidotsON: AxiosRequestConfig = {
    method: "POST",
    url: "https://industrial.api.ubidots.com/api/v1.6/variables/6407c7bcf2b635000cf91391/values/",
    headers: {
        "content-type": "application/json",
        "X-Auth-Token": "BBFF-LtAIEbHEpPlRavdXFOC9Nu8SRnTN9y",
    },
    data: { value: 0 },
}

const optionsUbidotsOFF: AxiosRequestConfig = {
    method: "POST",
    url: "https://industrial.api.ubidots.com/api/v1.6/variables/6407c7bcf2b635000cf91391/values/",
    headers: {
        "content-type": "application/json",
        "X-Auth-Token": "BBFF-LtAIEbHEpPlRavdXFOC9Nu8SRnTN9y",
    },
    data: { value: 1 },
}

const optionsMoisture: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.thingspeak.com/channels/1958878/fields/1.json",
    params: { results: "1", api_key: "N2FJP53Q2OIEDX4M" },
}

const optionsValve: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.thingspeak.com/channels/2019443/feeds.json",
    params: { results: "1", api_key: "WN5QXB4RPALKRT0I" },
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



// helper function for double digit date parsing
export const formatDoubleDigit = (value: number) => {
    return value < 10 ? `0${value}` : value.toString()
}

export const getData = (percent: number) => {
    return [
        { x: 1, y: percent },
        { x: 2, y: 100 - percent },
    ]
}

// function to convert mV to percentage
export const convertMVtoPercentage = (mV: number): number => {
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
export const convertUTCToIST = (utcDate: string): string => {
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

export const turnOn = async () => {
    axios
        .request(optionsUbidotsON)
        .then(function (response) {
            wateringStatus = "ON"
        })
        .catch(function (error) {
            console.error(error)
        })

    return { wateringStatus }
}

// axios ubidots OFF
export const turnOff = async () => {
    axios
        .request(optionsUbidotsOFF)
        .then(function (response) {
            wateringStatus = "OFF"
        })
        .catch(function (error) {
            console.error(error)
        })

    return { wateringStatus }
}

export const fetchMoisture = async () => {
    axios
        .request(optionsMoisture)
        .then(function (response) {
            moistureLastUpdated = convertUTCToIST(response.data.feeds[0].created_at)
            moistureLevelMV = response.data.feeds[0].field1
            moistureLevel = convertMVtoPercentage(response.data.feeds[0].field1)
            percent = convertMVtoPercentage(response.data.feeds[0].field1)
            data = getData(convertMVtoPercentage(response.data.feeds[0].field1))
            // console.log(data)
        })
        .catch(function (error) {
            console.error(error)
        })

    return { moistureLastUpdated, moistureLevelMV, moistureLevel, percent, data }
}

// axios for real time flow rate, total water used, valve position
export const fetchValveInfo = async () => {
    axios
        .request(optionsValve)
        .then(function (response) {
            let water = response.data.feeds[0].field2
            let new_water = Number(water).toFixed(2)

            let valve_pos = response.data.feeds[0].field1
            let new_valve_pos
            new_valve_pos = valve_pos == 1 ? "Closed" : "Open"

            valveLastUpdated = convertUTCToIST(response.data.feeds[0].created_at)
            valvePositionNumber = valve_pos
            valvePosition = new_valve_pos
            totalWaterUsed = Number(new_water)
            realTimeFlowRate = response.data.feeds[0].field3
        })
        .catch(function (error) {
            console.error(error)
        })

    return { valveLastUpdated, valvePositionNumber, valvePosition, totalWaterUsed, realTimeFlowRate }
}

// axios for next water requirement
export const fetchWaterData = async () => {
    const response = await fetch("https://api.thingspeak.com/channels/1978647/feeds.json?results=1")
    const data = await response.json()
    prevFieldValue = Number(data.feeds[0].field4).toFixed(2)
    fieldValue = Number(data.feeds[0].field3).toFixed(2)
    gcpLastUpdated = convertUTCToIST(data.feeds[0].created_at)

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
    tomPrediction = Number(ltr.toFixed(2))

    return { prevFieldValue, fieldValue, gcpLastUpdated, tomPrediction }
}

// axios for temperature, humidity and rainfall (on button click)
export const getEnvironment = async () => {
    axios
        .request(optionsOpenWeather)
        .then(function (response) {
            console.table(response.data)

            //Temperature
            let temp: any = response.data.main.temp - 273.15
            temp = temp.toFixed(2)
            temperature(temp)

            //Humidity
            let humid = response.data.main.humidity
            humidity(humid)

            // time last updated
            let onclickTime = new Date()
            const year = onclickTime.getFullYear()
            const month = formatDoubleDigit(onclickTime.getMonth() + 1) // Add 1 to account for zero-based indexing
            const day = formatDoubleDigit(onclickTime.getDate())
            const hours = formatDoubleDigit(onclickTime.getHours())
            const minutes = formatDoubleDigit(onclickTime.getMinutes())
            const seconds = formatDoubleDigit(onclickTime.getSeconds())

            const onclickIstTime = `${hours}:${minutes}:${seconds} | ${day}/${month}/${year}`
            openWeatherLastUpdated(onclickIstTime)

            // //Rainfall
            // let rainz = response.data.main;
            // humid = humid.toFixed(2);
            // setHumidity(humid);
        })
        .catch(function (error) {
            console.error(error)
        })

    return { temperature, humidity, openWeatherLastUpdated }
}