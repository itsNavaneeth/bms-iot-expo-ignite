const palette = {
  // original background colour
  // neutral100: "#FFFFFF",
  // neutral200: "#F4F2F1",
  // neutral300: "#D7CEC9",
  // neutral400: "#B6ACA6",
  // neutral500: "#978F8A",
  // neutral600: "#564E4A",
  // neutral700: "#3C3836",
  // neutral800: "#191015",
  // neutral900: "#000000",

  //background -> 
    neutral100: "#fffefe",
    neutral200: "#fffdfd",
    neutral300: "#fefbfc",
    neutral400: "#fefafb",
    neutral500: "#fef9fa",
    neutral600: "#cbc7c8",
    neutral700: "#989596",
    neutral800: "#666464",
    neutral900: "#333232",

  // nava bg




  // original primary
  // primary100: "#F4E0D9",
  // primary200: "#E8C1B4",
  // primary300: "#DDA28E",
  // primary400: "#D28468",
  // primary500: "#C76542",
  // primary600: "#A54F31",

  //primary -> dark green
    // primary100: "#d0dad7",
    // primary200: "#a2b5af",
    // primary300: "#739188",
    // primary400: "#456c60",
    // primary500: "#164738",
    // primary600: "#12392d",
    // primary700: "#0d2b22",
    // primary800: "#091c16",
    // primary900: "#040e0b",

  // nava primary
    primary100: "#ace3f7",
    primary200: "#73d0f3",
    primary300: "#2cbeee",
    primary400: "#00b0ed",
    primary500: "#00a2ea",
    primary600: "#0094dc",
    primary700: "#0082c9",
    primary800: "#0071b6",
    primary900: "#005295",



  //original secondary format
  // secondary100: "#DCDDE9",
  // secondary200: "#BCC0D6",
  // secondary300: "#9196B9",
  // secondary400: "#626894",
  // secondary500: "#41476E",

  //secondary colours -> light green
  // secondary100: "#e6f1db",
  // secondary200: "#cde2b8",
  // secondary300: "#b3d494",
  // secondary400: "#9ac571",
  // secondary500: "#81b74d",
  // secondary600: "#67923e",
  // secondary700: "#4d6e2e",
  // secondary800: "#34491f",
  // secondary900: "#1a250f",

  // nava secondary
    secondary100: "#b7f8cc",
    secondary200: "#7ff3aa",
    secondary300: "#00ee83",
    secondary400: "#00e762",
    secondary500: "#00de49",
    secondary600: "#00cd3e",
    secondary700: "#00b930",
    secondary800: "#00a723",
    secondary900: "#008608",


    
  //accent
  // accent100: "#FFEED4",
  // accent200: "#FFE1B2",
  // accent300: "#FDD495",
  // accent400: "#FBC878",
  // accent500: "#FFBB50",

  //accent colour -> teal
  accent100: "#d8ebea",
  accent200: "#b1d6d5",
  accent300: "#89c2c1",
  accent400: "#62adac",
  accent500: "#3b9997",
  accent600: "#2f7a79",
  accent700: "#235c5b",
  accent800: "#183d3c",
  accent900: "#0c1f1e",

  angry100: "#f2d2d6",
  angry500:"#c02034",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const


export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   *
   */
  errorBackground: palette.angry100,
}
