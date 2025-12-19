import {  StyleConfig } from "@chakra-ui/theme-tools";
export const tooltipStyles: { components: { Tooltip: StyleConfig } } = {
  components: {
    Tooltip: {
      baseStyle: {
        padding: "16px",
        color: "#2a2a2a",
        border: "1px solid #e3e3e3",
        borderRadius: "8px",
        backgroundColor: "#f4f4f4",
        boxShadow: "none",
      },
    },
  },
};
