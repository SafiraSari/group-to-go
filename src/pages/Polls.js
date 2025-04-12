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
  const [loading, setLoading] = useState(false);
  const [pollsUpdated, setPollsUpdated] = useState(false);

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

  // Fetch polls function
  const fetchPolls = async () => {
    setLoading(true);
    try {
      console.log("Fetching polls for user:", username);
      const res = await fetch(`http://localhost:3500/polls/user/${username}`);
      const data = await res.json();
      console.log("Polls data received:", data);
      
      if (res.ok && Array.isArray(data)) {
        if (data.length === 0) {
          console.log("No polls found for this user");
          setPolls([]);
        } else {
          // Transform the data properly
          data.sort((a, b) => b.createdAt - a.createdAt);
          const accordionItems = data.map((poll) => ({
            title: `[${poll.status === 'completed' ? 'Completed' : 'Pending'}] - ${poll.category.toUpperCase()} - ${poll.pollName}`,
            content: (
              <PollContent
                poll={poll}
                category={CATEGORIES.find((c) => c.name === poll.category) || CATEGORIES[0]}
                onVoteSubmitted={() => setPollsUpdated((prev) => !prev)}
              />
            ),
            className: poll.status === 'completed' ? 'accordion-completed' : ''
          }));
          
          setPolls(accordionItems);
        }
      } else {
        console.error("Error loading polls:", data.error || "Unknown error");
        setPolls([]);
      }
    } catch (err) {
      console.error("Error fetching polls:", err);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchPolls();
    }
  }, [username, pollsUpdated]);

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
      console.log("Creating poll with data:", { 
        pollName, question, notes, options, groupId, category: selectedCategory.name, createdBy: username 
      });
      
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
          status: "pending", // Initialize with pending status
          votes: {} // Initialize with empty votes object
        }),
      });

      const data = await res.json();
      console.log("Poll creation response:", data);
      
      if (res.ok) {
        resetModal();
        // Trigger refetch
        setPollsUpdated(prev => !prev);
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

  const PollContent = ({ poll, category, onVoteSubmitted }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [voteSubmitting, setVoteSubmitting] = useState(false);
    const [voteError, setVoteError] = useState("");
    
    // Pre-select the option if user has already voted
    useEffect(() => {
      if (poll.votes && poll.votes[username]) {
        setSelectedOption(poll.votes[username]);
      }
    }, [poll]);
    
    const handleVote = async () => {
      if (!selectedOption) {
        setVoteError("Please select an option to vote!");
        return;
      }

      setVoteSubmitting(true);
      setVoteError("");

      try {
        const res = await fetch(`http://localhost:3500/polls/${poll.id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username, 
            option: selectedOption,
            groupId: poll.groupId
          }),
        });

        const data = await res.json();
        
        if (res.ok) {
          console.log("Vote submitted successfully:", data);
          if (onVoteSubmitted) onVoteSubmitted();
        } else {
          setVoteError(data.error || "Failed to submit vote.");
        }
      } catch (err) {
        console.error("Error submitting vote:", err);
        setVoteError("Network error while submitting vote.");
      } finally {
        setVoteSubmitting(false);
      }
    };
    
    // Render different content based on poll status
    if (poll.status === 'completed') {
      return (
        <div className={`poll-content ${poll.status === 'completed' ? 'completed' : ''}`}>
          <p><strong>Question:</strong> {poll.question}</p>
          <div className="poll-content-category">
            <img src={category.icon} alt={category.name} />
            <span><strong>Category:</strong> {category.name}</span>
          </div>
    
          <h3>Results:</h3>
          <div className="poll-results">
            {poll.options.map((option, index) => {
              const votes = poll.results ? (poll.results[option] || 0) : 0;
              const percentage = poll.totalVotes > 0 
                ? Math.round((votes / poll.totalVotes) * 100) 
                : 0;
    
              return (
                <div key={index} className="poll-result-item">
                  <div className="poll-result-option">
                    {option} {poll.votes && poll.votes[username] === option && " (Your Vote)"}
                  </div>
                  <div className="poll-result-bar-container">
                    <div className="poll-result-bar" style={{ width: `${percentage}%` }}></div>
                    <span className="poll-result-percentage">{percentage}% ({votes} votes)</span>
                  </div>
                </div>
              );
            })}
          </div>
    
          {poll.notes && <p style={{ fontStyle: "italic", color: "#888", marginTop: "1rem" }}>Note: {poll.notes}</p>}
          <p>All {poll.totalMembers} group members have voted.</p>
        </div>
      );
    } else {
      return (
        <div className={`poll-content ${poll.status === 'completed' ? 'completed' : ''}`}>
          <p><strong>Question:</strong> {poll.question}</p>
          <div className="poll-content-category">
            <img src={category.icon} alt={category.name} />
            <span><strong>Category:</strong> {category.name}</span>
          </div>
    
          <div className="poll-content-options">
            {poll.options.map((option, index) => (
              <ButtonOption
                key={index}
                label={option}
                onClick={() => setSelectedOption(option)}
                selected={selectedOption === option}
                disabled={poll.hasVoted || voteSubmitting}
              />
            ))}
          </div>
    
          {poll.notes && <p style={{ fontStyle: "italic", color: "#888", marginTop: "1rem" }}>Note: {poll.notes}</p>}
    
          {voteError && <p className="error">{voteError}</p>}
    
          {poll.hasVoted ? (
            <p>You already voted for: <strong>{poll.votes[username]}</strong></p>
          ) : (
            <Button 
              label={voteSubmitting ? "Submitting..." : "Submit Answer"} 
              variant="green" 
              onClick={handleVote}
              disabled={voteSubmitting} 
            />
          )}
    
          <p className="poll-vote-count">
            {poll.totalVotes} of {poll.totalMembers} members have voted.
          </p>
        </div>
      );
    }
  };

  return (
    <>
      <NavBar />
      <div className="polls-container">
        <div className="header-title">
          <h1>POLLS</h1>
        </div>
        <div className="create-poll-button-wrapper">
        <Button label="+ Create New Poll" onClick={() => setModalOpen(true)} />
        </div>
        {loading ? (
          <p>Loading polls...</p>
        ) : polls.length > 0 ? (
          <Accordion items={polls} />
        ) : (
          <p className="no-polls-message">No polls found. Create a new poll!</p>
        )}

        {modalOpen && (
          <Modal onSubmit={handleCreatePoll} onCancel={resetModal} onClose={resetModal}>
            <h1>CREATING NEW POLL</h1>
            <Input label="Enter Poll Name" placeholder="Poll Name" value={pollName} onChange={(e) => setPollName(e.target.value)} />
            <div className="input-wrapper">
            <h3><label className="modal-label">Select Group:</label></h3>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                <option value="" disabled hidden>-- Select a group --</option>
                {groups.map((group) => (
                  <option key={group.code} value={group.code}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Poll Question" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <Input label="Additional Notes (optional)" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <label className="modal-label"><h3>
              Select a Category: <strong>{selectedCategory.name}</strong></h3>
              </label>
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
