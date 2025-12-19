import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
export const globalStyles = {
  colors: {
    brand: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#7551FF",
      500: "#3b68d8",
      600: "#2147ae",
      700: "#02044A",
      800: "#190793",
      900: "#11047A",
    },
    brandScheme: {
      100: "#E9E3FF",
      200: "#7551FF",
      300: "#7551FF",
      400: "#7551FF",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#02044A",
    },
    brandTabs: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#422AFB",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#02044A",
    },
    primary: {
      100: "#f3f8ff",
      200: "#ecf4ff",
      210: "#dee7f5",
      400: "#3B68DB",
      500: "#2147ae",
    },
    primaryHover: {
      200: "#dee7f5",
    },
    secondary: {
      400: "#1d2d53",
    },
    black: {
      100: "#f4f4f4",
      400: "#2a2a2a",
      500: "#888888",
    },
    secondaryGray: {
      100: "#bebebe",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
    red: {
      100: "#FEEFEE",
      400: "#dc1728",
      500: "#ed1a2c",
      600: "#E31A1A",
    },
    redHover: {
      400: "#ed1a2c",
      500: "#ed1a2c",
    },
    blue: {
      50: "#EFF4FB",
      500: "#3965FF",
    },
    purple: {
      400: "#8854D0"
    },
    orange: {
      100: "#FFF6DA",
      400: "#FA8231",
      500: "#FFB547",
    },
    green: {
      100: "#E6FAF5",
      500: "#01B574",
    },
    navy: {
      50: "#d0dcfb",
      100: "#aac0fe",
      200: "#a3b9f8",
      300: "#728fea",
      400: "#3652ba",
      500: "#1b3bbb",
      600: "#24388a",
      700: "#1B254B",
      800: "#111c44",
      900: "#0b1437",
    },
    gray: {
      100: "#FAFCFE",
      200: "#e3e3e3",
      400: "#f7f7f7",
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        overflowX: "hidden",
        bg: mode("secondaryGray.300", "navy.900")(props),
        fontFamily: "Manrope",
        letterSpacing: "-0.5px",
      },
      input: {
        color: "gray.700",
      },
      html: {
        fontFamily: "Manrope",
      },
      th: {
        color: "black.500",
      }
    }),
  },
};
