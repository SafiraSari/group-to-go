import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import "./Schedule.css";

const Schedule = () => {
  // State for managing availability
  const [availability, setAvailability] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekDateRange, setWeekDateRange] = useState("");
  
  // Days and time slots for the grid
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 9); // 9AM to 8PM
  
  // State to hold the dates for the current week
  const [weekDates, setWeekDates] = useState([]);
  
  useEffect(() => {
    // Initialize empty availability
    const initialAvailability = {};
    days.forEach(day => {
      initialAvailability[day] = {};
      timeSlots.forEach(time => {
        initialAvailability[day][time] = false;
      });
    });
    setAvailability(initialAvailability);
    
    // Set default week to current week
    const today = new Date();
    const year = today.getFullYear();
    const currentWeek = `${year}-W${getWeekNumber(today)}`;
    setSelectedWeek(currentWeek);
    updateWeekDates(currentWeek);
  }, []);
  
  // Calculate the week number for a given date
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // Update the week dates based on the selected week
  const updateWeekDates = (weekString) => {
    if (!weekString) return;
    
    const year = parseInt(weekString.substring(0, 4));
    const weekNum = parseInt(weekString.substring(6));
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOffset = (weekNum - 1) * 7;
    const firstDayOfWeek = new Date(firstDayOfYear);
    firstDayOfWeek.setDate(firstDayOfYear.getDate() + dayOffset - firstDayOfYear.getDay() + 1);
    
    if (firstDayOfYear.getDay() === 0) {
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 7);
    }
    
    const dates = [];
    const sundayOfWeek = new Date(firstDayOfWeek);
    sundayOfWeek.setDate(sundayOfWeek.getDate() - 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sundayOfWeek);
      date.setDate(sundayOfWeek.getDate() + i);
      dates.push(date);
    }
    
    setWeekDates(dates);
    
    if (dates.length > 0) {
      const firstDate = dates[0];
      const lastDate = dates[6];
      
      const formatDate = (date) => {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      };
      
      setWeekDateRange(`${formatDate(firstDate)} - ${formatDate(lastDate)}`);
    }
  };
  
  const handleWeekChange = (e) => {
    const week = e.target.value;
    setSelectedWeek(week);
    updateWeekDates(week);
  };
  
  const formatTime = (hour) => {
    if (hour === 12) return "12pm";
    return hour < 12 ? `${hour}am` : `${hour-12}pm`;
  };
  
  const toggleAvailability = (day, time) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: !prev[day]?.[time]
      }
    }));
  };
  
  const getCellStyle = (day, time) => {
    const isAvailable = availability[day]?.[time];
    
    return {
      backgroundColor: isAvailable ? "#FDDB74" : "#f4f4f4",
      border: isAvailable ? "2px solid #2196f3" : "1px solid #ddd",
      width: "100%",
      height: "100%",
      cursor: "pointer"
    };
  };
  
  const handleModalSubmit = () => {
    setModalOpen(false);
  };
  
  const handleModalCancel = () => {
    setModalOpen(false);
  };

  return (
    <>
      <NavBar />
      <div className="header-title">
          <h1>SCHEDULE</h1>
      </div>
      <div className="schedule-container">
        <Button label="+ Create New Schedule" onClick={() => setModalOpen(true)} />
        
        <div className="schedule-instructions">
          <p>Click on time slots to mark your availability</p>
        </div>
        
        {weekDateRange && (
          <div className="week-title">
            <h2>{weekDateRange}</h2>
          </div>
        )}
        
        <div className="schedule-grid">
          <table>
            <thead>
              <tr>
                <th className="time-header"></th>
                {days.map((day, index) => (
                  <th key={day}>
                    {day}
                    {weekDates.length > 0 && (
                      <div className="date-number">
                        {weekDates[index]?.getDate()}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="time-label">{formatTime(time)}</td>
                  {days.map(day => (
                    <td 
                      key={`${day}-${time}`}
                      onClick={() => toggleAvailability(day, time)}
                    >
                      <div 
                        className="schedule-cell"
                        style={getCellStyle(day, time)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="schedule-legend">
          <h3>Legend:</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color no-availability"></div>
              <span>Not available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color full-availability"></div>
              <span>Available</span>
            </div>
          </div>
        </div>
        
        {modalOpen && (
          <Modal 
            onSubmit={handleModalSubmit} 
            onCancel={handleModalCancel} 
            onClose={handleModalCancel}
          >
            <div className="modal-form">
              <h1>CREATE NEW SCHEDULE</h1>
              <Input 
                label="Event Title" 
                placeholder="Enter event title" 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                isRequired 
              />
              
              <h3>Dates</h3>
              <div className="date-range">
                <Input 
                  label="Start Date" 
                  type="week" 
                  value={selectedWeek}
                  onChange={handleWeekChange}
                />
              </div>
              
              <h3>Time Range</h3>
              <div className="time-range">
                <Input label="Start Time" type="time" defaultValue="09:00" />
                <Input label="End Time" type="time" defaultValue="17:00" />
              </div>
              
              <Input label="Notes" type="text" placeholder="Enter any additional details..." />
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Schedule;