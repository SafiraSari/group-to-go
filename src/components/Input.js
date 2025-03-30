import './Input.css';

const Input = ({label, type, placeholder, isRequired=false }) => {
  return (
    <div className="input-group">
      <p className="input-label">{label}</p>
      <input type={type} placeholder={placeholder} required={isRequired} />
    </div>
  )
}

export default Input;
