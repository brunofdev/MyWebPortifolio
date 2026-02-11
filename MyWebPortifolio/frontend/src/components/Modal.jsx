import ReactDOM from "react-dom";
import "../styles/modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="container-modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body // garante que fica por cima de tudo
  );
};

export default Modal;
