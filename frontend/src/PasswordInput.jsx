import { useState } from "react";

// A password field with an eye button that shows or hides the password.
// Each page passes its own CSS classes, so every page can style it differently.
function PasswordInput({ id, value, onChange, placeholder, inputClassName, buttonClassName }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-group">
      <input type={showPassword ? "text" : "password"} id={id} className={"form-control " + inputClassName}
             placeholder={placeholder} value={value} onChange={onChange} required />

      <button type="button" className={"btn " + buttonClassName}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}>
        {/* Simple eye icon; a line is drawn across it while the password is visible */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
          {showPassword && <line x1="3" y1="3" x2="21" y2="21" />}
        </svg>
      </button>
    </div>
  );
}

export default PasswordInput;
