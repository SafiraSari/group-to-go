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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCountdown, setSelectedCountdown] = useState("");
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

const getCountdown = (dateStr, timeStr) => {
  if (!dateStr) return "Date not set";
  
  // Combine date and time (or use midnight if no time provided)
  const dateTimeStr = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
  const eventDateTime = new Date(dateTimeStr);
  const currentTime = new Date();
  
  // Calculate time difference in milliseconds
  const timeDiff = eventDateTime - currentTime;
  
  // Check if the event is in the past
  if (timeDiff < 0) {
    return "Event has passed";
  }
  
  // Calculate days, hours, minutes
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format the countdown
  return `${days}d ${hours}h ${minutes}m`;
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
    
    const newEvent = {
      eventName,
      date,
      groupID,
      category,
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
      setEvents(prev => [...prev, data]); 
  
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

  const handleSaveEvent = async () => {
    // Save the edited event back to the database
    const updatedEvent = { ...selectedEvent, category };

    try {
      const response = await fetch(`http://localhost:3500/event/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the state to reflect the changes
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id ? data : event
          )
        );
        setIsEditing(false);
        setSelectedEvent(null);
      } else {
        console.error("Failed to update event:", data.error);
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:3500/events');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch events');
            }

            setEvents(data.data);  // Store the list of events in the state
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
      if (!selectedEvent) return;
  
      const updateCountdown = () => {
        setSelectedCountdown(getCountdown(selectedEvent.createdAt));
      };
  
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, [selectedEvent]);

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
              isRequired
            />

            <Input
              label="Location"
              placeholder="Where is it happening?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              isRequired
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
              <h3>{event.eventName}</h3>
              <p><strong>Category:</strong> {event.Category}</p>
              <p><strong>Date:</strong> {event.Date}</p>
              <p className="countdown">
                <strong>Countdown:</strong> {getCountdown(event.Date, event.Time)}
              </p>
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
                value={selectedEvent.eventName}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, name: e.target.value })
                }
              />
              <Input
                label="GroupID"
                value={selectedEvent.GroupID}
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
                value={selectedEvent.Date}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, createdAt: e.target.value })
                }
              />

            <Input
              label="Location"
              placeholder="Where is it happening?"
              value={selectedEvent.Location}
              onChange={(e) =>
                setSelectedEvent({ ...selectedEvent, createdAt: e.target.value })
              }
            />

              <div className="option-button">
                <Button label="Save" onClick={() => handleSaveEvent()} />
                <Button label="Cancel" onClick={() => setIsEditing(false)} />
              </div>
            </>
          ) : (
            
            <>
              <h2>{selectedEvent.eventName}</h2>
              <p><strong>Category:</strong> {selectedEvent.Category}</p>
              <p><strong>Date:</strong> {selectedEvent.Date}</p>
              <p><strong>Countdown:</strong> {getCountdown(selectedEvent.Date, selectedEvent.Time)}</p>

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
