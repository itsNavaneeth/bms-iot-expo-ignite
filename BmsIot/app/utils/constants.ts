import axios, { AxiosRequestConfig } from "axios"

let wateringStatus: any
let moistureLastUpdated: any
let moistureLevelMV: any
let moistureLevel: any
let percent: any
let data: any

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
        })
        .catch(function (error) {
            console.error(error)
        })

    return { moistureLastUpdated, moistureLevelMV, moistureLevel, percent, data }
}