import './Input.css';

const Input = ({label, type="text", placeholder, isRequired=false, value, onChange, ...props}) => {
  return (
    <div className="input-group">
      <p className="input-label">{label}</p>
      <input type={type} placeholder={placeholder} required={isRequired} value={value} onChange={onChange} {...props}/>
    </div>
  )
}

export default Input;
