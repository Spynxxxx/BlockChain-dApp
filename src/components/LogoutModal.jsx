import "../styles/LogoutModal.css";
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="logout-background" onClick={onCancel}>
      <div className="logout-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="logout-title">Disconnecting?</h2>
        <p className="logout-description">
          Are you sure you want to Disconnect?
        </p>
        <div className="buttons">
          <button className="logout-yes" onClick={onConfirm}>
            Yes
          </button>
          <button className="logout-no" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
export default LogoutModal;
