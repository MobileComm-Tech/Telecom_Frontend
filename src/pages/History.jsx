import { useState, useEffect } from 'react'
import axios from 'axios'
import './History.css'

const API = 'http://localhost:5000/api'

export default function History() {
  const [validations, setValidations] = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('ALL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hRes, sRes] = await Promise.all([
          axios.get(`${API}/history`),
          axios.get(`${API}/stats`),
        ])
        setValidations(hRes.data.validations || [])
        setStats(sRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  const downloadHistoryPDF = async (id,category,category_full_name) => {
    try {
      // const res = await axios.post(`${API}/report/generate`, {
      //   result: record.result_json,
      //   image: record.real_image,
      // }, { responseType: 'blob' });
      const res = await axios.get(`${API}/report/generate/${id}`, {responseType: 'blob'});

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Report_${category}_${category_full_name}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download report. Make sure backend is running.');
    }
  };

  const CATS = ['ALL']
  const filtered = filter === 'ALL'
    ? validations
    : validations.filter(v => v.category === filter)

  return (
    <div className="history-page">

      <div className="page-header">
        <span className="mono title-tag">&lt;HISTORY&gt;</span>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 700, margin: '0.2rem 0 0.4rem' }}>
          Validation History
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>All past site inspection validations</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num mono">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-pass">
            <span className="stat-num mono">{stats.passed}</span>
            <span className="stat-label">Passed</span>
          </div>
          <div className="stat-card stat-fail">
            <span className="stat-num mono">{stats.failed}</span>
            <span className="stat-label">Failed</span>
          </div>
          <div className="stat-card">
            <span className="stat-num mono">{stats.pass_rate}%</span>
            <span className="stat-label">Pass Rate</span>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-row">
        {CATS.map(c => (
          <button
            key={c}
            className={`filter-btn ${filter === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
          >{c}</button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state mono">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <div>No validations found</div>
        </div>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th className="mono">ID</th>
                <th>Category</th>
                {/* <th>Filename</th> */}
                <th>Tool Result</th>
                <th>User Result</th>
                <th>User Remars</th>
                <th>UST ID</th>
                <th className="mono">Date</th>
                {/* <th >Report</th> */}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td className="mono" style={{ color: 'var(--text-dim)' }}>#{v.id}</td>
                  <td>
                    <span className="badge badge-pass mono">{v.category}</span>
                  </td>
                  
                  <td>
                    <span className={`badge badge-${v.result_json.success === 'PASS' ? 'pass' : 'fail'}`}>
                      {v.result_json.success}
                    </span>
                  </td>
                  <td className="filename-cell">{v.result}</td>
                  <td className="filename-cell">{v.remarks}</td>
                  <td className="filename-cell">{v.uid}</td>
                  <td className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {new Date(v.created_at).toLocaleString()}
                  </td>

                  {/* <td className="action-cell">
                    <button 
                      className="btn-icon-download" 
                      onClick={() => downloadHistoryPDF(v.id,v.category,v.category_full_name)}
                      title="Download PDF"
                    >
                      <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>📥</span>
                    </button>
                  </td> */}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
