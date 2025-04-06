import React from 'react';
import NavBar from "../components/NavBar";
import EventCreationPage from "../components/EventCreationPage"; // Import the component we created

const Events = () => {
  return (
    <>
      <div className="events-container">
        <EventCreationPage />
      </div>
    </>
  )
}

export default Events;