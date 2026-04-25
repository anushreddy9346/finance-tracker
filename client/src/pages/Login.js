import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-text">
            📄 ExpenseLy
          </div>
          <img src="/expense_illustration.png" alt="Expense Illustration" className="auth-illustration" />
        </div>
        <div className="auth-body">
          <h3 className="auth-title">Sign in</h3>
          {error && <p className="auth-error">{error}</p>}
          
          <div className="auth-input-group">
            <span className="auth-input-icon">✉️</span>
            <input className="auth-input" placeholder="Email" type="email"
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="auth-input-group">
            <span className="auth-input-icon">🔒</span>
            <input className="auth-input" placeholder="Password" type="password"
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          
          <button className="auth-button" onClick={handleSubmit}>Sign in</button>
          <p className="auth-link">I'm new user. <Link to="/register">SIGN UP</Link></p>
        </div>
      </div>
    </div>
  );
}