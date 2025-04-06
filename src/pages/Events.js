import React from 'react';
import NavBar from "../components/NavBar";
import EventCreationPage from "../components/EventCreationPage"; 

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