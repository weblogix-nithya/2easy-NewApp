// "use client";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { ReactElement, ReactNode } from "react";

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) {
    return;
  }
  if (status === Status.FAILURE) {
    return;
  }
  return null;
};

export default function GoogleMapProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_MAPS_KEY!}
      render={render}
      libraries={["places", "marker"]}
    >
      {children}
    </Wrapper>
  );
}