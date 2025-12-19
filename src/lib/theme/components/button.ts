import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
export const buttonStyles = {
  components: {
    Button: {
      baseStyle: {
        py: "10px",
        px: "16px",
        height: "40px",
        fontSize: "14px",
        fontWeight: "700",
        lineHeight: "19px",
        borderRadius: "8px",
        transition: ".25s all ease",
        boxSizing: "border-box",
        _focus: {
          boxShadow: "none",
        },
        _active: {
          boxShadow: "none",
        },
      },
      variants: {
        primary: (_props: StyleFunctionProps) => ({
          fontSize: "14px",
          bg: "primary.400",
          color: "white",
          _focus: {
            bg: "primary.500",
          },
          _active: {
            bg: "primary.500",
          },
          _hover: {
            bg: "primary.500",
          },
        }),
        secondary: (_props: StyleFunctionProps) => ({
          height: "40px",
          fontSize: "14px",
          bg: "primary.200",
          color: "primary.400",
          _focus: {
            bg: "primaryHover.200",
          },
          _active: {
            bg: "primaryHover.200",
          },
          _hover: {
            bg: "primaryHover.200",
          },
        }),
        grey: (_props: StyleFunctionProps) => ({
          fontSize: "14px",
          bg: "primary.200",
          color: "primary.400",
          _focus: {
            bg: "gray.400",
          },
          _active: {
            bg: "gray.400",
          },
          _hover: {
            bg: "gray.400",
          },
        }),
        smallGreySquare: (_props: StyleFunctionProps) => ({
          py: "2px",
          px: "4px",
          height: "20px",
          fontSize: "12px",
          fontWeight: "700",
          color: "black.500",
          backgroundColor: "black.100",
          borderRadius: "4px",

        }),
        outline: () => ({
          fontSize: "14px",
          borderRadius: "8px",
        }),
        text: () => ({
          height: "unset",
          minHeight: "unset",
          width: "unset",
          minWidth: "unset",
          backgroundColor: "transparent",
        }),
        danger: (props: StyleFunctionProps) => ({
          py: "10px",
          px: "16px",
          height: "40px",
          minWidth: "unset",
          fontSize: "14px",
          fontWeight: "700",
          lineHeight: "19px",
          bg: mode("red.500", "red.500")(props),
          color: "white",

          _focus: {
            bg: mode("redHover.500", "redHover.400")(props),
          },
          _active: {
            bg: mode("redHover.500", "redHover.400")(props),
          },
          _hover: {
            bg: mode("redHover.500", "redHover.400")(props),
          },
        }),
        brand: (_props: StyleFunctionProps) => ({
          fontSize: "14px",
          bg: "primary.400",
          color: "white",
          _focus: {
            bg: "primary.500",
          },
          _active: {
            bg: "primary.500",
          },
          _hover: {
            bg: "primary.500",
          },
        }),

      },
    },
  },
};
