import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import "./Events.css";

const categories = [
  "General", "Food", "Activity", "Time", "Other"
];

const Events = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [groupID, setGroupID] = useState("");
  const [agenda, setAgenda] = useState(["", ""]);
  const [agendaError, setAgendaError] = useState("");
  const [id, setID] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventCountdowns, setEventCountdowns] = useState({});

  const [selectedCountdown, setSelectedCountdown] = useState("");

  const [events, setEvents] = useState([
    { id: 1, name: "Pizza Party Poll", category: "Food", createdAt: "2025-04-01" },
    { id: 2, name: "Best Activity?", category: "Activity", createdAt: "2025-04-02" },
  ]);

  const getCountdown = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diff = eventDate - now;

    if (diff <= 0) return "Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    if (!selectedEvent) return;

    const updateCountdown = () => {
      setSelectedCountdown(getCountdown(selectedEvent.createdAt));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const handleCreateEvent = async () => {
    
    console.log("Confirm button clicked");

    const newEvent = {
      eventName,
      date,
      groupID,
      time,
      location,
      agenda: agenda.filter(item => item.trim() !== "")
    };
  
    try {
      const response = await fetch('http://localhost:3500/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Error:', data.error || 'Failed to create event');
        return;
      }
  
      console.log('Event created successfully:', data);
      setEvents(prev => [...prev, data]); // Or whatever data your backend returns (e.g., with `id`)
  
      // Reset form
      setEventName("");
      setDate("");
      setTime("");
      setLocation("");
      setNotes("");
      setCategory(categories[0]);
      setAgenda(["", ""]);
      setAgendaError("");
      setModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  
  return (
    <>
      <NavBar />
      <div className="events-container">
        <div className="header-title">
          <h1>EVENT PLANNER</h1>
        </div>

        <Button label="+ Create New Event" onClick={() => setModalOpen(true)} />

        {modalOpen && (
          <Modal
            onSubmit={handleCreateEvent}
            onCancel={() => setModalOpen(false)}
            onClose={() => setModalOpen(false)}
          >
            <h1>CREATE NEW EVENT</h1>

            <Input
              label="Event Name"
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              isRequired
            />
            <Input
              label="GroupID"
              placeholder="Enter the GroupID"
              value={groupID}
              onChange={(e) => setGroupID(e.target.value)}
              isRequired
            />
          
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              isRequired
            />

            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <Input
              label="Location"
              placeholder="Where is it happening?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <h3>Category: <strong>{category}</strong></h3>
            <div className="option-button">
              {categories.map((cat, index) => (
                <Button
                  key={index}
                  label={cat}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </div>

            <Input
              label="Notes"
              type="text"
              placeholder="Extra details (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Modal>
        )}

      <ul className="event-list-items">
        {events.map((event) => (
          <li
            key={event.id}
            className="event-card"
            onClick={() => {
              setSelectedEvent(event); // opens modal with event details
              setIsEditing(false);     // optional: make sure you're not in edit mode
            }}
          >
            <h3>{event.name}</h3>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Date:</strong> {event.createdAt}</p>

            <p className="countdown">
              <strong>Countdown:</strong> {getCountdown(event.CreatedAt)}</p>
          </li>
        ))}
      </ul>

      {selectedEvent && (
        <Modal onClose={() => { setSelectedEvent(null); setIsEditing(false); }}>
          {isEditing ? (
            <>
              <h2>Edit Event</h2>
              <Input
                label="Event Name"
                value={selectedEvent.name}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, name: e.target.value })
                }
              />
              <h3>Category: <strong>{category}</strong></h3>
              <div className="option-button">
              {categories.map((cat, index) => (
                <Button
                  key={index}
                  label={cat}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </div>
              <Input
                label="Date"
                type="date"
                value={selectedEvent.createdAt}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, createdAt: e.target.value })
                }
              />
              <div className="option-button">
                <Button
                  label="Save"
                  onClick={() => {
                    setEvents((prev) =>
                      prev.map((e) =>
                        e.id === selectedEvent.id ? selectedEvent : e
                      )
                    );
                    setIsEditing(false);
                    setSelectedEvent(null);
                  }}
                />
                <Button label="Cancel" onClick={() => setIsEditing(false)} />
              </div>
            </>
          ) : (
            
            <>
              <h2>{selectedEvent.name}</h2>
              <p><strong>Category:</strong> {selectedEvent.category}</p>
              <p><strong>Date:</strong> {selectedEvent.createdAt}</p>
              <p><strong>Countdown:</strong> {selectedCountdown}</p>

              <div className="option-button">
                <Button label="Edit" onClick={() => setIsEditing(true)} />
                <Button label="Delete" onClick={() => { setEvents(events.filter((e) => e.id !== selectedEvent.id)); setSelectedEvent(null);}}
                />
              </div>

            </>
          )}
        </Modal>
)}
      </div>
    </>
  );
};

export default Events;
