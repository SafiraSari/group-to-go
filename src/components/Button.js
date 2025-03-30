import './Button.css';

const Button = ({label}) => {
  return (
    <div>
      <button type="submit" className="button">{label}</button>
    </div>
  )
}

export default Button;
