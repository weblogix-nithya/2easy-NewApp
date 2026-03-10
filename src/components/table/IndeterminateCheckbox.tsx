import React, { HTMLProps, useEffect, useRef } from "react";
//import { CHECKBOX_STATES } from "./enums";

const IndeterminateCheckbox = ({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) => {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = indeterminate && !rest.checked;
    }
  }, [indeterminate, rest.checked]); // Depend on both `indeterminate` and `checked`

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      id={`checkbox-${rest.value}`} // Add unique `id` based on the `value`
      {...rest}
    />
  );
};

export default IndeterminateCheckbox;
