import React from 'react';
import './App.css';
import {
  GoogleMap, useJsApiLoader,
  DirectionsRenderer,
  InfoWindow,
} from '@react-google-maps/api';

const DIRECTIONS_OPTIONS = { suppressMarkers: true, preserveViewport: true }

const DIRECTIONS_OPTIONS_OJ = {
  suppressMarkers: true, preserveViewport: true, polylineOptions: {
    strokeColor: ' #FFA500', strokeOpacity: 1.0,
    strokeWeight: 5
  }
}


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
        provideRouteAlternatives: true
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

const center = { lat: -32, lng: 116 }

const DIRECTION_REQUEST_DELAY = 300

const delay = (time: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })


//Map Key
//AIzaSyAwFPLZIa-3fk07Hq0sAjyaPvYOMTfzyBo

function computeTotalDistance(myroute: any) {
  let total = 0;

  if (!myroute) {
    return;
  }

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i]!.distance!.value;
  }

  return total / 1000;
}


//@ts-ignore
async function findBestRoute(elavationService: any, myRoutes: any[]) {
  myRoutes.map((route: any, i: number) => {
    return {
      originalData: route,
      distanceWithElevation: computeTotalElavation(elavationService, route)
    }


  })

  const best = myRoutes.sort((a: any, b: any) => a.distanceWithElevation - b.distanceWithElevation)[0]
  return best
}


async function computeTotalElavation(ElavationService: any, myroute: any) {
  if (!myroute) {
    return;
  }
  const res = await ElavationService.getElevationAlongPath({
    path: myroute.overview_path,
    samples: 256,
  })

  let startingElevation = res.results[0].elevation
  let elevationChange = 0
  res.results.map((a: any, i: number) => {
    elevationChange += Math.abs(startingElevation - a.elevation)
    startingElevation = a.elevation
  })

  return elevationChange
}

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAwFPLZIa-3fk07Hq0sAjyaPvYOMTfzyBo"
  })

  const [map, setMap] = React.useState(null)
  const [directions, setDirections] = React.useState<any>({})
  const [OptResult, setOptResult] = React.useState<any>({})
  const [googleResultTo, setGoogleResultTo] = React.useState<any>({})
  const [googleResultFrom, setGoogleResultFrom] = React.useState<any>({})
  const [optResultTo, setOptResultTo] = React.useState<any[]>([])
  const [optResultReturn, setOptResultReturn] = React.useState<any>({})

  const onLoad = React.useCallback(async function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    const DirectionsService = new window.google.maps.DirectionsService()
    const ElavationService = new window.google.maps.ElevationService()
    console.log(ElavationService.getElevationAlongPath)
    const directionsResult1 = await directionsRequest({
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

    const directionsResult2 = await directionsRequest({
      DirectionsService,
      origin: {
        lat: -33,
        lon: 116,
      },
      destination: {
        lat: -32,
        lon: 116,
      },
    })

    //@ts-ignore
    const r = await computeTotalElavation(ElavationService, directionsResult1?.routes[0])
    console.log({ r })
    console.log({ directionsResult1 })

    setDirections(directionsResult1)

    //@ts-ignore
    const bestRouteTo = await findBestRoute(ElavationService, directionsResult1?.routes)
    //@ts-ignore
    const bestRouteReturn = await findBestRoute(ElavationService, directionsResult2?.routes)

    setOptResult(directionsResult2)

    console.log({ bestRouteTo, bestRouteReturn })

    setOptResultTo([bestRouteTo, bestRouteReturn])
    setOptResultReturn(bestRouteReturn)
    console.log({ optResultTo, optResultReturn })

    console.log({ directionsResult1 })
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

  const position = { lat: 33.772, lng: -117.214 }

  const divStyle = {
    background: `white`,
    padding: 4
  }

  const onLoadLabel = (infoWindow: any) => {
    console.log('infoWindow: ', infoWindow)
  }


  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  console.log({ optResultTo })

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >

      {optResultTo && optResultTo.map((r: any, k: number) =>
        <>
          <DirectionsRenderer
            key={`route-${k}`}
            routeIndex={k}
            directions={directions}
            options={DIRECTIONS_OPTIONS_OJ}
          />
          <InfoWindow
            key={`route-window-${k}`}

            onLoad={onLoadLabel}
            //@ts-ignore
            position={r.overview_path[0]}
          >
            <div style={divStyle}>
              <p>{r.legs[0].distance.text}</p>
            </div>
          </InfoWindow>
        </>)
      }
      { /* Child components, such as markers, info windows, etc. */}
      <></>
    </GoogleMap>
  ) : <></>
}

export default React.memo(App)