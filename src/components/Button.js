import './Button.css';

const Button = ({label, onClick, type = 'button'}) => {
  return (
    <div>
      <button type={type} className="button" onClick={onClick}>{label}</button>
    </div>
  )
}

export default Button;
