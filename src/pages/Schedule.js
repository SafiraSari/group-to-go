import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import "./Schedule.css";

const Schedule = () => {
  const [availability, setAvailability] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekDateRange, setWeekDateRange] = useState("");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 9);
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    const initialAvailability = {};
    days.forEach(day => {
      initialAvailability[day] = {};
      timeSlots.forEach(time => {
        initialAvailability[day][time] = false;
      });
    });
    setAvailability(initialAvailability);
    
    const today = new Date();
    const year = today.getFullYear();
    const currentWeek = `${year}-W${getWeekNumber(today)}`;
    setSelectedWeek(currentWeek);
    updateWeekDates(currentWeek);
  }, []);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

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
    
    // Clear all availability for the new week
    const clearedAvailability = {};
    days.forEach(day => {
      clearedAvailability[day] = {};
      timeSlots.forEach(time => {
        clearedAvailability[day][time] = false;
      });
    });
    setAvailability(clearedAvailability);
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
          <div 
            className="schedule-modal-overlay"
            onClick={() => setModalOpen(false)}
          >
            <div 
              className="schedule-modal-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-form">
                <h1 className="schedule-title">CREATE NEW SCHEDULE</h1>
                <h3>Dates</h3>
                <div className="date-range">
                  <Input 
                    label="Start Date" 
                    type="week" 
                    value={selectedWeek}
                    onChange={handleWeekChange}
                    style={{ 
                      maxWidth: '800px'
                    }}
                  />
                </div>
              </div>
              <div className="schedule-modal-actions">
                <Button 
                  label="Cancel" 
                  variant="red"
                  className="schedule-modal-cancel" 
                  onClick={() => setModalOpen(false)}
                />
                <Button 
                  label="Confirm"
                  variant="green" 
                  className="schedule-modal-cancel" 
                  onClick={() => setModalOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Schedule;