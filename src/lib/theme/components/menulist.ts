import { 
  StyleConfig,
  // mode,
  // StyleFunctionProps
 } from "@chakra-ui/theme-tools";
export const menuStyles: { components: { Menu: StyleConfig } } = {
  components: {
    Menu: {
      baseStyle: {
        list: {
          py: 2,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          bg: "white",
          borderRadius: "8",
          border: "1px solid #e3e3e3"
        },
        item: {
          px: 3,
          _focus: {
            bg: "primary.100",
            // bg: "red",
          },
          _hover: {
            bg: "primary.100",
            // bg: "red",
          },
        }
      },
    },
  },
};
