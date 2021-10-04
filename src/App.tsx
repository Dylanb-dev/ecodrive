import React from 'react';
import './App.css';
import {
  GoogleMap, useJsApiLoader,
  DirectionsRenderer,
} from '@react-google-maps/api';

const DIRECTIONS_OPTIONS = { suppressMarkers: true, preserveViewport: true }



const directionsRequest = ({ DirectionsService, origin, destination }: {
  DirectionsService: any, origin: { lat: number, lon: number }, destination: { lat: number, lon: number }
}) =>
  new Promise((resolve, reject) => {
    DirectionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lon),
        destination: new window.google.maps.LatLng(
          destination.lat,
          destination.lon
        ),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: unknown, status: google.maps.DirectionsStatus) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result)
        } else {
          reject(status)
        }
      }
    )
  })

const containerStyle = {
  width: '100vw',
  height: '100vh'
};

const center = {
  lat: -32,
  lng: 116
};

const DIRECTION_REQUEST_DELAY = 300

const delay = (time: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })


//Map Key
//AIzaSyAwFPLZIa-3fk07Hq0sAjyaPvYOMTfzyBo

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAwFPLZIa-3fk07Hq0sAjyaPvYOMTfzyBo"
  })

  const [map, setMap] = React.useState(null)
  const [directions, setDirections] = React.useState<any>({})

  const onLoad = React.useCallback(async function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    const DirectionsService = new window.google.maps.DirectionsService()
    const direction = await directionsRequest({
      DirectionsService,
      origin: {
        lat: -32,
        lon: 116,
      },
      destination: {
        lat: -33,
        lon: 116,
      },
    })

    console.log(direction)
    setDirections(direction)
    setMap(map)
  }, [])


  // React.useEffect(() => {
  //   const DirectionsService = new window.google.maps.DirectionsService()
  //   const fetchDirections = async () => {
  //     const selectedOrHoveredOrigin = origins.find(
  //       ({ id }) => selectedOrHoveredOriginId === id
  //     )
  //     const tempDirectionsToOrigin = []
  //     for (const destination of destinations) {
  //       const direction = await directionsRequest({
  //         DirectionsService,
  //         origin: {
  //           lat: selectedOrHoveredOrigin.coordinates.lat,
  //           lon: selectedOrHoveredOrigin.coordinates.lon,
  //         },
  //         destination: {
  //           lat: destination.coordinates.lat,
  //           lon: destination.coordinates.lon,
  //         },
  //       })
  //       await delay(DIRECTION_REQUEST_DELAY)
  //       tempDirectionsToOrigin.push(direction)
  //     }
  //     setDirections((prevState) => ({
  //       ...prevState,
  //       [selectedOrHoveredOriginId]: tempDirectionsToOrigin,
  //     }))
  //   }
  //   fetchDirections()

  // }, [
  //   destinations,
  //   directionsToSelectedOrHoveredOrigin,
  //   selectedOrHoveredOriginId,
  //   origins,
  // ])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ streetViewControl: false }}
    >
      {directions &&

        <DirectionsRenderer
          directions={directions}
          options={DIRECTIONS_OPTIONS}
        />
      }
      { /* Child components, such as markers, info windows, etc. */}
      <></>
    </GoogleMap>
  ) : <></>
}

export default React.memo(App)