import React from 'react';
import './App.css';
import {
  GoogleMap, useJsApiLoader,
  DirectionsRenderer,
  InfoWindow,
  Autocomplete,
} from '@react-google-maps/api';


//Map Key
//AIzaSyAwFPLZIa-3fk07Hq0sAjyaPvYOMTfzyBo


const DIRECTIONS_OPTIONS = { suppressMarkers: true, preserveViewport: true }

const DIRECTIONS_OPTIONS_OJ = {
  suppressMarkers: true, preserveViewport: true, polylineOptions: {
    strokeColor: ' #FFA500', strokeOpacity: 0.9,
    strokeWeight: 3
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

  console.log(myRoutes)

  const best = myRoutes.sort((a: any, b: any) => (a.distanceWithElevation + a.legs[0].distance.value) - (b.distanceWithElevation + b.legs[0].distance.value))[0]
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
    googleMapsApiKey: "AIzaSyAwFPLZIa-3fk07Hq0sAjyaPvYOMTfzyBo",
    libraries: ['places']
  })

  const [map, setMap] = React.useState(null)
  let search: any = null

  const [directions, setDirections] = React.useState<any>({})
  const [OptResult, setOptResult] = React.useState<any>({})
  const [googleResultTo, setGoogleResultTo] = React.useState<any[]>([])
  const [googleResultFrom, setGoogleResultFrom] = React.useState<any[]>([])
  const [optResultTo, setOptResultTo] = React.useState<any[]>([])
  const [optResultFrom, setOptResultFrom] = React.useState<any[]>([])

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

    // //@ts-ignore
    // const r = await computeTotalElavation(ElavationService, directionsResult1?.routes[0])
    // console.log({ r })
    // console.log({ directionsResult1 })

    // setDirections(directionsResult1)

    // //@ts-ignore
    // const bestRouteTo = await findBestRoute(ElavationService, directionsResult1?.routes)
    // //@ts-ignore
    // const bestRouteFrom = await findBestRoute(ElavationService, directionsResult2?.routes)

    // setOptResult(directionsResult2)

    // console.log({ bestRouteTo, bestRouteFrom })

    // setOptResultTo([bestRouteTo])
    // setOptResultFrom([bestRouteFrom])

    // //@ts-ignore
    // setGoogleResultTo([directionsResult1?.routes[0]])
    // //@ts-ignore
    // setGoogleResultFrom([directionsResult2?.routes[0]])

    // console.log({ optResultTo, optResultFrom })

    // console.log({ directionsResult1 })
    setMap(map)
  }, [])

  const divStyle = {
    background: `white`,
    padding: 4
  }

  const onLoadLabel = (infoWindow: any) => {
    console.log('infoWindow: ', infoWindow)
  }

  const onLoadSearch = (searchP: any) => {
    console.log(searchP)
    search = searchP
    console.log(searchP)

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
      <Autocomplete
        onLoad={onLoadSearch}
        onPlaceChanged={() => {
          //@ts-ignore
          console.log({ search })
        }}
      >
        <input
          type="text"
          placeholder="Customized your placeholder"
          style={{
            boxSizing: `border-box`,
            border: `1px solid transparent`,
            width: `240px`,
            height: `32px`,
            padding: `0 12px`,
            borderRadius: `3px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipses`,
            position: "absolute",
            left: "50%",
            marginLeft: "-120px"
          }}
        />
      </Autocomplete>
      {optResultTo && optResultTo.map((r: any, k: number) =>
        <>
          <DirectionsRenderer
            key={`route-${k}`}
            routeIndex={k}
            directions={directions}
            options={DIRECTIONS_OPTIONS}
          />
          <InfoWindow
            key={`route-window-${k}`}

            onLoad={onLoadLabel}
            //@ts-ignore
            position={r.overview_path[0]}
          >
            <div style={divStyle}>
              <p>{'Distance to Destination'}</p>

              <p>{r.legs[0].distance.text}</p>
            </div>
          </InfoWindow>
        </>)
      }
      {optResultFrom && optResultFrom.map((r: any, k: number) =>
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
              <p>{'Distance back Home'}</p>
              <p>{r.legs[0].distance.text}</p>
            </div>
          </InfoWindow>
        </>)
      }

      {googleResultTo && googleResultTo.map((r: any, k: number) =>
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
              <p>{'Distance back Home'}</p>
              <p>{r.legs[0].distance.text}</p>
            </div>
          </InfoWindow>
        </>)
      }
      {googleResultFrom && googleResultFrom.map((r: any, k: number) =>
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
              <p>{'Distance back Home'}</p>
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