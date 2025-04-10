import React from 'react';
import Button from "../components/Button"
import './Modal.css';

const Modal = ({ onSubmit, onCancel, onClose, children, hideButton = false }) => {
  return (
    <div 
      className='modal-container' 
      onClick={e => {
        if (e.target.className === 'modal-container'){
          onClose();
        }
      }}
    >
      <div className='modal'>
        <div className='modal-header'>
          <p className='close' onClick={() => onClose()}>&times;</p>
        </div>

        <div className='modal-content'>
          {children}
        </div>
      {!hideButton &&(
        <div className='modal-footer'>
          <Button label="Cancel" variant="red" onClick={() => onCancel()} />
          <Button label="Confirm" variant="green" onClick={() => onSubmit()} />
        </div>
      )}
      </div>
    </div>
  );
};

export default Modal;
