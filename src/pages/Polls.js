import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import activity from "../assets/option_activity.png"
import budget from "../assets/option_budget.png"
import food from "../assets/option_food.png"
import poll from "../assets/option_poll.png"
import time from "../assets/option_time.png"
import "./Polls.css";

const categories = [
  { name: "General", icon: poll },
  { name: "Food", icon: food },
  { name: "Activity", icon: activity },
  { name: "Time", icon: time },
  { name: "Budget", icon: budget },
];

const Polls = () => {
  const [options, setOptions] = useState(["", ""]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [modalOpen, setModalOpen] = useState(false)
  const [optionError, setOptionError] = useState("");

  const removeOption = () => {
    if (options.length > 2) {
      setOptions(options.slice(0, -1));
      setOptionError("");
    } else {
      setOptionError("Unable to remove option - Poll must have at least 2 options.")
    }
  };
  const addOption = () => {
    setOptions([...options, ""]);
    setOptionError("");
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleButtonClick = () => {
    setModalOpen(false)
    setSelectedCategory(categories[0])
    setOptionError("")
  }

  return (
    <>
      <NavBar />
      <div className="polls-container">
        {modalOpen && (        
          <Modal onSubmit={handleButtonClick} onCancel={handleButtonClick} onClose={handleButtonClick} >

            <h1>CREATING NEW POLL</h1>
            <Input label="Poll Name" placeholder="Poll Name" isRequired />
            
            <h3>Select a Category: <span style={{ fontWeight: 'bold' }}>{selectedCategory.name}</span></h3>
            <div className="option-button">
              {categories.map((category, index) => (
                <Button key={index} label={category.name} onClick={() => setSelectedCategory(category)}/>
              ))}
            </div>
            
            <div className="selected-category">
              <img
                src={selectedCategory.icon}
                alt={selectedCategory.name}
                className="category-image"
              />
            </div>
          
            <div className="">
              {options.map((option, index) => (
                <Input key={index} label={`Option ${index + 1}`} placeholder={`Option ${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)}/>
              ))}
              {optionError && <p className="error" >{optionError}</p>}
              <div className="option-button">
                <Button label="- Remove Option" onClick={removeOption}  />
                <Button label="+ Add Option" onClick={addOption} />
              </div>
            </div>

            <Input label="Notes" type="text" placeholder="Enter any additional details..." />
          </Modal>
        )}
        <Button label="+ Create New Poll" onClick={() => setModalOpen(true)} />
      </div>
    </>
  );
};

export default Polls;
