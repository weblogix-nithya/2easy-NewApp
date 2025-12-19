import {
  StyleConfig,
  // mode,
  // StyleFunctionProps
} from "@chakra-ui/theme-tools";
export const selectStyles: { components: { Select: StyleConfig } } = {
  components: {
    Select: {
      baseStyle: {
        field: {
          borderRadius: "7px",
          background: "white",
          border: "1px dashed",
          borderColor: "gray.200",
        }
      },
    },
  },
};
