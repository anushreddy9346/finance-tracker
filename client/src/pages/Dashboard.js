import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
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
    <div style={{ fontFamily:'Arial', background:'#f0f2f5', minHeight:'100vh', padding:'20px' }}>
      {/* Navbar */}
      <div style={{ background:'#4f46e5', color:'white', padding:'15px 30px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h2>💰 Finance Tracker</h2>
        <div>
          <span>👤 {user?.name}</span>
          <button onClick={handleLogout} style={{ marginLeft:'20px', background:'white', color:'#4f46e5', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[
          { label:'💰 Total Income',  value: income,  color:'#10b981' },
          { label:'💸 Total Expense', value: expense, color:'#ef4444' },
          { label:'🏦 Balance',       value: balance, color:'#4f46e5' },
        ].map((card, i) => (
          <div key={i} style={{ background:'white', padding:'20px', borderRadius:'12px', flex:'1', minWidth:'150px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', borderTop:`4px solid ${card.color}` }}>
            <p style={{ color:'#666', margin:0 }}>{card.label}</p>
            <h2 style={{ color: card.color, margin:'10px 0 0' }}>₹{card.value.toFixed(2)}</h2>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
        {/* Add Transaction Form */}
        <div style={{ background:'white', padding:'25px', borderRadius:'12px', flex:'1', minWidth:'280px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
          <h3>➕ Add Transaction</h3>
          <select style={inp} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input style={inp} type="number" placeholder="Amount (₹)" value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})} />
          <select style={inp} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input style={inp} placeholder="Note (optional)" value={form.note}
            onChange={e => setForm({...form, note: e.target.value})} />
          <input style={inp} type="date" value={form.date}
            onChange={e => setForm({...form, date: e.target.value})} />
          <button onClick={handleAdd} style={{ width:'100%', padding:'12px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'16px' }}>
            Add Transaction
          </button>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div style={{ background:'white', padding:'25px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
            <h3>📊 Spending by Category</h3>
            <PieChart width={300} height={250}>
              <Pie data={pieData} cx={140} cy={110} outerRadius={90} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val) => `₹${val}`} />
              <Legend />
            </PieChart>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div style={{ background:'white', padding:'25px', borderRadius:'12px', marginTop:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
        <h3>📋 Transaction History</h3>
        {transactions.length === 0 && <p style={{ color:'#999' }}>No transactions yet. Add one above!</p>}
        {transactions.map(t => (
          <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', borderBottom:'1px solid #f0f0f0' }}>
            <div>
              <span style={{ fontSize:'18px' }}>{t.type === 'income' ? '🟢' : '🔴'}</span>
              <strong style={{ marginLeft:'10px' }}>{t.category}</strong>
              <span style={{ color:'#999', marginLeft:'10px', fontSize:'13px' }}>{t.note} · {t.date}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
              <span style={{ color: t.type === 'income' ? '#10b981' : '#ef4444', fontWeight:'bold', fontSize:'18px' }}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount}
              </span>
              <button onClick={() => handleDelete(t.id)} style={{ background:'#fee2e2', color:'#ef4444', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = { width:'100%', padding:'10px', margin:'6px 0', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' };