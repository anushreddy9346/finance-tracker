import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const COLORS = ['#4b6bfb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Education', 'Entertainment', 'Health', 'Shopping', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Other'];

const getIconForCategory = (cat) => {
  const map = {
    'Food': '🍔', 'Transport': '🚗', 'Education': '📚', 'Entertainment': '🎬',
    'Health': '💊', 'Salary': '💰', 'Freelance': '💻', 'Investments': '📈', 'Shopping': '🛍️', 'Other': '🏷️'
  };
  return map[cat] || '🏷️';
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type:'expense', amount:'', category:'Food', note:'', date: new Date().toISOString().split('T')[0] });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const pieData = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat && t.type === 'expense')
                        .reduce((s, t) => s + t.amount, 0)
  })).filter(d => d.value > 0);

  const handleAdd = async () => {
    if (!form.amount || !form.date) return alert('Fill all fields!');
    await API.post('/transactions', { ...form, amount: parseFloat(form.amount) });
    setForm({ type:'expense', amount:'', category:'Food', note:'', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    await API.delete(`/transactions/${id}`);
    fetchData();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <div className="dash-sidebar">
        <div className="sidebar-logo">
          <span>📄</span> ExpenseLy
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span>🏠</span> Dashboard
          </li>
          <li className={`sidebar-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            <span>💸</span> Transactions
          </li>
          <li className={`sidebar-item ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>
            <span>📊</span> Statistics
          </li>
        </ul>
        <div className="sidebar-bottom">
          <div className="sidebar-item" onClick={handleLogout}><span>🚪</span> Logout</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="dash-main-content">
        <div className="dash-header">
          <div className="dash-greeting">
            <h1>
              {activeTab === 'dashboard' ? `Good Morning, ${user?.name || 'User'}` : 
               activeTab === 'transactions' ? 'All Transactions' : 
               activeTab === 'statistics' ? 'Spending Statistics' : 'Section'}
            </h1>
            <p>
              {activeTab === 'dashboard' ? 'Welcome back to your dashboard!' : 
               activeTab === 'transactions' ? 'View and manage all your past transactions here.' : 
               activeTab === 'statistics' ? 'Detailed breakdown of your financial activity.' : 'Under development.'}
            </p>
          </div>
          <div className="dash-header-right">
            <span style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1d2d', background: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              👤 {user?.name || 'User'}
            </span>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="dash-grid">
            {/* LEFT COLUMN */}
            <div className="dash-left-col">
              {/* Credit Card (Total Balance) */}
              <div className="credit-card">
                <div className="card-top">
                  <span>ExpenseLy Card</span>
                  <span>💳</span>
                </div>
                <div className="card-chip"></div>
                <p className="card-balance">₹{balance.toFixed(2)}</p>
                <div className="card-bottom">
                  <span>TOTAL BALANCE</span>
                  <span>{new Date().getMonth()+1}/{new Date().getFullYear().toString().substr(-2)}</span>
                </div>
              </div>
              
              {/* Transactions History */}
              <div className="dash-history">
                <div className="section-header">
                  <h3>TRANSACTIONS HISTORY</h3>
                  <span style={{fontSize:'0.8rem', color:'#6a7187', cursor:'pointer'}} onClick={() => setActiveTab('transactions')}>See All ▾</span>
                </div>
                <div className="history-list">
                  {transactions.length === 0 && <p style={{color:'#8a92a6'}}>No recent transactions.</p>}
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="history-item">
                      <div className="history-item-left">
                        <div className="history-icon" style={{background: t.type==='income'?'#e3f2fd':'#ffebee'}}>
                          {getIconForCategory(t.category)}
                        </div>
                        <div className="history-info">
                          <strong>{t.category}</strong>
                          <span>{t.date}</span>
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center'}}>
                        <span className={`history-amount ${t.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount}
                        </span>
                        <button className="delete-btn" onClick={() => handleDelete(t.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="dash-right-col">
              {/* Spending Statistics Summary */}
              <div className="spending-stats">
                <div className="section-header">
                  <h3>SPENDING STATISTICS</h3>
                </div>
                <div className="stats-cards">
                  <div className="stat-card">
                    <h4>Total Income</h4>
                    <div className="stat-value">₹{income.toFixed(2)}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Total Expense</h4>
                    <div className="stat-value">₹{expense.toFixed(2)}</div>
                  </div>
                  <button className="stat-add-btn" onClick={() => setShowForm(!showForm)}>
                    <span style={{fontSize:'1.5rem', marginBottom:'5px'}}>+</span>
                    Add
                  </button>
                </div>
              </div>

              <div className="bottom-section">
                {/* Form Section */}
                {showForm && (
                  <div className="form-container">
                    <div className="section-header">
                      <h3>ADD TRANSACTION</h3>
                    </div>
                    <select className="form-input" value={form.type} onChange={e => {
                      const newType = e.target.value;
                      setForm({...form, type: newType, category: newType === 'income' ? 'Salary' : 'Food'});
                    }}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    <input className="form-input" type="number" placeholder="Amount (₹)" value={form.amount}
                      onChange={e => setForm({...form, amount: e.target.value})} />
                    <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input className="form-input" placeholder="Note (optional)" value={form.note}
                      onChange={e => setForm({...form, note: e.target.value})} />
                    <input className="form-input" type="date" value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})} />
                    <button onClick={handleAdd} className="form-btn">Save</button>
                  </div>
                )}

                {/* Chart Section */}
                <div className="chart-container">
                  <div className="section-header">
                    <h3>EXPENSES CLASSIFICATION</h3>
                  </div>
                  {pieData.length > 0 ? (
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p style={{color:'#8a92a6'}}>No expenses to chart yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'transactions' ? (
          <div className="dash-history" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <h3>ALL TRANSACTIONS</h3>
            </div>
            <div className="history-list" style={{ overflowY: 'auto' }}>
              {transactions.length === 0 && <p style={{color:'#8a92a6'}}>No transactions found.</p>}
              {transactions.map(t => (
                <div key={t.id} className="history-item" style={{ padding: '20px', borderBottom: '1px solid #f1f5fa' }}>
                  <div className="history-item-left">
                    <div className="history-icon" style={{background: t.type==='income'?'#e3f2fd':'#ffebee'}}>
                      {getIconForCategory(t.category)}
                    </div>
                    <div className="history-info">
                      <strong>{t.category}</strong>
                      <span>{t.note ? `${t.note} · ` : ''}{t.date}</span>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center'}}>
                    <span className={`history-amount ${t.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount}
                    </span>
                    <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'statistics' ? (
          <div className="dash-statistics" style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
            <div className="section-header">
              <h3>YOUR SPENDING STATISTICS</h3>
            </div>
            
            <div className="stats-cards" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#6a7187' }}>Total Income</h4>
                <h2 style={{ margin: 0, color: '#10b981', fontSize: '2rem' }}>₹{income.toFixed(2)}</h2>
              </div>
              <div className="stat-card" style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#6a7187' }}>Total Expense</h4>
                <h2 style={{ margin: 0, color: '#ef4444', fontSize: '2rem' }}>₹{expense.toFixed(2)}</h2>
              </div>
              <div className="stat-card" style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#6a7187' }}>Net Balance</h4>
                <h2 style={{ margin: 0, color: '#4b6bfb', fontSize: '2rem' }}>₹{balance.toFixed(2)}</h2>
              </div>
            </div>

            <div className="chart-container" style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 30px', color: '#1a1d2d', textTransform: 'uppercase', fontSize: '1rem', width: '100%' }}>Expense Breakdown by Category</h3>
              {pieData.length > 0 ? (
                <div style={{ width: '100%', height: 400, maxWidth: '700px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} innerRadius={100} outerRadius={150} paddingAngle={5} dataKey="value" stroke="none" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={{color:'#8a92a6'}}>Not enough data to display statistics. Add some expenses!</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Coming Soon</h3>
            <p style={{ color: '#6a7187' }}>The {activeTab} section is currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}