import './Button.css';

const Button = ({label, type = 'button'}) => {
  return (
    <div>
      <button type={type} className="button">{label}</button>
    </div>
  )
}

export default Button;
