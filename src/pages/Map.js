import React, { useEffect, useState, useRef } from "react";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import "./Map.css";

const MapEvents = () => {
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const geocoderRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Initialize services when map is ready
  const handleMapLoad = (map) => {
    if (!window.google) return;
    geocoderRef.current = new window.google.maps.Geocoder();
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    mapRef.current = map;
  };

  const handleMapClick = (event) => {
    if (!geocoderRef.current || !placesServiceRef.current) return;

    const clickedLocation = {
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng
    };
    setClickedPosition(clickedLocation);

    placesServiceRef.current.nearbySearch({
      location: clickedLocation,
      radius: 50,
      rankBy: window.google.maps.places.RankBy.DISTANCE
    }, (results, status) => {
      if (status === "OK" && results[0]) {
        const place = results[0];
        handlePlaceSelected(place);
      } else {
        geocoderRef.current.geocode({ location: clickedLocation }, (results, status) => {
          if (status === "OK" && results[0]) {
            setSelectedPlace({
              name: 'Selected Location',
              address: results[0].formatted_address,
              rating: null,
              priceLevel: null,
              type: 'Location',
              reviewCount: 0
            });
          }
        });
      }
    });
  };

  const handlePlaceSelected = (place) => {
    if (!place.geometry) return;
  
    const location = place.geometry.location;
    const newPosition = {
      lat: location.lat(),
      lng: location.lng()
    };
  
    setClickedPosition(newPosition);
  
    if (mapRef.current) {
      mapRef.current.panTo(newPosition);
    }
  
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId: place.place_id || '' },
        (result, status) => {
          if (status === "OK") {
            setSelectedPlace({
              name: result.name || place.name,
              address: result.formatted_address || result.vicinity,
              rating: result.rating,
              priceLevel: result.price_level,
              type: result.types ? result.types[0] : 'Location',
              reviewCount: result.user_ratings_total || 0
            });
          } else {
            setSelectedPlace({
              name: place.name,
              address: place.formatted_address || place.vicinity || 'Address not available',
              rating: null,
              priceLevel: null,
              type: 'Location',
              reviewCount: 0
            });
          }
        }
      );
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
        setUserLocation({ lat: 45.4971, lng: -73.5789 });
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
        <APIProvider
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          libraries={["places", "geocoding"]}
        >
          {userLocation && (
            <>
              <div className="map-search">
                <SearchBar 
                  onPlaceSelected={handlePlaceSelected}
                  mapRef={mapRef}
                />
              </div>
              <Map
                ref={mapRef}
                defaultZoom={13}
                defaultCenter={userLocation}
                style={{ width: "100%", height: "800px" }}
                onClick={handleMapClick}
                onLoad={handleMapLoad}
              >
                {clickedPosition && (
                  <AdvancedMarker position={clickedPosition}>
                    {selectedPlace && (
                      <InfoWindow onCloseClick={() => setSelectedPlace(null)}>
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
                  </AdvancedMarker>
                )}
              </Map>
            </>
          )}
        </APIProvider>
      </div>
    </>
  );
};

export default MapEvents;
