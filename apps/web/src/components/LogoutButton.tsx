import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="mr-4 cursor-pointer bg-red-300 rounded-sm py-1 px-2 hover:bg-red-500 hover:text-white">
      Logout
    </button>
  );
}
