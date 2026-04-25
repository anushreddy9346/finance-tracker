import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const COLORS = ['#4b6bfb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
const CATEGORIES = ['Food','Transport','Education','Entertainment','Health','Salary','Other'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type:'expense', amount:'', category:'Food', note:'', date: new Date().toISOString().split('T')[0] });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await API.get('/transactions');
    setTransactions(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const pieData = CATEGORIES.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat && t.type === 'expense')
                        .reduce((s, t) => s + t.amount, 0)
  })).filter(d => d.value > 0);

  const handleAdd = async () => {
    if (!form.amount || !form.date) return alert('Fill all fields!');
    await API.post('/transactions', { ...form, amount: parseFloat(form.amount) });
    setForm({ type:'expense', amount:'', category:'Food', note:'', date: new Date().toISOString().split('T')[0] });
    fetchData();
  };

  const handleDelete = async (id) => {
    await API.delete(`/transactions/${id}`);
    fetchData();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <div className="dash-navbar">
        <h2 className="dash-logo"><span>📄</span> ExpenseLy</h2>
        <div className="dash-user-info">
          <span className="dash-user-name">Hello, {user?.name || 'User'} 👋</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dash-summary">
        <div className="summary-card">
          <div className="summary-icon-wrapper" style={{ background: '#e6f8f1', color: '#10b981' }}>📈</div>
          <div className="summary-info">
            <p>Total Income</p>
            <h2 style={{ color: '#10b981' }}>₹{income.toFixed(2)}</h2>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>📉</div>
          <div className="summary-info">
            <p>Total Expense</p>
            <h2 style={{ color: '#ef4444' }}>₹{expense.toFixed(2)}</h2>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-wrapper" style={{ background: '#ebf0ff', color: '#4b6bfb' }}>🏦</div>
          <div className="summary-info">
            <p>Total Balance</p>
            <h2 style={{ color: '#4b6bfb' }}>₹{balance.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="dash-main">
        {/* Add Transaction Form */}
        <div className="dash-form-section">
          <h3 className="section-title">➕ Add Transaction</h3>
          
          <div className="form-group">
            <select className="dash-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          
          <div className="form-group">
            <input className="dash-input" type="number" placeholder="Amount (₹)" value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})} />
          </div>
          
          <div className="form-group">
            <select className="dash-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <input className="dash-input" placeholder="Note (optional)" value={form.note}
              onChange={e => setForm({...form, note: e.target.value})} />
          </div>
          
          <div className="form-group">
            <input className="dash-input" type="date" value={form.date}
              onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          
          <button onClick={handleAdd} className="btn-add">Add Transaction</button>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="dash-chart-section">
            <h3 className="section-title">📊 Spending by Category</h3>
            <PieChart width={300} height={250}>
              <Pie data={pieData} cx={140} cy={110} outerRadius={90} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="dash-history">
        <h3 className="section-title">📋 Transaction History</h3>
        {transactions.length === 0 && <p style={{ color:'#a3aed1', textAlign: 'center' }}>No transactions yet. Add one above to get started!</p>}
        {transactions.map(t => (
          <div key={t.id} className="history-item">
            <div className="history-left">
              <div className="history-icon" style={{ 
                background: t.type === 'income' ? '#e6f8f1' : '#fef2f2',
                color: t.type === 'income' ? '#10b981' : '#ef4444'
              }}>
                {t.type === 'income' ? '↓' : '↑'}
              </div>
              <div className="history-details">
                <strong>{t.category}</strong>
                <span>{t.note ? `${t.note} · ` : ''}{t.date}</span>
              </div>
            </div>
            <div className="history-right">
              <span className="history-amount" style={{ color: t.type === 'income' ? '#10b981' : '#2b3674' }}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount}
              </span>
              <button onClick={() => handleDelete(t.id)} className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}