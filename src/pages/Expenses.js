import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import "./Expense.css";

const Expenses = () => {
  const username = localStorage.getItem("username");
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [eventName, setEventName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [pricePerPerson, setPricePerPerson] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [userExpenses, setUserExpenses] = useState([]);
  const [expandedExpenseIndex, setExpandedExpenseIndex] = useState(null);

  useEffect(() => {
    if (!modalOpen || !username) return;
    const fetchGroups = async () => {
      try {
        const res = await fetch(`http://localhost:3500/groups/user/${username}`);
        const data = await res.json();
        if (res.ok) setGroups(data);
        else setErrorMessage(data.error || "Failed to load groups.");
      } catch (err) {
        console.error("Error fetching groups:", err);
        setErrorMessage("Error loading groups.");
      }
    };
    fetchGroups();
  }, [modalOpen, username]);

  useEffect(() => {
    if (!groupId) return;
    const fetchGroupMembers = async () => {
      try {
        const res = await fetch(`http://localhost:3500/groups/${groupId}/members`);
        const data = await res.json();
        if (res.ok && data.members) {
          setMembers(data.members);
          setSelectedMembers(data.members);
          setErrorMessage("");
        } else {
          setMembers([]);
          setSelectedMembers([]);
          setErrorMessage(data.error || "No members found.");
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setErrorMessage("Could not fetch members.");
      }
    };
    fetchGroupMembers();
  }, [groupId]);

  useEffect(() => {
    const fetchUserExpenses = async () => {
      try {
        const res = await fetch(`http://localhost:3500/expenses/user/${username}`);
        const data = await res.json();
        if (res.ok) setUserExpenses(data);
        else console.error("Error fetching expenses:", data.error);
      } catch (err) {
        console.error("Error loading expenses:", err);
      }
    };
    if (username) fetchUserExpenses();
  }, [username]);

  const handleCreateClick = () => {
    setModalOpen(true);
    setPricePerPerson(null);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPrice("");
    setEventName("");
    setGroupId("");
    setGroups([]);
    setMembers([]);
    setSelectedMembers([]);
    setPricePerPerson(null);
    setErrorMessage("");
  };
  const deleteExpense = async (expenseId, groupCode) => {
    if (!expenseId || !groupCode) {
      console.error("Missing expense ID or group code");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3500/expenses/${groupCode}/${expenseId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUserExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      } else {
        console.error("Failed to delete expense:", data.error);
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };
  
  const handleCalculate = async () => {
    if (!price || selectedMembers.length === 0 || !eventName || !groupId.trim()) {
      setErrorMessage("All fields are required, including at least one member.");
      return;
    }

    const calculatedPrice = parseFloat(price) / selectedMembers.length;
    setPricePerPerson(calculatedPrice.toFixed(2));
    setErrorMessage("");

    try {
      const res = await fetch("http://localhost:3500/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          amount: parseFloat(price),
          groupId: groupId.trim(),
          createdBy: username,
          splitAmong: selectedMembers
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save expense.");
      } else {
        setUserExpenses((prev) => [...prev, { ...data.expense, id: data.id }]);
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving expense:", err);
      setErrorMessage("Network error while saving expense.");
    }
  };

  const handleToggleMember = (member) => {
    setSelectedMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  const toggleExpenseDetails = (index) => {
    setExpandedExpenseIndex(expandedExpenseIndex === index ? null : index);
  };

  return (
    <>
      <NavBar />
      <div className="expense-container">
        <h1 className="expense-title">EXPENSES</h1>
        <Button label="+ Create New Expense" onClick={handleCreateClick} />

        {modalOpen && (
          <Modal onSubmit={handleCancel} onCancel={handleCancel} onClose={handleCancel}>
            <h1>CREATING NEW EXPENSE</h1>

            <div className="input-wrapper">
              <label htmlFor="group-select">Select Group:</label>
              <select id="group-select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                <option value="">-- Select a group --</option>
                {groups.map((group) => (
                  <option key={group.code} value={group.code}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Event Name" placeholder="Enter event name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            <Input label="Total Amount" type="number" min="0" placeholder="Enter amount" value={price} onChange={(e) => setPrice(e.target.value)} />

            {members.length > 0 && (
              <div className="member-checkboxes">
                <p>Select members to split:</p>
                {members.map((member) => (
                  <label key={member} className="checkbox-member">
                    <input type="checkbox" checked={selectedMembers.includes(member)} onChange={() => handleToggleMember(member)} />
                    {member}
                  </label>
                ))}
              </div>
            )}

            {errorMessage && <p className="error-message" style={{ color: "var(--RED)" }}>{errorMessage}</p>}

            <div className="button-group">
              <Button label="Split Amount" onClick={handleCalculate} disabled={!price || selectedMembers.length === 0} />
            </div>

            {pricePerPerson && (
              <div className="result">
                <h3 className="result-title">Price per Person:</h3>
                <p className="result-price">${pricePerPerson}</p>
              </div>
            )}
          </Modal>
        )}

        <div className="expenses-list">
          <h2>Your Expenses</h2>
          {userExpenses.length === 0 ? (
            <p style={{ color: "var(--GRAY)" }}>No expenses to show.</p>
          ) : (
            userExpenses.map((exp, index) => (
              <div
                key={exp.id || index}
                className="group-card"
                onClick={() => toggleExpenseDetails(index)}
              >
                <div className="group-header">
                  <h3>{exp.eventName}</h3>
                  <span>Total: ${exp.amount}</span>
                </div>

                {expandedExpenseIndex === index && Array.isArray(exp.splitAmong) && (
                  <div className="group-details">
                    <p><strong>Split:</strong> ${parseFloat(exp.amount / exp.splitAmong.length).toFixed(2)} each</p>
                    <ul className="group-members-list">
                      {exp.splitAmong.map((member, i) => (
                        <li key={i} className="group-member-row">
                          <span className="group-member-name">
                            {member} — ${parseFloat(exp.amount / exp.splitAmong.length).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {exp.createdBy === username && (
                      <div className="delete-button-wrapper">
                        <Button
                          label="Delete Expense"
                          variant="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteExpense(exp.id, exp.groupId);
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Expenses;
