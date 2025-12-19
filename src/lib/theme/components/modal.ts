import { StyleConfig, } from "@chakra-ui/theme-tools";
export const modalStyles: { components: { Modal: StyleConfig } } = {
  components: {
    Modal: {
      baseStyle: {
        dialog: {
            borderRadius: "8px",
        },
        body: {
            paddingTop: "0",
        },
        footer: {
            paddingBottom: "24px"
        }
      },
    },
  },
};
