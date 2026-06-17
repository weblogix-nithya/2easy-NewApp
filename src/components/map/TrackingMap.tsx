import { useToast } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export interface Marker {
  lng: number;
  lat: number;
  icon?: string;
  data?: any;
}

// add in drivers locations, pick up locations, drop off locations etc
export function TrackingMap({
  center,
  zoom,
  markers,
  drivers,
  onCenterChanged,
  onZoomChanged,
  isRouting = false,
}: {
  center: google.maps.LatLng;
  zoom: number;
  markers?: Marker[];
  drivers?: Marker[];
  onCenterChanged: any;
  onZoomChanged: any;
  isRouting?: boolean;
}) {
  const toast = useToast();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const driversRef = useRef([]);

  const rightSideBarJob = useSelector(
    (state: RootState) => state.rightSideBar.job,
  );
  const rightSideBarRoute = useSelector(
    (state: RootState) => state.rightSideBar.route,
  );
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(
    null,
  );

  console.log("TrackingMap Render");

  useEffect(() => {
    if (window.google && window.google.maps) {
      if (mapRef.current && !mapInstance.current) {
        // Initialize the map
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
        });

        mapInstance.current.addListener("zoom_changed", () => {
          onZoomChanged(mapInstance.current.getZoom());
        });

        mapInstance.current.addListener("center_changed", () => {
          onCenterChanged({
            lat: mapInstance.current.getCenter().lat(),
            lng: mapInstance.current.getCenter().lng(),
          });
        });
      }

      console.log("Init Map");
    } else {
      console.error("Google Maps API is not loaded.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded.");
      return;
    }
    console.log("DRIVERS EFFECT", drivers?.length);

    // Clear existing driver markers
    driversRef.current.forEach((driver) => driver.setMap(null));
    driversRef.current = [];

    drivers?.forEach((driver) => {
      if (driver.lng && driver.lat) {
        let driverMarker = new window.google.maps.Marker({
          position: { lat: driver.lat, lng: driver.lng },
          map: mapInstance.current,
          icon: {
            url: driver.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
          },
          // @ts-ignore
          data: driver.data || null,
          zIndex: 1000,
        });

        driversRef.current.push(driverMarker);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers]);

  useEffect(() => {
    console.log("MARKERS EFFECT", markers?.length);
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded.");
      return;
    }

    // Clear existing driver markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const waypoints: google.maps.DirectionsWaypoint[] = [];
    markers?.forEach((marker, index) => {
      let googleMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: mapInstance.current,
        icon: {
          url: marker.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(27, 44),
          scaledSize: new google.maps.Size(50, 50),
        },
        // @ts-ignore
        data: marker.data || null,
        zIndex: 1000,
      });

      markersRef.current.push(googleMarker);

      if (index > 0 && index < markers.length - 1) {
        waypoints.push({
          location: {
            lng: googleMarker.getPosition().lng(),
            lat: googleMarker.getPosition().lat(),
          },
          stopover: true,
        });
      }
    });

    // const directionsService = new google.maps.DirectionsService();
    // const directionsDisplay = new google.maps.DirectionsRenderer({
    //   map: mapInstance.current,
    //   suppressMarkers: true,
    //   suppressInfoWindows: true,
    // });
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true,
        suppressInfoWindows: true,
      });
    }
    // directionsRendererRef.current?.setDirections(response);
    const googleMarkers = markersRef.current;
    // 23 waypoints max
    if (
      waypoints.length < 23 &&
      googleMarkers.length > 1 &&
      (isRouting || rightSideBarJob != null || rightSideBarRoute != null)
    ) {
      directionsServiceRef.current.route(
        {
          origin: {
            lat: googleMarkers[0].getPosition().lat(),
            lng: googleMarkers[0].getPosition().lng(),
          },
          destination: {
            lat: googleMarkers[googleMarkers.length - 1].getPosition().lat(),
            lng: googleMarkers[googleMarkers.length - 1].getPosition().lng(),
          },
          avoidTolls: true,
          avoidHighways: false,
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        function (response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRendererRef.current?.setDirections(response);
          } else {
            toast({
              title: "No route or jobs found",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  useEffect(() => {
    return () => {
      directionsRendererRef.current?.setMap(null);
    };
  }, []);
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div ref={mapRef} id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
