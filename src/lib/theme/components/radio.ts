export const radioStyles = {
components: {
    Radio: {
        baseStyle: {
            // Had to do it this way because label will not change fontSize
            control: {
                height: "16px",
                width: "16px",
                minHeight: "16px",
                minWidth: "16px",
            },
            label: {
                // Does not accept "fontSize" argument
            }
        },
        defaultProps: {
            size: "sm",
        }, 
    },
  },
};