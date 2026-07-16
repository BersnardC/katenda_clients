// components/Nav.tsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LogoutButton from "./LogoutButton";

export default function Nav() {
  const { user } = useAuth();

  return (
    <nav className="p-4 border-b flex items-center">
      <NavLink to="/" className={({ isActive }) => `item_nav ${isActive && 'active'}`}> Home</NavLink>

      {user ? (
        <>
          <NavLink to="/publish" className={({ isActive }) => `item_nav ${isActive && 'active'}`}>Publicar</NavLink>
          <LogoutButton />
        </>
      ) : (
        <>
          <NavLink to="/login" className={({ isActive }) => `item_nav ${isActive && 'active'}`}>Login</NavLink>
          <NavLink to="/register" className={({ isActive }) => `item_nav ${isActive && 'active'}`}>Register</NavLink>
        </>
      )}
    </nav>
  );
}
