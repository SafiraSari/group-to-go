import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Accordion from "../components/Accordion";
import ButtonOption from "../components/ButtonOption";
import activity from "../assets/option_activity.png"
import budget from "../assets/option_budget.png"
import food from "../assets/option_food.png"
import poll from "../assets/option_poll.png"
import time from "../assets/option_time.png"
import "./Polls.css";


const CATEGORIES = [
  { name: "General", icon: poll },
  { name: "Food", icon: food },
  { name: "Activity", icon: activity },
  { name: "Time", icon: time },
  { name: "Budget", icon: budget },
];

const STATUS = [
  "Pending",
  "Completed",
  "Closed",
]

const Polls = () => {
  const [options, setOptions] = useState(["", ""]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
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
    setSelectedCategory(CATEGORIES[0])
    setOptionError("")
  }

  const PollContent = ({ question, category, options, notes }) => {
    const [selectedOption, setSelectedOption] = useState(null);
  
    return (
      <div>
        <p><strong>Question:</strong> {question}</p>
        <div className="poll-content-category">
          <img src={category.icon} alt={category.name}/>
          <span><strong>Category:</strong> {category.name}</span>
        </div>
  
        <div className="poll-content-options">
          {options.map((option, index) => (
            <ButtonOption key={index} label={option} onClick={() => setSelectedOption(option)} selected={selectedOption === option} />
          ))}
        </div>
  
        {notes && <p style={{ fontStyle: "italic", color: "#666" }}>{notes}</p>}

        <Button label="Submit Answer" variant="green" onClick={() => alert(`You voted for: ${selectedOption || "Nothing selected"}`)}/>
  
      </div>
    );
  };
  
  const polls = [
    {
      title: "[Pending] - FOOD",
      content: (
        <PollContent
          question="What should we eat?"
          category={{ name: "Food", icon: food }}
          options={["Burgers", "Sushi", "Pizza", "Ramen"]}
        />
      ),
    },
    {
      title: "[Pending] - ACTIVITY",
      content: (
        <PollContent
          question="What should we do?"
          category={{ name: "Activity", icon: activity }}
          options={["Picnic", "Escape Room", "Volleyball", "Walk around lake"]}
          notes="SPRING IS COMING = SUNNY WEATHER!"
        />
      ),
    },
  ];
  
  return (
    <>
      <NavBar />
      <div className="polls-container">

        <div className="header-title">
          <h1>POLLS</h1>
        </div>

        <div>
          <Button label="+ Create New Poll" onClick={() => setModalOpen(true)} />
        </div>
        
        <div>
          <Accordion items={polls} />
        </div>
        
        {modalOpen && (        
          <Modal onSubmit={handleButtonClick} onCancel={handleButtonClick} onClose={handleButtonClick} >
            <h1>CREATING NEW POLL</h1>
            <Input label="Poll Name" placeholder="Poll Name" isRequired />

            <Input label="Poll Question" placeholder="Enter a question" isRequired />
            
            <h3>Select a Category: <span style={{ fontWeight: 'bold' }}>{selectedCategory.name}</span></h3>
            <div className="option-button">
              {CATEGORIES.map((category, index) => (
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
      </div>
    </>
  );
};

export default Polls;
