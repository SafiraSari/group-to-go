import './Input.css';

const Input = ({label, type, placeholder, isRequired=false, value, onChange }) => {
  return (
    <div className="input-group">
      <p className="input-label">{label}</p>
      <input type={type} placeholder={placeholder} required={isRequired} value={value} onChange={onChange} />
    </div>
  )
}

export default Input;
