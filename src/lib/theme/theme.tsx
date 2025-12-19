import { type ThemeConfig,extendTheme, HTMLChakraProps, ThemingProps } from "@chakra-ui/react";

import { CardComponent } from "./additions/card/card";
import { accordionStyles } from "./components/accordion";
import { avatarStyles } from "./components/avatar";
import { badgeStyles } from "./components/badge";
import { buttonStyles } from "./components/button";
import { dividerStyles } from "./components/divider";
import { inputStyles } from "./components/input";
import { linkStyles } from "./components/link";
import { menuStyles } from "./components/menulist";
import { modalStyles } from "./components/modal";
import { progressStyles } from "./components/progress";
import { radioStyles } from "./components/radio";
import { selectStyles } from "./components/select";
import { sliderStyles } from "./components/slider";
import { switchStyles } from "./components/switch";
import { textareaStyles } from "./components/textarea";
import { tooltipStyles } from "./components/tooltip";
import { globalStyles } from "./styles";


const config: ThemeConfig = {
  initialColorMode: "light", // system, light, dark
  useSystemColorMode: false,
};

const theme = extendTheme(
  config,
  globalStyles,
  accordionStyles,
  avatarStyles, // avatar styles
  badgeStyles, // badge styles
  buttonStyles, // button styles
  CardComponent, // card component
  dividerStyles, // divider styles
  radioStyles, // radio styles
  inputStyles, // input styles
  linkStyles, // link styles
  modalStyles, // Modal styles
  progressStyles, // progress styles
  selectStyles, // select styles (Does not work with chakra-react-select)
  sliderStyles, // slider styles
  switchStyles, // switch styles
  textareaStyles, // textarea styles
  tooltipStyles,
  menuStyles,
);

export default theme;

export interface CustomCardProps extends HTMLChakraProps<"div">, ThemingProps {}



// // theme.ts
// import {
//   extendTheme,
//   type ThemingConfig,
//   type HTMLChakraProps,
//   type ThemingProps,
// } from "@chakra-ui/react";

// // Component style imports
// import { CardComponent } from "./additions/card/card";
// import { accordionStyles } from "./components/accordion";
// import { avatarStyles } from "./components/avatar";
// import { badgeStyles } from "./components/badge";
// import { buttonStyles } from "./components/button";
// import { dividerStyles } from "./components/divider";
// import { inputStyles } from "./components/input";
// import { linkStyles } from "./components/link";
// import { menuStyles } from "./components/menulist";
// import { modalStyles } from "./components/modal";
// import { progressStyles } from "./components/progress";
// import { radioStyles } from "./components/radio";
// import { selectStyles } from "./components/select";
// import { sliderStyles } from "./components/slider";
// import { switchStyles } from "./components/switch";
// import { textareaStyles } from "./components/textarea";
// import { tooltipStyles } from "./components/tooltip";
// import { globalStyles } from "./styles";

// // ------------------------------------------------------
// // 1️⃣ Chakra v3 Theme Config
// // ------------------------------------------------------

// const config: ThemingConfig = {
//   initialColorMode: "light",
//   useSystemColorMode: false,
// };

// // ------------------------------------------------------
// // 2️⃣ Chakra v3 Theme (correct extendTheme syntax)
// // ------------------------------------------------------

// const theme = extendTheme({
//   config,

//   // Global styles must be nested under "styles"
//   styles: globalStyles,

//   // Component styles must be inside "components"
//   components: {
//     Accordion: accordionStyles,
//     Avatar: avatarStyles,
//     Badge: badgeStyles,
//     Button: buttonStyles,
//     Card: CardComponent,
//     Divider: dividerStyles,
//     Radio: radioStyles,
//     Input: inputStyles,
//     Link: linkStyles,
//     Modal: modalStyles,
//     Progress: progressStyles,
//     Select: selectStyles,
//     Slider: sliderStyles,
//     Switch: switchStyles,
//     Textarea: textareaStyles,
//     Tooltip: tooltipStyles,
//     Menu: menuStyles,
//   },
// });

// export default theme;

// // ------------------------------------------------------
// // 3️⃣ Custom Props (this is okay)
// // ------------------------------------------------------
// export interface CustomCardProps
//   extends HTMLChakraProps<"div">,
//     ThemingProps {}


// theme.ts (Chakra UI v3)

// import { extendTheme, type HTMLChakraProps, type ThemingProps } from "@chakra-ui/react";

// // Import component style configs (all should export an object)
// import { CardComponent } from "./additions/card/card";
// import { accordionStyles } from "./components/accordion";
// import { avatarStyles } from "./components/avatar";
// import { badgeStyles } from "./components/badge";
// import { buttonStyles } from "./components/button";
// import { dividerStyles } from "./components/divider";
// import { inputStyles } from "./components/input";
// import { linkStyles } from "./components/link";
// import { menuStyles } from "./components/menulist";
// import { modalStyles } from "./components/modal";
// import { progressStyles } from "./components/progress";
// import { radioStyles } from "./components/radio";
// import { selectStyles } from "./components/select";
// import { sliderStyles } from "./components/slider";
// import { switchStyles } from "./components/switch";
// import { textareaStyles } from "./components/textarea";
// import { tooltipStyles } from "./components/tooltip";
// import { globalStyles } from "./styles";

// // --------------------------------------------
// // CHAKRA UI v3 THEME CONFIG
// // --------------------------------------------

// const theme = extendTheme({
//   // ✔ color mode config now lives here (NOT ThemeConfig)
//   colorMode: {
//     initialColorMode: "light",
//     useSystemColorMode: false,
//   },

//   // ✔ GLOBAL STYLES (must be inside "styles")
//   styles: {
//     global: globalStyles.global,
//   },

//   // ✔ COMPONENTS (must be inside "components")
//   components: {
//     Accordion: accordionStyles,
//     Avatar: avatarStyles,
//     Badge: badgeStyles,
//     Button: buttonStyles,
//     Card: CardComponent,
//     Divider: dividerStyles,
//     Radio: radioStyles,
//     Input: inputStyles,
//     Link: linkStyles,
//     Modal: modalStyles,
//     Progress: progressStyles,
//     Select: selectStyles,
//     Slider: sliderStyles,
//     Switch: switchStyles,
//     Textarea: textareaStyles,
//     Tooltip: tooltipStyles,
//     Menu: menuStyles,
//   },
// });

// export default theme;

// // ✔ Your custom props interface still works
// export interface CustomCardProps
//   extends HTMLChakraProps<"div">,
//     ThemingProps {}
