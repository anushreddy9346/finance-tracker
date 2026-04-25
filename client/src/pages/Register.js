import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      alert('Registered successfully! Please login.');
      navigate('/login');
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
          <h3 className="auth-title">Sign up</h3>
          {error && <p className="auth-error">{error}</p>}
          
          <div className="auth-input-group">
            <span className="auth-input-icon">👤</span>
            <input className="auth-input" placeholder="Name"
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="auth-input-group">
            <span className="auth-input-icon">🔒</span>
            <input className="auth-input" placeholder="Password" type="password"
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="auth-input-group">
            <span className="auth-input-icon">✉️</span>
            <input className="auth-input" placeholder="Email" type="email"
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          
          <button className="auth-button" onClick={handleSubmit}>Sign up</button>
          <p className="auth-link">Already have an account. <Link to="/login">SIGN IN</Link></p>
        </div>
      </div>
    </div>
  );
}