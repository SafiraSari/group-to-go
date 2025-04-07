import './ButtonOption.css';

const ButtonOption = ({label, type = "button", selected = false, onClick = () => {}}) => {
  return (
    <button type={type} className={`button-option ${selected ? 'selected' : ''}`} onClick={onClick} >
      {label}
    </button>
  )
}

export default ButtonOption;
