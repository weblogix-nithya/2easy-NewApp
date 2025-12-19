import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
export const inputStyles = {
  components: {
    Input: {
      baseStyle: {
        field: {
          fontWeight: 400,
          borderRadius: "8px",
        },
      },
      variants: {
        main: (props: StyleFunctionProps) => ({
          field: {
            bg: mode("transparent", "navy.800")(props),
            border: "1px solid",
            color: mode("black.400", "white")(props),
            borderColor: mode("gray.200", "whiteAlpha.100")(props),
            fontSize: "sm",
            p: "20px",
            _placeholder: { color: "black.500" },
            _focusVisible: {
              borderColor: "primary.400",
            },
          },
        }),
        auth: (props: StyleFunctionProps) => ({
          field: {
            fontWeight: "500",
            color: mode("navy.700", "white")(props),
            bg: mode("transparent", "transparent")(props),
            border: "1px solid",
            borderColor: mode(
              "gray.200",
              "rgba(135, 140, 189, 0.3)"
            )(props),
            _placeholder: { color: "black.500", fontWeight: "500" },
          },
        }),
        authSecondary: () => ({
          field: {
            bg: "transparent",
            border: "1px solid",
            borderColor: "gray.200",
            _placeholder: { color: "black.500", fontWeight: "500" },
          },
        }),
        search: () => ({
          field: {
            border: "none",
            py: "11px",
            _placeholder: { color: "black.500", fontWeight: "500" },
            _focusVisible: {
              borderColor: "primary.400",
            },
          },
        }),
        dateBlue: () => ({
          // Date selector with blue background
          field: {
            color: "#3b68d8",
            fontWeight: "700",
            fontSize: "14px",
            textAlign: "center",
            border: "#ecf4ff",
            bg: "#ecf4ff",
            _placeholder: { color: "black.500", fontWeight: "500" },
          },
          element: {
            display: "none",
            color: "#3b68d8",
          }
        }),
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          fontWeight: 400,
        },
      },

      variants: {
        main: () => ({
          field: {
            bg: "transparent",
            border: "1px solid",

            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
            _focusVisible: {
              borderColor: "primary.400",
            },
          },
        }),
        auth: () => ({
          field: {
            bg: "transparent",
            border: "1px solid",

            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        authSecondary: () => ({
          field: {
            bg: "transparent",
            border: "1px solid",

            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        search: () => ({
          field: {
            border: "none",
            py: "11px",
            borderRadius: "inherit",
            _placeholder: { color: "secondaryGray.600" },
            _focusVisible: {
              borderColor: "primary.400",
            },
          },
        }),
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontWeight: 400,
          color: "#2a2a2a"
        },
      },

      variants: {
        main: (props: StyleFunctionProps) => ({
          field: {
            bg: mode("transparent", "navy.800")(props),
            border: "1px solid",
            color: "secondaryGray.600",
            borderColor: mode("secondaryGray.100", "whiteAlpha.100")(props),
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
          icon: {
            color: "secondaryGray.600",
          },
        }),
        mini: (props: StyleFunctionProps) => ({
          field: {
            bg: mode("transparent", "navy.800")(props),
            border: "0px solid transparent",
            fontSize: "0px",
            p: "10px",
            _placeholder: { color: "secondaryGray.600" },
          },
          icon: {
            color: "secondaryGray.600",
          },
        }),
        subtle: () => ({
          box: {
            width: "unset",
          },
          field: {
            bg: "transparent",
            border: "0px solid",
            color: "secondaryGray.600",
            borderColor: "transparent",
            width: "max-content",
            _placeholder: { color: "secondaryGray.600" },
          },
          icon: {
            color: "secondaryGray.600",
          },
        }),
        transparent: (props: StyleFunctionProps) => ({
          field: {
            bg: "transparent",
            border: "0px solid",
            width: "min-content",
            color: mode("secondaryGray.600", "secondaryGray.600")(props),
            borderColor: "transparent",
            padding: "0px",
            paddingLeft: "8px",
            paddingRight: "20px",
            fontWeight: "700",
            fontSize: "14px",
            _placeholder: { color: "secondaryGray.600" },
          },
          icon: {
            transform: "none !important",
            position: "unset !important",
            width: "unset",
            color: "secondaryGray.600",
            right: "0px",
          },
        }),
        auth: () => ({
          field: {
            bg: "transparent",
            border: "1px solid",

            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        authSecondary: (_props: StyleFunctionProps) => ({
          field: {
            bg: "transparent",
            border: "1px solid",

            borderColor: "secondaryGray.100",
            borderRadius: "16px",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
        search: (_props: StyleFunctionProps) => ({
          field: {
            border: "none",
            py: "11px",
            borderRadius: "inherit",
            _placeholder: { color: "secondaryGray.600" },
          },
        }),
      },
    },
  },
};
