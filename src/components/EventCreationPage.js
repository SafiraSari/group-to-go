import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import "./EventCreationPage.css";

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
  const [agenda, setAgenda] = useState(["", ""]);
  const [agendaError, setAgendaError] = useState("");

  const handleCreateEvent = () => {
    const eventData = {
      name: eventName,
      date,
      time,
      location,
      notes,
      category,
      agenda: agenda.filter(item => item.trim() !== "")
    };

    console.log("Event Created:", eventData);

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
      </div>
    </>
  );
};

export default Events;
