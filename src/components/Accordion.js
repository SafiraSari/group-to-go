import { useState } from "react";
import "./Accordion.css";

const AccordionItem = ({ title, className = "", children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="accordion-item">
    <button
      className={`accordion ${isOpen ? "active" : ""} ${className}`}
      onClick={toggleAccordion}
    >
      {title}
    </button>
      <div className={`accordion-panel ${isOpen ? "open" : "closed"}`}>
        {children}
      </div>
    </div>
  );
};

const Accordion = ({ items }) => {
  return (
    <>
      {items.map((item, index) => (
  <AccordionItem key={index} title={item.title} className={item.className}>
    {item.content}
  </AccordionItem>
))}
    </>
  );
};

export default Accordion;
