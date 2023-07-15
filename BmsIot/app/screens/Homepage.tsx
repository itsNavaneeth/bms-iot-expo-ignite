import React, { useEffect, useRef, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { VictoryAnimation, VictoryLabel, VictoryPie } from "victory-native"
import { Button, Card, Screen, Text } from "../components"
import { colors, spacing } from "../theme"
import Svg from "react-native-svg"
import { fetchMoisture, turnOff, turnOn } from "../utils/constants"

export const HomePage: React.FC = () => {
  //   usestate
  const [percent, setPercent] = useState(25)
  const [data, setData] = useState([
    { x: 1, y: 25 },
    { x: 2, y: 75 },
  ])
  const [moistureLevel, setMoistureLevel] = useState(0.0)
  const [moistureLevelMV, setMoistureLevelMV] = useState(0.0)
  const [moistureLastUpdated, setMoistureLastUpdated] = useState("")

  // on off usestates
  const [wateringStatus, setWateringStatus] = useState("OFF")

  // current time
  const [dt, setDt] = useState(new Date().toLocaleString())

  // * all handler functions
  const handleTurnOn = async () => {
    try {
      const { wateringStatus } = await turnOn()
      setWateringStatus(wateringStatus)
    } catch (error) {
      console.error(error)
    }
  }

  const handleTurnOff = async () => {
    try {
      const { wateringStatus } = await turnOff()
      setWateringStatus(wateringStatus)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFetchMoisture = async () => {
    try {
      const { moistureLastUpdated, moistureLevelMV, moistureLevel, percent, data } =
        await fetchMoisture()
      setMoistureLastUpdated(moistureLastUpdated)
      setMoistureLevelMV(moistureLevelMV)
      setMoistureLevel(moistureLevel)
      setPercent(percent)
      setData(data)
    } catch (error) {
      console.error(error)
    }
  }

  // * use effect 2 sec
  useEffect(() => {
    const setStateInterval = setInterval(() => {
      handleFetchMoisture()
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

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <View
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <View style={$title}>
          <Text preset="heading" text="Welcome back!" />
          <Text preset="subheading" text="Here are some current stats" />
        </View>
        {/* current date and time */}
        <Text
          style={$metadataText}
          size="xs"
          weight="semiBold"
          text={`Current Date and Time : ${dt}`}
        />

        {/* graph */}

        <Svg
          viewBox="0 0 400 400"
          width="100%"
          height="30%"
          style={{
            backgroundColor: colors.palette.accent200,
            borderRadius: 20,
          }}
        >
          <VictoryPie
            standalone={false}
            animate={{ duration: 1000 }}
            width={400}
            height={400}
            data={data}
            innerRadius={120}
            cornerRadius={50}
            labels={() => null}
            style={{
              data: {
                fill: ({ datum }) => {
                  let color = "green"
                  if (datum.y < 20) {
                    color = colors.palette.angry200
                  } else {
                    color = colors.palette.secondary400
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
              backgroundColor: colors.palette.accent200,
              marginVertical: spacing.large,
              padding: "5%",
              borderRadius: 10,
            }}
          >
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "4%",
              }}
            >
              <Text preset="formLabel" text="Valve Control" />
              <Text preset="formHelper" text={`Watering system is now ${wateringStatus}`} />
            </View>

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
                  backgroundColor: colors.palette.secondary400,
                }}
                onPress={handleTurnOn}
              >
                On
              </Button>
              <Button
                style={{
                  flex: 1,
                  marginLeft: spacing.small,
                  backgroundColor: colors.palette.angry200,
                }}
                onPress={handleTurnOff}
              >
                Off
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  )
}

const $metadataText: TextStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginEnd: spacing.medium,
  marginBottom: spacing.extraSmall,
}

const $item: ViewStyle = {
  width: "100%",
  minHeight: 100,
  marginTop: "3%",
  borderColor: colors.palette.accent200,
  backgroundColor: colors.palette.accent200,
}

const $screenContainer: ViewStyle = {
  height: "100%",
  paddingTop: "10%",
  paddingHorizontal: spacing.large,
  backgroundColor: colors.palette.accent400,
}

const $title: TextStyle = {
  marginBottom: spacing.huge,
}
