import './Input.css';
const Input = ({label, type="text", placeholder, isRequired=false, value, onChange, ...props}, ref) => {
  return (
    <div className="input-group">
      <p className="input-label">{label}</p>
      <input ref={ref} type={type} placeholder={placeholder} required={isRequired} value={value} onChange={onChange} {...props}/>
    </div>
  )
}

export default Input; 
