
import {  StyleConfig } from "@chakra-ui/theme-tools";
export const accordionStyles: { components: { Accordion: StyleConfig } } = {
  components: {
    Accordion: {
      variants: {
        jobs: () => ({
          root: {
            borderColor: "transparent"
          },
          button: {
            bg: "transparent",
            _hover: {
                bg: "transparent",
            },
          },
          icon: {
            marginBottom: "5px",
          }
        }),
        jobAddress: () => ({
          root: {
            borderColor: "transparent",
            paddingTop: "0px",
            paddingBottom: "0px",
          },
          button: {
            marginBottom: "0px",
            paddingTop: "0px",
            paddingBottom: "0px",
            bg: "transparent",
            _hover: {
                bg: "transparent",
            },
          },
          icon: {
            marginBottom: "0px",
          }
        }),
        jobDetails: () => ({
          root: {
            borderColor: "transparent",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
          },
          button: {
            color: "#ed1a2c",
            _hover: {
                bg: "tranparent",
            },
          },
          panel: {
            paddingTop: '0px',
          },
          icon: {
            marginBottom: "5px",
          }
        }),

        instructions: () => ({
        root: {
            borderColor: "transparent"
          },
          container: {

          },
          button: {
            paddingTop: "4px",
            paddingBottom: "4px",
            paddingLeft: "0px",
            fontSize: "12px",
            color: "black.500",
            bg: "transparent",
            _hover: {
                bg: "transparent",
            },
          },
          icon: {
            marginBottom: "0px",
            fontSize: "18px",
          }
        }),

      },
    },
  },
};
