import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Dashboard de Gastos</div>
      {currentUser && (
        <div className="navbar-user">
          <span className="user-name">Olá, {currentUser.name}</span>
          <button 
            onClick={handleLogout}
            className="btn-logout"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
