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

  const CATS = ['ALL', 'S1', 'S2', 'S3', 'S4', 'S5']
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
                <th>Filename</th>
                <th>Result</th>
                <th className="mono">Similarity</th>
                <th>Confidence</th>
                <th className="mono">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td className="mono" style={{ color: 'var(--text-dim)' }}>#{v.id}</td>
                  <td>
                    <span className="badge badge-pass mono">{v.category}</span>
                  </td>
                  <td className="filename-cell">{v.filename}</td>
                  <td>
                    <span className={`badge badge-${v.result === 'PASS' ? 'pass' : 'fail'}`}>
                      {v.result}
                    </span>
                  </td>
                  <td className="mono">{v.similarity_score}%</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{v.confidence}</td>
                  <td className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
