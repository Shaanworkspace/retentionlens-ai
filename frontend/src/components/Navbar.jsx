import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Navbar() {
  const { isAuth, logout } = useAuth();
  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">ChurnSense</Link>
      <div className="flex gap-4 items-center">
        {isAuth ? (
          <>
            <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
            <Link to="/predict" className="hover:text-blue-300">Predict</Link>
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-300">Login</Link>
            <Link to="/signup" className="bg-blue-600 px-4 py-1 rounded">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
