import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap, useMapEvent } from 'react-leaflet/hooks'
import "./index.css"
import { Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import axios from 'axios'
import L from "leaflet"
import "leaflet-routing-machine"
import { IoMdLocate } from "react-icons/io";
import { IoPin } from "react-icons/io5";

const App = () => {
  const [position, setPosition] = useState(null);
  const [otherPosition, setOtherPosition] = useState(null);
  const [address, setAddress] = useState(null);
  const [otherAddress, setOtherAddress] = useState(null);
  const [route, setRoute] = useState(null);


  function handleDelete() {
    setPosition(null)
    setOtherPosition(null)
    setAddress(null)
    setOtherAddress(null)
    setRoute(null)
  }
  async function getMyLocation() {
    navigator.geolocation.watchPosition(async (pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude])
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=fa`)
        if (response.status == 200) {
          setAddress(response.data.address)
        }
      } catch (error) {

      }
    })
  }

  return (
    <div className='relative h-screen w-screen overflow-auto'>
      <MapContainer className='h-screen w-full z-10' center={position || [35.6892, 51.3890]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToMyLocation position={position} />
        <SelectPosition setPosition={setPosition} address={address} setOtherAddress={setOtherAddress} setAddress={setAddress} position={position} setOtherPosition={setOtherPosition} />
        {position &&
          <Marker position={position}>
            <Popup></Popup>
          </Marker>
        }
        {otherPosition &&
          <>
            <Marker position={otherPosition}>
              <Popup></Popup>
            </Marker>
            <RoutingControl start={position} end={otherPosition} setRoute={setRoute} />
          </>
        }

      </MapContainer>
      {address &&
        <div dir='rtl' className='z-50 absolute shadow-2xl md:w-1/2 w-[90%] md:top-4 md:bottom-auto bottom-16 left-1/2 -translate-x-1/2 bg-white p-2 md:p-3 rounded-md'>
          <div className='space-y-1 grid grid-cols-1 md:grid-cols-2 md:gap-x-4 text-sm md:text-base'>
            <div dir='rtl' className='flex items-center gap-2'>
              <p className='w-[40px] text-nowrap '>مبدا :</p>
              <input disabled type="text" placeholder='از روی نقشه انتخاب کنید' className='border-0 flex-1 w-3/4 overflow-x-auto outline-none bg-gray-200 p-1 md:p-2 rounded-md' value={`${address.city} , ${address.neighbourhood} , ${address.road}`} />
            </div>
            <div dir='rtl' className='flex items-center gap-2'>
              <p className='w-[40px] text-nowrap '>مقصد :</p>
              <input disabled type="text" placeholder='از روی نقشه انتخاب کنید' className='border-0 flex-1 w-3/4 overflow-x-auto outline-none bg-gray-200 p-1 md:p-2 rounded-md' value={otherAddress ? `${otherAddress?.city} , ${otherAddress?.neighbourhood} , ${otherAddress?.road}` : ""} />
            </div>
            {route &&
              <>
                <div dir='rtl' className='flex items-center gap-2'>
                  <p className='w-[40px] text-nowrap '>فاصله :</p>
                  <input value={`${(route.totalDistance / 1000).toFixed(1)} کیلومتر`} disabled type="text" className='border-0 flex-1 w-3/4 overflow-x-auto outline-none bg-gray-200 p-1 md:p-2 rounded-md' />
                </div>
                <div dir='rtl' className='flex items-center gap-2'>
                  <p className='w-[40px] text-nowrap '>زمان :</p>
                  <input value={(route.totalTime / 60) < 60 ? `${(route.totalTime / 60).toFixed(0)} دقیقه` : `${Math.floor(((route.totalTime / 60).toFixed(0) / 60))} ساعت و ${((route.totalTime / 60).toFixed(0)) % 60} دقیقه`} disabled type="text" className='border-0 flex-1 w-3/4 overflow-x-auto outline-none bg-gray-200 p-1 md:p-2 rounded-md' />
                </div>
              </>
            }
          </div>
          <div className='flex justify-center pt-1 md:pt-4 text-sm md:text-base'>
            <button onClick={() => { handleDelete() }} className='bg-green-700 text-white py-0.5 px-8 rounded-md text-center'>حذف</button>
          </div>
        </div>
      }
      <div className='absolute top-3 z-30 right-3'>
        <button onClick={() => { getMyLocation() }} className='bg-white p-2 rounded-md shadow-xl'>
          <IoMdLocate size={30} />
        </button>
      </div>
    </div>
  );
}

export default App;

function SelectPosition({ position, setPosition, setOtherPosition, setAddress, address, setOtherAddress }) {
  useMapEvent({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (position != null) {
        setOtherPosition([lat, lng])
      } else {
        setPosition([lat, lng])
      }
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fa`)
        if (response.status == 200) {
          if (address == null) {
            setAddress(response.data.address)
          } else {
            setOtherAddress(response.data.address)
          }
        }
      } catch (error) {

      }
    }
  })
}

function RoutingControl({ start, end, setRoute }) {
  const map = useMap();
  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(start), L.latLng(end)],
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      lineOptions: {
        styles: [{ color: "green" }]
      }
    }).addTo(map)
    control.on("routesfound", (e) => {
      setRoute(e.routes[0].summary)
    })
    return () => {
      map.removeControl(control)
    }
  }, [start, end])
}


function FlyToMyLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16)
    }
  }, [position])
}