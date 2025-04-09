import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import "./Expense.css";

const Expenses = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [eventName, setEventName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [pricePerPerson, setPricePerPerson] = useState(null);

  const handleCreateClick = () => {
    setModalOpen(true);
    setPricePerPerson(null); // Calculation is reset when opening the modal
  };

  const handleCalculate = () => {
    if (!price) return; // Can't calculate without price
    const calculatedPrice = parseFloat(price) / peopleCount;
    setPricePerPerson(calculatedPrice.toFixed(2));
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPrice("");
    setPeopleCount(1);
    setPricePerPerson(null);
  };
  const handlePeopleChange = (e) => {
    // Ensures it's a positive integer
    const value = e.target.value.includes('.') 
      ? Math.floor(parseFloat(e.target.value))
      : parseInt(e.target.value);
    
    setPeopleCount(isNaN(value) ? 1 : Math.max(1, value));
  };

  return (
    <>
      <NavBar />
      <div className="expense-container">
        <div>
          <h1 className="expense-title">EXPENSES</h1>
        </div>
        <Button label="+ Create New Expense" onClick={handleCreateClick} />
        {modalOpen && (        
          <Modal 
            onSubmit= {handleCancel}
            onCancel={handleCancel} 
            onClose={handleCancel}
            submitLabel={pricePerPerson ? "Close" : "Calculate"}
          >
            <h1>CREATING NEW EXPENSE</h1>
            <Input label="Enter the Group ID" placeholder="GroupID" value={groupId} onChange={(e) => setGroupId(e.target.value)}/>
            <Input label="Enter the Event Name" placeholder="Name" value={eventName} onChange={(e) => setEventName(e.target.value)}/>
            <Input label="Enter the Price" type="number" min="0" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)}/>
            
            <div className="people-count">
              <Input label="Enter the Number of People" onChange={handlePeopleChange} type="number" min="1" placeholder="Number of people" value={peopleCount}/>
            </div>
            <div className="button-group">
              <Button label="Calculate" onClick={handleCalculate} disabled={!price}
              />
            </div>
            {pricePerPerson && (
              <div className="result">
                <h3 className="result-title">Price per Person:</h3>
                <p className="result-price">${pricePerPerson}</p>
              </div>
            )}
          </Modal>
        )}
      </div>
    </>
  );
};

export default Expenses;