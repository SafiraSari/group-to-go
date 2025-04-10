import { Autocomplete } from "@react-google-maps/api";
import Input from "../components/Input"; 
import { useRef, useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onPlaceSelected }) {
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const serviceRef = useRef(null);

  const [autocompleteLoaded, setAutocompleteLoaded] = useState(false);

  const handleLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
    setAutocompleteLoaded(true);
  
    autocomplete.setFields(["name", "formatted_address", "geometry", "rating", "price_level"]);//Fields to fetch from autocomplete
  
    serviceRef.current = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
  
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      console.log("Autocomplete Place:", place);
  
      if (place && place.geometry) {
        onPlaceSelected(place);
      } else {
        const query = inputRef.current?.value;
        console.log("No geometry. Falling back to text search with:", query);
        fallbackTextSearch(query);
      }
    });
  };
  
  const fallbackTextSearch = (query) => {
    if (query && serviceRef.current) {
      serviceRef.current.textSearch({ query }, (results, status) => {
        if (status === "OK" && results[0]) {
          console.log("Fallback result:", results[0]);
          onPlaceSelected(results[0]);
        } else {
          console.warn("Text search failed:", status);
        }
      });
    }
  };

  return (
    <div className="searchbar-container">
      <Autocomplete onLoad={handleLoad} options={{fields: ["name", "formatted_address", "geometry", "rating", "price_level", "place_id"]}}>
        <Input
          type="text"
          placeholder="Search a place"
          ref={inputRef}
          className="search-input"
        />
      </Autocomplete>
    </div>
  );
}
