import React, { useEffect, useState, useRef } from "react";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import "./Map.css";

const libraries = ["places", "geocoding"];

//Styling for the map
const containerStyle = {
  width: "100%",
  height: "800px",
};

const defaultCenter = {
  lat: 45.4971,
  lng: -73.5789,
};

const MapEvents = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [open, setOpen] = useState(false);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setClickedPosition({ lat, lng });
    setSelectedPlace(null);
    setOpen(false);
  };

  const handlePlaceSelected = (place) => {
    console.log("Selected Place:", place);

    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      console.log("Place name:", place.name);
      console.log("Formatted address:", place.formatted_address);
      console.log("Rating:", place.rating);
      console.log("Price level:", place.price_level);

      setClickedPosition({ lat, lng });
      setSelectedPlace({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        priceLevel: place.price_level,
      });
      setOpen(true);
    } else {
      console.warn("No geometry found for place:", place);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
        setUserLocation(defaultCenter);
      }
    );
  }, []);

  return (
    <>
      <NavBar />
      <div className="map">
        <div className="map-header">
          <h1 className="map-title">MAP</h1>
        </div>

        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
          {userLocation && (
            <>
              <div className="map-search">
                <SearchBar onPlaceSelected={handlePlaceSelected} />
              </div>

              <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={13}
                onLoad={handleMapLoad}
                onClick={handleMapClick}
              >
                {/* User location marker */}
                <Marker
                  position={userLocation}
                  onClick={() => {
                    setClickedPosition(userLocation);
                    setOpen(true);
                  }}
                />

                {/* Marker for clicked/selected location */}
                {clickedPosition && (
                  <Marker
                    position={clickedPosition}
                    onClick={() => setOpen(true)}
                  />
                )}

                {/* InfoWindow */}
                {open && selectedPlace && clickedPosition && (
                  <InfoWindow
                    position={clickedPosition}
                    onCloseClick={() => setOpen(false)}
                  >
                    <div className="custom-infowindow">
                      <h3>{selectedPlace.name}</h3>
                      <p>{selectedPlace.address}</p>
                      <div className="place-details">
                        {selectedPlace.rating && (
                          <span>⭐ {selectedPlace.rating}/5</span>
                        )}
                        {selectedPlace.priceLevel && (
                          <span>💰 {'$'.repeat(selectedPlace.priceLevel)}</span>
                        )}
                      </div>
                      <button
                        className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                        onClick={() => setIsFavorite(!isFavorite)}
                      >
                        ♥
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </>
          )}
        </LoadScript>
      </div>
    </>
  );
};

export default MapEvents;
