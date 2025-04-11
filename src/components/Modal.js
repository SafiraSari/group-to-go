import React, { useState } from 'react';
import Button from "../components/Button";
import Confirmation from "../components/Confirmation";
import './Modal.css';


const Modal = ({ onSubmit, onCancel, onClose, children, hideButton = false }) => {

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmitClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onSubmit();
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };


  return (
    <div 
      className='modal-container' 
      onClick={e => {
        if (e.target.className === 'modal-container') {
          onClose();
        }
      }}
    >
      <div className='modal'>
        <div className='modal-header'>
          <p className='close' onClick={onClose}>&times;</p>
        </div>

        <div className='modal-content'>
          {children}
        </div>
      {!hideButton &&(
        <div className='modal-footer'>
          <Button label="Cancel" variant="red" onClick={onCancel} />
          <Button label="Create Poll" variant="green" onClick={handleSubmitClick} />
        </div>

      )}


        {showConfirmation && (
          <Confirmation
            label="submit"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}

      </div>
    </div>
  );
};

export default Modal;
