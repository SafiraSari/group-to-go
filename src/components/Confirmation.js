import './Confirmation.css';
import Button from './Button.js';

const Confirmation = ({label, onCancel, onConfirm  }) => {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-box">
        <p className="confirmation-text">Are you sure you want to {label}?</p>
        <div className="confirmation-buttons">
          <Button label={"No"} variant="red" onClick={onCancel} />
          <Button label={"Yes"} variant="green" onClick={onConfirm} />
        </div>
      </div>
    </div>
  )
}

export default Confirmation;
