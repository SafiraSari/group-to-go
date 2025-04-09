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
  
  // Days and time slots for the grid
  const days = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri","Sat",];
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 9); // 9AM to 8PM
  
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
  }, []);
  
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
      <div className="schedule-container">
        <div className="header-title">
          <h1>SCHEDULE</h1>
        </div>
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
        
        {/* Schedule grid */}
        <div className="schedule-grid">
          <table>
            <thead>
              <tr>
                <th className="time-header"></th>
                {days.map(day => (
                  <th key={day}>{day}</th>
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
            <h1>CREATE NEW SCHEDULE</h1>
            <Input 
              label="UserId" 
              placeholder="Enter user ID" 
              value={userID}
              onChange={(e) => setEventTitle(e.target.value)}
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
              <Input label="Start Date" type="week" />
            </div>
            
            <h3>Time Range</h3>
            <div className="time-range">
              <Input label="Start Time" type="time" defaultValue="09:00" />
              <Input label="End Time" type="time" defaultValue="17:00" />
            </div>
            
            <Input label="Notes" type="text" placeholder="Enter any additional details..." />
          </Modal>
        )}
      </div>
    </>
  );
};

export default Schedule;