import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import "./Schedule.css";

const Schedule = () => {
  // State for managing users and their availability
  const [users, setUsers] = useState([
    { id: 1, name: "User 1", color: "#3498db" },
    { id: 2, name: "User 2", color: "#e74c3c" }
  ]);
  const [currentUser, setCurrentUser] = useState(1);
  const [newUserName, setNewUserName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [userID, setUserID] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekDateRange, setWeekDateRange] = useState("");
  
  // Days and time slots for the grid
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 9); // 9AM to 8PM
  
  // State to hold the dates for the current week
  const [weekDates, setWeekDates] = useState([]);
  
  // Initialize availability grid for all users
  const [availability, setAvailability] = useState({});
  
  useEffect(() => {
    // Initialize empty availability data structure
    const initialAvailability = {};
    users.forEach(user => {
      initialAvailability[user.id] = {};
      days.forEach(day => {
        initialAvailability[user.id][day] = {};
        timeSlots.forEach(time => {
          initialAvailability[user.id][day][time] = false;
        });
      });
    });
    setAvailability(initialAvailability);
    
    // Set default week to current week
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
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
    
    // Parse the week string (format: YYYY-WXX)
    const year = parseInt(weekString.substring(0, 4));
    const weekNum = parseInt(weekString.substring(6));
    
    // Calculate the first day of the year
    const firstDayOfYear = new Date(year, 0, 1);
    
    // Calculate days to add to get to the first day of the selected week
    // Week 1 is the week with the first Thursday of the year (ISO 8601)
    const dayOffset = (weekNum - 1) * 7;
    
    // Find the first day of the selected week (should be a Monday per ISO 8601)
    const firstDayOfWeek = new Date(firstDayOfYear);
    firstDayOfWeek.setDate(firstDayOfYear.getDate() + dayOffset - firstDayOfYear.getDay() + 1);
    
    // If firstDayOfYear is a Sunday, we need to adjust
    if (firstDayOfYear.getDay() === 0) {
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 7);
    }
    
    // Create an array of dates for the week starting from Sunday
    const dates = [];
    const sundayOfWeek = new Date(firstDayOfWeek);
    sundayOfWeek.setDate(sundayOfWeek.getDate() - 1); // Go back to Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sundayOfWeek);
      date.setDate(sundayOfWeek.getDate() + i);
      dates.push(date);
    }
    
    setWeekDates(dates);
    
    // Create a formatted date range string for the title
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
  
  // Handle week selection change
  const handleWeekChange = (e) => {
    const week = e.target.value;
    setSelectedWeek(week);
    updateWeekDates(week);
  };
  
  // Format time for compact display
  const formatTime = (hour) => {
    if (hour === 12) return "12pm";
    return hour < 12 ? `${hour}am` : `${hour-12}pm`;
  };
  
  // Toggle availability for a specific time slot
  const toggleAvailability = (day, time) => {
    console.log(`Toggling availability for ${day} at ${time}`);
    setAvailability(prev => {
      // Create a deep copy to ensure state update
      const newAvailability = JSON.parse(JSON.stringify(prev));
      
      // Initialize if needed
      if (!newAvailability[currentUser]) {
        newAvailability[currentUser] = {};
      }
      if (!newAvailability[currentUser][day]) {
        newAvailability[currentUser][day] = {};
      }
      
      // Toggle the value
      newAvailability[currentUser][day][time] = !newAvailability[currentUser][day][time];
      return newAvailability;
    });
  };
  
  // Add a new user
  const addUser = () => {
    if (!newUserName.trim()) return;
    
    const newUser = {
      id: users.length + 1,
      name: newUserName,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    
    setUsers([...users, newUser]);
    setNewUserName("");
    
    // Initialize availability for new user
    setAvailability(prev => {
      const newAvailability = {...prev};
      newAvailability[newUser.id] = {};
      days.forEach(day => {
        newAvailability[newUser.id][day] = {};
        timeSlots.forEach(time => {
          newAvailability[newUser.id][day][time] = false;
        });
      });
      return newAvailability;
    });
  };
  
  // Determine cell styling based on availability
  const getCellStyle = (day, time) => {
    // Check if the current user has marked this slot
    const isSelected = availability[currentUser]?.[day]?.[time] === true;
    
    // Count how many users are available at this time
    const availableUsers = users.filter(user => 
      availability[user.id]?.[day]?.[time] === true
    ).length;
    
    let backgroundColor = "#f4f4f4"; // No availability
    
    if (availableUsers > 0) {
      if (availableUsers === users.length) {
        backgroundColor = "#81c784"; // Full availability
      } else {
        backgroundColor = "#ffcc80"; // Partial availability
      }
    }
    
    return {
      backgroundColor,
      border: isSelected ? "2px solid #2196f3" : "1px solid #ddd",
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
        
        {/* User selection buttons */}
        <div className="user-selection">
          <h3>Select User:</h3>
          <div className="option-button">
            {users.map(user => (
              <Button 
                key={user.id}
                label={user.name}
                onClick={() => setCurrentUser(user.id)}
                className={currentUser === user.id ? "active" : ""}
              />
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="schedule-instructions">
          <p>Click on time slots to mark your availability</p>
        </div>
        
        {/* Week title */}
        {weekDateRange && (
          <div className="week-title">
            <h2>{weekDateRange}</h2>
          </div>
        )}
        
        {/* Schedule grid */}
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
        
        {/* Legend */}
        <div className="schedule-legend">
          <h3>Legend:</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color no-availability"></div>
              <span>No availability</span>
            </div>
            <div className="legend-item">
              <div className="legend-color partial-availability"></div>
              <span>Some availability</span>
            </div>
            <div className="legend-item">
              <div className="legend-color full-availability"></div>
              <span>Everyone available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color user-selected"></div>
              <span>Your selection</span>
            </div>
          </div>
        </div>
        
        {/* Create Schedule Modal */}
        {modalOpen && (
          <Modal 
            onSubmit={handleModalSubmit} 
            onCancel={handleModalCancel} 
            onClose={handleModalCancel}
          >
            <div className="modal-form">
              <h1>CREATE NEW SCHEDULE</h1>
              <Input 
                label="UserId" 
                placeholder="Enter user ID" 
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                isRequired 
              />

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