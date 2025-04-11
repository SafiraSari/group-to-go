import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Confirmation from "../components/Confirmation";
import './Events.css';

const categories = [
  "General", "Food", "Games", "Sports", "Party"
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
  const [deleteEvents, setdeleteEvents] = useState("");
  const [id, setID] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = (eventName) => {
    setdeleteEvents(eventName);
    setShowConfirm(true);
  };

  const generateUniqueEventID = (prefix = 'EVT-') => {
    // Get current timestamp in milliseconds
    const timestamp = Date.now();
    
    // Generate a random number between 1000-9999
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    // Create a random alphanumeric string (4 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 4; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Combine all parts to create the unique ID
    return `${prefix}${timestamp}-${randomNum}-${randomStr}`;
  };

  const getStatus = (dateStr, timeStr) => {
    if (!dateStr) return "No date set";
  
    const dateTimeStr = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
    const eventDateTime = new Date(dateTimeStr);
    const now = new Date();
  
    if (eventDateTime < now) {
      return "Past";
    }
  
    const diffInMs = eventDateTime - now;
    const diffInHours = diffInMs / (1000 * 60 * 60);
  
    if (diffInHours <= 24) {
      return "Soon";
    }
  
    return "Upcoming";
  };
  
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

  const handleCreateEvent = async () => {

    const newEventID = generateUniqueEventID();

    const newEvent = {
      id: newEventID,
      eventName,
      date,
      groupID,
      category,
      time,
      notes,
      location,
      agenda: agenda.filter(item => item.trim() !== "")
    };
  
    try {
      const response = await fetch('http://localhost:3500/CreateEvents', {
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

  const handleEventDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3500/DeleteEvents/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        const error = await response.json();
        console.error('Failed to delete event:', error);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
    setdeleteEvents("");
    setShowConfirm(false);
    setIsEditing(false);
    setSelectedEvent(null)
  };
  
  const handleEventEdit = async (id) => {

    const updatedData = {
      id,
      eventName,
      date,
      groupID,
      category,
      time,
      notes,
      location,
      agenda: agenda.filter(item => item.trim() !== "")
    };

    try {
      const response = await fetch(`http://localhost:3500/EditEvents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        const updatedEvent = await response.json();
        // Update local state (optional, based on your structure)
        setEvents(prev =>
          prev.map(event => event.eventName === eventName ? { ...event, ...updatedData } : event)
        );
      } else {
        const error = await response.json();
        console.error('Failed to update event:', error);
      }
    } catch (error) {
      console.error('Error editing event:', error);
    }

    setIsEditing(false);
    setSelectedEvent(false);
  };
  
    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:3500/FetchEvents');
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

    const generateEventId = () => {
      const timestamp = Date.now(); // Current timestamp in milliseconds
      const randomValue = Math.floor(Math.random() * 1000); // Random number between 0 and 999
      return `${timestamp}-${randomValue}`;
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
              label="Group Code"
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
            <li key={event.id}
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
                  <strong>Countdown:</strong> {getCountdown(event.Date, event.Time)}</p>
                <p> Status: {getStatus(event.Date, event.Time)}</p>
              
            </li>
          ))}
        </ul>

      {selectedEvent && (
        <div className="events-modalchanges">
        <Modal hideButton onClose={() => { setSelectedEvent(null); setIsEditing(false); }}>
          
          {isEditing ? (
            <>
              <h2>Edit Event</h2>
              <Input
                label="Event Name"
                value={eventName}
                placeholder={selectedEvent.eventName}
                onChange={(e) => setEventName(e.target.value)}  // Set the event name properly
              />
              <Input
                label="Group Code"
                value={groupID}
                placeholder={selectedEvent.groupID}
                onChange={(e) => setGroupID(e.target.value)}
              />

              <Input
                label="Date"
                type="date"
                placeholder={selectedEvent.Date}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <Input
                label="Time"
                type="time"
                placeholder={selectedEvent.Time}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />

              <Input
                label="Location"
                placeholder={selectedEvent.location}
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

              <div className="option-button">
                <Button label="Save" onClick={() => handleEventEdit(selectedEvent.id)} />
                <Button label="Cancel" onClick={() => setIsEditing(false)} />
              </div>
            </>
          ) : (
            <>
            
              <h2>{selectedEvent.eventName}</h2>
              <p><strong>Category:</strong> {selectedEvent.Category}</p>
              <p><strong>Group Code:</strong> {selectedEvent.GroupID}</p>
              <p><strong>Location:</strong> {selectedEvent.Location}</p>
              <p><strong>Notes:</strong> {selectedEvent.Notes}</p>
              <p><strong>Date:</strong> {selectedEvent.Date}</p>
              <p><strong>Countdown:</strong> {getCountdown(selectedEvent.Date, selectedEvent.Time)}</p>

              <div className="option-button">
                <Button label="Edit" onClick={() => setIsEditing(true)} />
                <Button label="Delete" variant = "red" onClick={() =>  handleDeleteClick(selectedEvent.id)} />
              </div>

              {showConfirm && (
                <Confirmation
                  label="delete this event"
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={() => handleEventDelete(deleteEvents)}
                />
      )}

            </>
          )}
        </Modal>
        </div>
)}
      </div>
    </>
  );
};

export default Events;
