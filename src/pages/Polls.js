import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Accordion from "../components/Accordion";
import ButtonOption from "../components/ButtonOption";
import activity from "../assets/option_activity.png";
import budget from "../assets/option_budget.png";
import food from "../assets/option_food.png";
import poll from "../assets/option_poll.png";
import time from "../assets/option_time.png";
import "./Polls.css";

const CATEGORIES = [
  { name: "General", icon: poll },
  { name: "Food", icon: food },
  { name: "Activity", icon: activity },
  { name: "Time", icon: time },
  { name: "Budget", icon: budget },
];

const Polls = () => {
  const username = localStorage.getItem("username");

  const [options, setOptions] = useState(["", ""]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [optionError, setOptionError] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [pollName, setPollName] = useState("");
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`http://localhost:3500/groups/user/${username}`);
        const data = await res.json();
        if (res.ok) setGroups(data);
        else console.error("Failed to load groups.");
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    if (username) fetchGroups();
  }, [username]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await fetch(`http://localhost:3500/polls/user/${username}`);
        const data = await res.json();
        if (res.ok) setPolls(data);
        else console.error("Error loading polls.");
      } catch (err) {
        console.error("Error fetching polls:", err);
      }
    };
    if (username) fetchPolls();
  }, [username]);

  const removeOption = () => {
    if (options.length > 2) {
      setOptions(options.slice(0, -1));
      setOptionError("");
    } else {
      setOptionError("Poll must have at least 2 options.");
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
    setOptionError("");
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    if (!pollName || !groupId || !question || options.some(opt => opt.trim() === "")) {
      setOptionError("Please fill all fields and ensure options are not empty.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3500/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollName,
          question,
          notes,
          options,
          groupId,
          category: selectedCategory.name,
          createdBy: username,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPolls((prev) => [...prev, { ...data.poll, id: data.id }]);
        resetModal();
      } else {
        setOptionError(data.error || "Failed to save poll.");
      }
    } catch (err) {
      console.error("Poll creation error:", err);
      setOptionError("Network error.");
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setSelectedCategory(CATEGORIES[0]);
    setOptions(["", ""]);
    setPollName("");
    setQuestion("");
    setNotes("");
    setGroupId("");
    setOptionError("");
  };

  const PollContent = ({ question, category, options, notes }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    return (
      <div>
        <p><strong>Question:</strong> {question}</p>
        <div className="poll-content-category">
          <img src={category.icon} alt={category.name} />
          <span><strong>Category:</strong> {category.name}</span>
        </div>
        <div className="poll-content-options">
          {options.map((option, index) => (
            <ButtonOption
              key={index}
              label={option}
              onClick={() => setSelectedOption(option)}
              selected={selectedOption === option}
            />
          ))}
        </div>
        {notes && <p style={{ fontStyle: "italic", color: "#666" }}>{notes}</p>}
        <Button label="Submit Answer" variant="green" onClick={() => alert(`You voted for: ${selectedOption || "Nothing selected"}`)} />
      </div>
    );
  };

  return (
    <>
      <NavBar />
      <div className="polls-container">
        <div className="header-title">
          <h1>POLLS</h1>
        </div>

        <Button label="+ Create New Poll" onClick={() => setModalOpen(true)} />

        <Accordion
          items={polls.map((poll) => ({
            title: `[Pending] - ${poll.category.toUpperCase()}`,
            content: (
              <PollContent
                question={poll.question}
                category={CATEGORIES.find((c) => c.name === poll.category) || CATEGORIES[0]}
                options={poll.options}
                notes={poll.notes}
              />
            ),
          }))}
        />

        {modalOpen && (
          <Modal onSubmit={handleCreatePoll} onCancel={resetModal} onClose={resetModal}>
            <h1>CREATING NEW POLL</h1>
            <Input label="Enter Poll Name" placeholder="Poll Name" value={pollName} onChange={(e) => setPollName(e.target.value)} />
            <div className="input-wrapper">
              <label>Select Group:</label>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                <option value="">-- Select a group --</option>
                {groups.map((group) => (
                  <option key={group.code} value={group.code}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Poll Question" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <Input label="Additional Notes (optional)" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <h3>Select a Category: <strong>{selectedCategory.name}</strong></h3>
            <div className="option-button">
              {CATEGORIES.map((category, i) => (
                <Button key={i} label={category.name} onClick={() => setSelectedCategory(category)} />
              ))}
            </div>
            <div className="selected-category">
              <img src={selectedCategory.icon} alt={selectedCategory.name} className="category-image" />
            </div>

            <div>
              {options.map((option, index) => (
                <Input
                  key={index}
                  label={`Option ${index + 1}`}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              ))}
              {optionError && <p className="error">{optionError}</p>}
              <div className="option-button">
                <Button label="- Remove Option" onClick={removeOption} />
                <Button label="+ Add Option" onClick={addOption} />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Polls;
