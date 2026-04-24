import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💰 Finance Tracker</h2>
        <h3 style={styles.subtitle}>Login</h3>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Email" type="email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={styles.input} placeholder="Password" type="password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button style={styles.button} onClick={handleSubmit}>Login</button>
        <p style={styles.link}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f2f5' },
  card:      { background:'white', padding:'40px', borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'350px' },
  title:     { textAlign:'center', color:'#4f46e5', marginBottom:'5px' },
  subtitle:  { textAlign:'center', color:'#333', marginBottom:'20px' },
  input:     { width:'100%', padding:'12px', margin:'8px 0', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' },
  button:    { width:'100%', padding:'12px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', marginTop:'10px', fontSize:'16px' },
  error:     { color:'red', textAlign:'center' },
  link:      { textAlign:'center', marginTop:'15px' },
};