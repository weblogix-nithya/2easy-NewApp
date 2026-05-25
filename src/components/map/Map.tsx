// import { useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";


export interface Marker {
  lng: number;
  lat: number;
  icon?: string;
  data?: any;
}

export function Map({
  center,
  zoom,
  markers,
  drivers,
  onMarkerClick,
  onDriverClick,
  onCenterChanged,
  onZoomChanged,
}: // isRouted,
{
  center: google.maps.LatLng;
  zoom: number;
  markers?: Marker[];
  drivers?: Marker[];
  onMarkerClick: (data: any) => void;
  onDriverClick: (data: any) => void;
  onCenterChanged: (pos: { lat: number; lng: number }) => void;
  onZoomChanged: (zoom: number) => void;
  isRouted?: boolean;
}) {
  // const toast = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const jobMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const driverMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>(
    [],
  );
  const directionsRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const rightSideBarJob = useSelector(
    (state: RootState) => state.rightSideBar.job,
  );
  const rightSideBarRoute = useSelector(
    (state: RootState) => state.rightSideBar.route,
  );

  // Step 1: Load map when ready
  useEffect(() => {
    const interval = setInterval(() => {
      const isReady =
        window.google &&
        window.google.maps &&
        window.google.maps.marker &&
        window.google.maps.marker.AdvancedMarkerElement;

      if (!isReady || !ref.current) return;

      clearInterval(interval);

      const newMap = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID, // <-- Replace with real Map ID
        gestureHandling: "greedy",
      });

      google.maps.event.trigger(newMap, "resize");
      setMap(newMap);
    }, 200);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2: Render map once it's ready
  // useEffect(() => {
  //   if (!map || !ref.current) return;

  //   const { AdvancedMarkerElement } = window.google.maps.marker;
  //    jobMarkersRef.current.forEach(m => (m.map = null));
  // driverMarkersRef.current.forEach(m => (m.map = null));
  // jobMarkersRef.current = [];
  // driverMarkersRef.current = [];

  // if (directionsRef.current) {
  //   directionsRef.current.setMap(null);
  //   directionsRef.current = null;
  // }
  //   const markerDataMap = new WeakMap<
  //     google.maps.marker.AdvancedMarkerElement,
  //     any
  //   >();
  //   const driverDataMap = new WeakMap<
  //     google.maps.marker.AdvancedMarkerElement,
  //     any
  //   >();
  //   const googleMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  //   const driverMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  //   const waypoints: google.maps.DirectionsWaypoint[] = [];

  //   const directionsService = new google.maps.DirectionsService();
  //   const directionsDisplay = new google.maps.DirectionsRenderer({
  //     map,
  //     suppressMarkers: true,
  //     suppressInfoWindows: true,
  //   });

  //   map.addListener("zoom_changed", () => {
  //     onZoomChanged(map.getZoom() ?? zoom);
  //     setTimeout(() => google.maps.event.trigger(map, "resize"), 50);
  //   });

  //   map.addListener("center_changed", () => {
  //     const pos = map.getCenter();
  //     if (pos) {
  //       onCenterChanged({ lat: pos.lat(), lng: pos.lng() });
  //       setTimeout(() => google.maps.event.trigger(map, "resize"), 50);
  //     }
  //   });

  //   markers?.forEach((marker, index) => {
  //     const element = document.createElement("div");
  //     element.style.width = "50px";
  //     element.style.height = "50px";
  //     element.style.backgroundImage = `url(${marker.icon})`;
  //     element.style.backgroundSize = "contain";
  //     element.style.backgroundRepeat = "no-repeat";

  //     const advMarker = new AdvancedMarkerElement({
  //       map,
  //       position: { lat: marker.lat, lng: marker.lng },
  //       content: element,
  //       zIndex: 1000,
  //     });

  //     markerDataMap.set(advMarker, marker.data);
  //     googleMarkers.push(advMarker);

  //     if (index > 0 && index < markers.length - 1) {
  //       waypoints.push({
  //         location: { lng: marker.lng, lat: marker.lat },
  //         stopover: true,
  //       });
  //     }

  //     advMarker.addListener("gmp-click", () => {
  //       const data = markerDataMap.get(advMarker);
  //       onMarkerClick(data);
  //     });
  //   });

  //   drivers?.forEach((driver) => {
  //     if (driver.lng && driver.lat) {
  //       const element = document.createElement("div");
  //       element.style.width = "25px";
  //       element.style.height = "25px";
  //       element.style.backgroundImage = `url(${driver.icon})`;
  //       element.style.backgroundSize = "contain";
  //       element.style.backgroundRepeat = "no-repeat";

  //       const advDriver = new AdvancedMarkerElement({
  //         map,
  //         position: { lat: driver.lat, lng: driver.lng },
  //         content: element,
  //         zIndex: 1000,
  //       });

  //       driverDataMap.set(advDriver, driver.data);
  //       driverMarkers.push(advDriver);

  //       advDriver.addListener("gmp-click", () => {
  //         const data = driverDataMap.get(advDriver);
  //         onDriverClick(data);
  //       });
  //     }
  //   });

  //   if (
  //     waypoints.length < 23 &&
  //     googleMarkers.length > 1 &&
  //     (rightSideBarJob || rightSideBarRoute)
  //   ) {
  //     directionsService.route(
  //       {
  //         origin: googleMarkers[0].position!,
  //         destination: googleMarkers[googleMarkers.length - 1].position!,
  //         avoidTolls: true,
  //         avoidHighways: false,
  //         waypoints,
  //         optimizeWaypoints: true,
  //         travelMode: google.maps.TravelMode.DRIVING,
  //       },
  //       (response, status) => {
  //         if (status === google.maps.DirectionsStatus.OK) {
  //           directionsDisplay.setDirections(response);
  //         } else {
  //           toast({
  //             title: "No route or jobs found",
  //             status: "error",
  //             duration: 3000,
  //             isClosable: true,
  //           });
  //         }
  //       },
  //     );
  //   }

  //   // Step 3: Observe size changes for resize fallback
  //   const resizeObserver = new ResizeObserver(() => {
  //     google.maps.event.trigger(map, "resize");
  //   });
  //   resizeObserver.observe(ref.current);

  //   const mutationObserver = new MutationObserver(() => {
  //     google.maps.event.trigger(map, "resize");
  //   });
  //   mutationObserver.observe(document.body, {
  //     attributes: true,
  //     childList: true,
  //     subtree: true,
  //   });

  //   return () => {
  //     resizeObserver.disconnect();
  //     mutationObserver.disconnect();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [map, center, zoom, markers, drivers]);

  useEffect(() => {
  if (!map || !ref.current) return;

      if (onZoomChanged) {
      map.addListener("zoom_changed", () => {
        onZoomChanged(map.getZoom() ?? zoom);
        setTimeout(() => google.maps.event.trigger(map, "resize"), 50);
      });
    }

    if (onCenterChanged) {
      map.addListener("center_changed", () => {
        const pos = map.getCenter();
        if (pos) {
          onCenterChanged({ lat: pos.lat(), lng: pos.lng() });
          setTimeout(() => google.maps.event.trigger(map, "resize"), 50);
        }
      });
    }

  const { AdvancedMarkerElement } = window.google.maps.marker;

  // 1) CLEAR previous markers/route before drawing new ones
  jobMarkersRef.current.forEach(m => (m.map = null));
  driverMarkersRef.current.forEach(m => (m.map = null));
  jobMarkersRef.current = [];
  driverMarkersRef.current = [];

  if (directionsRef.current) {
    directionsRef.current.setMap(null);
    directionsRef.current = null;
  }

  const markerDataMap = new WeakMap<google.maps.marker.AdvancedMarkerElement, any>();
  const driverDataMap = new WeakMap<google.maps.marker.AdvancedMarkerElement, any>();
  const waypoints: google.maps.DirectionsWaypoint[] = [];

  // 2) Draw job markers
  markers?.forEach((marker, index) => {
    const element = document.createElement("div");
    element.style.width = "50px";
    element.style.height = "50px";
    element.style.backgroundImage = `url(${marker.icon})`;
    element.style.backgroundSize = "contain";
    element.style.backgroundRepeat = "no-repeat";

    const advMarker = new AdvancedMarkerElement({
      map,
      position: { lat: marker.lat, lng: marker.lng },
      content: element,
      zIndex: 1000,
    });

    markerDataMap.set(advMarker, marker.data);
    jobMarkersRef.current.push(advMarker);

    if (index > 0 && index < (markers?.length ?? 0) - 1) {
      waypoints.push({
        location: { lng: marker.lng, lat: marker.lat },
        stopover: true,
      });
    }

    advMarker.addListener("gmp-click", () => {
      const data = markerDataMap.get(advMarker);
      onMarkerClick(data);
    });
  });

  // 3) Draw driver markers (only what parent passed)
  drivers?.forEach((driver) => {
    if (!driver.lng || !driver.lat) return;

    const element = document.createElement("div");
    element.style.width = "25px";
    element.style.height = "25px";
    element.style.backgroundImage = `url(${driver.icon})`;
    element.style.backgroundSize = "contain";
    element.style.backgroundRepeat = "no-repeat";

    const advDriver = new AdvancedMarkerElement({
      map,
      position: { lat: driver.lat, lng: driver.lng },
      content: element,
      zIndex: 1000,
    });

    driverDataMap.set(advDriver, driver.data);
    driverMarkersRef.current.push(advDriver);

    advDriver.addListener("gmp-click", () => {
      const data = driverDataMap.get(advDriver);
      onDriverClick(data);
    });
  });

  // 4) (Optional) re-draw route if you have enough points
  if (waypoints.length < 23 && jobMarkersRef.current.length > 1 && (rightSideBarJob || rightSideBarRoute)) {
    const directionsService = new google.maps.DirectionsService();
    directionsRef.current = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      suppressInfoWindows: true,
    });

    directionsService.route(
      {
        origin: jobMarkersRef.current[0].position!,
        destination: jobMarkersRef.current[jobMarkersRef.current.length - 1].position!,
        avoidTolls: true,
        avoidHighways: false,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRef.current?.setDirections(response);
        }
      }
    );
  }

  // Resize observers as you had them...
  // (no change needed)
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [map, markers, drivers, rightSideBarRoute]);

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div
        ref={ref}
        id="map"
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          contentVisibility: "visible",
        }}
      />
    </div>
  );
}
