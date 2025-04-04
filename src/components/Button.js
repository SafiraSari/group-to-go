import './Button.css';

const Button = ({label, type = "button", variant = "yellow", onClick = () => {}}) => {
  return (
    <button type={type} className={`button ${variant}`} onClick={onClick} >
      {label}
    </button>
  )
}

export default Button;
