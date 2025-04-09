import React, { useRef, useEffect } from "react";
import Input from "../components/Input"; // Make sure this Input is properly defined
import searchicon from "../assets/searchicon.png";
import "./SearchBar.css";

const SearchBar = ({ onPlaceSelected, value, mapRef }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API not loaded.");
        return;
      }
  
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          { types: ["geocode"] }
        );
  
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (onPlaceSelected && place.geometry) {
            onPlaceSelected(place);
          }
        });
      } catch (error) {
        console.error("Error initializing autocomplete:", error);
      }
    };
  
    // Add a small delay to ensure the API is fully loaded
    const timer = setTimeout(initAutocomplete, 500);
    return () => clearTimeout(timer);
  }, [onPlaceSelected]);
  const handleManualSearch = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (place?.geometry) {
      onPlaceSelected(place);
      return;
    }

    const inputValue = inputRef.current.value.trim();
    if (!inputValue) {
      console.warn("Please enter a location");
      return;
    }

    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    placesService.textSearch({
      query: inputValue,
      bounds: mapRef.current?.getBounds()
    }, (results, status) => {
      if (status === "OK" && results[0]) {
        onPlaceSelected(results[0]);
      } else {
        console.warn("No results found for:", inputValue);
      }
    });
  };

  return (
    <div className="search-container">
      <Input
        label={"Search"}
        ref={inputRef}
        value={value}
        placeholder="Search for a place"
      />
      <button onClick={handleManualSearch} className="searchbutton">
        <img src={searchicon} alt="Search" className="searchimg" />
      </button>
    </div>
  );
};

export default SearchBar;
