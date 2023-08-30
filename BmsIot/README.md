# Welcome to the BMS IoT App!

## Quick Start

The Ignite boilerplate project's structure will look similar to this:

```
ignite-project
├── app
│   ├── components
│   ├── config
│   ├── i18n
│   ├── models
│   ├── navigators
│   ├── screens
│   ├── services
│   ├── theme
│   ├── utils
│   ├── app.tsx
├── test
│   ├── __snapshots__
│   ├── mockFile.ts
│   ├── setup.ts
├── README.md
├── android
│   ├── app
│   ├── build.gradle
│   ├── gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── keystores
│   └── settings.gradle
├── ignite
│   └── templates
|       |── app-icon
│       ├── component
│       ├── model
│       ├── navigator
│       └── screen
├── index.js
├── ios
│   ├── IgniteProject
│   ├── IgniteProject-tvOS
│   ├── IgniteProject-tvOSTests
│   ├── IgniteProject.xcodeproj
│   └── IgniteProjectTests
├── .env
└── package.json

```

### ./app directory

Included in an Ignite boilerplate project is the `app` directory. This is a directory you would normally have to create when using vanilla React Native.

The inside of the `app` directory looks similar to the following:

```
app
├── components
├── config
├── i18n
├── models
├── navigators
├── screens
├── services
├── theme
├── utils
├── app.tsx
```

**components**
This is where your reusable components live which help you build your screens.

**i18n**
This is where your translations will live if you are using `react-native-i18n`.

**models**
This is where your app's models will live. Each model has a directory which will contain the `mobx-state-tree` model file, test file, and any other supporting files like actions, types, etc.

**navigators**
This is where your `react-navigation` navigators will live.

**screens**
This is where your screen components will live. A screen is a React component which will take up the entire screen and be part of the navigation hierarchy. Each screen will have a directory containing the `.tsx` file, along with any assets or other helper files.

**services**
Any services that interface with the outside world will live here (think REST APIs, Push Notifications, etc.).

**theme**
Here lives the theme for your application, including spacing, colors, and typography.

**utils**
This is a great place to put miscellaneous helpers and utilities. Things like date helpers, formatters, etc. are often found here. However, it should only be used for things that are truly shared across your application. If a helper or utility is only used by a specific component or model, consider co-locating your helper with that component or model.

**app.tsx** This is the entry point to your app. This is where you will find the main App component which renders the rest of the application.

### ./ignite directory

The `ignite` directory stores all things Ignite, including CLI and boilerplate items. Here you will find templates you can customize to help you get started with React Native.

---

## demoNavigator.tsx

This is the Bottom Navbar Component for the application. It has navigation for `Homepage`, `InfoPage`, `WaterPage`, `Graphboard` and `ProfilePage`.
You can modify or add additional pages if needed.
Ensure that the pages are mentioned in the `DemoTabParamList` and other places where required. (Any errors will point out where the pages should be mentioned)

---

## Homepage.tsx

This is the main Landing page for the application. Code is explained within the file
It displays the:

- Current date and time
- Circular graph for the current moisture level of the soil
- A card for the current moisture level of the soil along with the milliVolts from the sensor.
- The timestamp at which the sensor has sent the values.
- On and Off buttons for controlling the solenoid valve (to release water)

---

## Infopage.tsx

This page provides information on the various values received from the sensors. Code is explained within the file
It is divided into three sections:

- ### Hydrological Factors:

  - Current moisture level (% and mV)
  - Total water used (Ltr)
  - Water requirement for today (Ltr)

- ### Valve Status:

  - Current water flow rate (Ltr/min)
  - Valve position (Open or Closed)

- ### Environmental Factors:
  - Temperature (Celsius)
  - Rainfall (Hardcoded value for the time being)
  - Humidity (Number)
- Note: Temperature and Humidity values are from the OpenWeather API. To prevent infinite rendering and causing a large bill amount, you need to touch the icon every single time you want to view the updated temperature and humidity. (P.S. Don't touch the icon more than a couple of times in a day 😅)

---

## Infopage.tsx

This page is used to view the water estimate provided by Google Cloud Platform (GCP) and modify the water estimate (override) if needed.

- Text field to override the water to be released for the current day along with a button to submit that value.
- Total water used today.
- Valve position (Open or Closed)
- Water requirement for the current day provided by GCP or the value provided(overrided) by us from the text field above.

---

## Graphboard.tsx (file is disabled currently since its causing some bugs)

This page is used to view real time graph for the soil moisture data.

- Graph which displays the real time soil moisture values.
- A card which displays the current soil moisture value(% and mV) along with the timestamp at which the value was received.

---

## Profile.tsx

This is the profile page for the user which gives details about the crop.

- Crop Name
- Variety
- Harvest Period
- Soil Type
- Expected Harvest Date
