import React, { useEffect, useState, useRef } from "react";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import isFavoriteEmpty from "../assets/favoriteempty.png";
import isFavoriteFilled from "../assets/favoritefilled.png";
import mapFavorite from "../assets/favoriteplace.png";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import "./Map.css";

const libraries = ["places", "geocoding"];

const containerStyle = {
  width: "100%",
  height: "800px",
};

const defaultCenter = {
  lat: 45.4971,
  lng: -73.5789,
};

const Maps = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [open, setOpen] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [placeDetails, setPlaceDetails] = useState(null);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Load favorite locations from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteMarkers')) || [];
    setFavoriteLocations(savedFavorites);
  }, []);

  // Save favorite locations to localStorage whenever the state changes
  useEffect(() => {
    if (favoriteLocations.length > 0) {
      localStorage.setItem('favoriteMarkers', JSON.stringify(favoriteLocations));
    }
  }, [favoriteLocations]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
  };

  /**
   * Handles a click on the map by setting the clicked position and resetting
   * the selected place and open state.
   * @param {Object} event The Google Maps event object containing the latLng
   *   of the click.
   */
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setClickedPosition({ lat, lng });
    setSelectedPlace(null);
    setOpen(false);
  };

  /**
   * Handles the selection of a place from the search bar or the map.
   * If the place has complete data (rating and price level), it will display the
   * place info immediately. If the place does not have complete data, it will
   * fetch the details from the Google Places API and then display the info.
   * @param {Object} place The selected place object from Google Maps.
   * @returns {void}
   */
  const handlePlaceSelected = async (place) => {
    console.log("Selected Place:", place);

    if (!place.geometry) {
      console.warn("No geometry found for place");
      return;
    }

    const hasCompleteData = place.rating !== undefined && place.price_level !== undefined;

    if (hasCompleteData) {
      displayPlaceInfo(place);
      return;
    }

    if (place.place_id && placesServiceRef.current) {
      try {
        const details = await getPlaceDetails(place.place_id);
        displayPlaceInfo({
          ...place,
          rating: details.rating,
          price_level: details.price_level
        });
      } catch (error) {
        console.warn("Failed to get details, showing basic info", error);
        displayPlaceInfo(place);
      }
    } else {
      displayPlaceInfo(place);
    }
  };

/**
 * Fetches the detailed information of a place using its placeId from the Google Places API.
 * The fields requested include the name, formatted address, rating, and price level.
 * 
 * @param {string} placeId - The unique identifier for the place to retrieve details for.
 * @returns {Promise<Object>} A promise that resolves to the place details object if the request
 * is successful, or rejects with an error if the request fails.
 */

  const getPlaceDetails = (placeId) => {
    return new Promise((resolve, reject) => {
      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ["name", "formatted_address", "rating", "price_level"]
        },
        (place, status) => {
          if (status === "OK") {
            resolve(place);
          } else {
            reject(new Error(`Places details request failed: ${status}`));
          }
        }
      );
    });
  };

/**
 * Displays the information of a given place on the map, including its name,
 * formatted address, rating, and price level.
 * 
 * @param {Object} place - The place for which to display the information.
 *   The place object should contain the following properties:
 *   - name: The name of the place.
 *   - formatted_address: The formatted address of the place.
 *   - geometry: The geometry of the place, which should contain the location
 *     object.
 *   - rating: The rating of the place as a number from 1 to 5, or null if no
 *     rating is available.
 *   - price_level: The price level of the place as an integer from 0 to 4, or
 *     null if no price level is available.
 *   - place_id: The unique identifier for the place.
 */
  const displayPlaceInfo = (place) => {
    const location = place.geometry.location;
    setClickedPosition({
      lat: location.lat(),
      lng: location.lng()
    });
    setSelectedPlace({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      priceLevel: place.price_level,
      place_id: place.place_id, 
    });
    setOpen(true);
  };

  // Fetch user location
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

  const handleFavoriteClick = () => {
    const isAlreadyFavorite = favoriteLocations.some(
      (location) =>
        location.lat === clickedPosition.lat && location.lng === clickedPosition.lng
    );
  
    if (isAlreadyFavorite) {
      console.log("This location is already a favorite.");
      setIsFavorite(true); 
      return;
    }
  
    const newFavorite = {
      lat: clickedPosition.lat,
      lng: clickedPosition.lng,
    };
  
    // Updates state to include new favorite
    const updatedFavorites = [...favoriteLocations, newFavorite];
    setFavoriteLocations(updatedFavorites);
    setIsFavorite(true);
  
    // Save the favorites list to localStorage
    localStorage.setItem('favoriteMarkers', JSON.stringify(updatedFavorites));
  };
  
  const handleFavoriteMarkerClick = async (favoriteLocation) => {
    console.log("Clicked on favorite marker:", favoriteLocation);
  
    if (favoriteLocation.place_id && placesServiceRef.current) {
      try {
        const details = await getPlaceDetails(favoriteLocation.place_id);  
        setPlaceDetails({
          name: details.name,
          address: details.formatted_address,
          rating: details.rating,
          priceLevel: details.price_level,
        });
        setOpen(true);
      } catch (error) {
        console.warn("Failed to get details for favorite marker", error);
      }
    } else {
      console.warn("No place_id for favorite marker, skipping details fetch.");
    }
  };
  
  return (
    <>
      <NavBar />
      <div className="map">
        <div >
          <h1 className="map-header-title">MAP</h1>
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
                {clickedPosition && (
                  <Marker
                    position={clickedPosition}
                    onClick={() => setOpen(true)}
                  />
                )}

                {open && selectedPlace && clickedPosition && (
                  <InfoWindow
                    position={clickedPosition}
                    onCloseClick={() => setOpen(false)}
                  >
                    <div className="custom-infowindow">
                      <p>{selectedPlace.address}</p>
                      <br/>
                      <button
                        className="favorite-btn"
                        onClick={handleFavoriteClick}
                      >
                        <img
                          src={isFavorite ? isFavoriteFilled : isFavoriteEmpty}
                          alt={isFavorite ? "Favorited" : "Favorite"}
                          style={{ width: '24px', height: '24px' }}
                        />
                      </button>
                    </div>
                  </InfoWindow>
                )}

                {/* Render favorite markers */}
                {favoriteLocations.map((location, index) => (
                  <Marker
                    key={index}
                    position={location}
                    icon={{
                      url: mapFavorite,
                      scaledSize: new window.google.maps.Size(30, 30),
                    }}
                    onClick={() => handleFavoriteMarkerClick(location)} // Handle click on favorite marker
                  />
                ))}
              </GoogleMap>
            </>
          )}
        </LoadScript>
      </div>
    </>
  );
};

export default Maps;