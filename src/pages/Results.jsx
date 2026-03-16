import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Results.css'

const API = 'http://localhost:5000/api'

export default function Results() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const [pdfLoading, setPdfLoading] = useState(false)

  if (!state?.result) {
    navigate('/')
    return null
  }

  const { result, image } = state
  const passed = result.result === 'PASS'

  const downloadPDF = async () => {
    setPdfLoading(true)
    try {
      const res = await axios.post(`${API}/report/generate`, {
        result: result,
        image:  image,
      }, { responseType: 'blob' })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.download = `TeleCheck_${result.category}_${result.result}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('PDF generation failed. Make sure backend is running.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="results-page">

      {/* Header */}
      <div className="results-header">
        <button className="btn btn-outline back-btn" onClick={() => navigate('/')}>← New Validation</button>
        <span className="mono title-tag">&lt;RESULTS&gt;</span>
      </div>

      {/* Verdict */}
      <div className={`verdict-card ${passed ? 'verdict-pass' : 'verdict-fail'}`}>
        <div className="verdict-left">
          <div className="verdict-icon">{passed ? '✅' : '❌'}</div>
          <div>
            <div className="verdict-result mono">{result.result}</div>
            <div className="verdict-category">{result.category} — {result.category_name}</div>
            <div className="verdict-summary">{result.summary}</div>
          </div>
        </div>
        <div className="verdict-score">
          <div className="score-circle" style={{ '--pct': result.similarity_score, '--clr': passed ? 'var(--pass)' : 'var(--fail)' }}>
            <span className="score-num">{result.similarity_score}%</span>
            <span className="score-label">Similarity</span>
          </div>
          <div className="confidence-label mono">Confidence: {result.confidence}</div>
        </div>
      </div>

      <div className="results-grid">

        {/* Image */}
        {image && (
          <div className="card result-image-card">
            <div className="section-title">Uploaded Image</div>
            <img src={image} alt="uploaded" className="result-image" />
          </div>
        )}

        {/* Checklist */}
        <div className="card">
          <div className="section-title">Compliance Checklist</div>
          <div className="checks-list">
            {result.checks?.map((c, i) => (
              <div key={i} className={`check-item check-${c.result.toLowerCase()}`}>
                <span className="check-icon">
                  {c.result === 'PASS' ? '✓' : c.result === 'FAIL' ? '✗' : '⚠'}
                </span>
                <div className="check-content">
                  <div className="check-text">{c.check}</div>
                  <div className="check-detail mono">{c.detail}</div>
                </div>
                <span className={`badge badge-${c.result.toLowerCase() === 'warn' ? 'warn' : c.result.toLowerCase() === 'pass' ? 'pass' : 'fail'}`}>
                  {c.result}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div className="card">
          <div className="section-title">Issues Found</div>
          <div className="list-items">
            {result.issues?.map((issue, i) => (
              <div key={i} className={`list-item ${passed ? 'item-ok' : 'item-issue'}`}>
                <span>{passed ? '✓' : '•'}</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="section-title">Recommendations</div>
          <div className="list-items">
            {result.recommendations?.map((rec, i) => (
              <div key={i} className="list-item item-rec">
                <span>→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similarity Detail */}
        <div className="card">
          <div className="section-title">AI Similarity Analysis</div>
          <div className="sim-stats">
            <div className="sim-stat">
              <span className="sim-label mono">Best Match</span>
              <span className="sim-value mono">{result.similarity_detail?.best_similarity_pct}%</span>
            </div>
            <div className="sim-stat">
              <span className="sim-label mono">Avg Top 3</span>
              <span className="sim-value mono">{result.similarity_detail?.avg_top3_pct}%</span>
            </div>
            <div className="sim-stat">
              <span className="sim-label mono">References</span>
              <span className="sim-value mono">{result.similarity_detail?.total_references}</span>
            </div>
          </div>
          <div className="top-matches">
            <div className="matches-label mono">Top Matching References</div>
            {result.similarity_detail?.top_matches?.slice(0, 3).map((m, i) => (
              <div key={i} className="match-row">
                <span className="match-rank mono">#{i+1}</span>
                <span className="match-file mono">{m.filename}</span>
                <div className="match-bar-wrap">
                  <div className="match-bar" style={{ width: `${m.similarity_pct}%` }} />
                </div>
                <span className="match-pct mono">{m.similarity_pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Image Quality */}
        {result.quality && (
          <div className="card">
            <div className="section-title">Image Quality</div>
            <div className="quality-items">
              {Object.entries(result.quality.checks || {}).map(([key, val]) => (
                <div key={key} className="quality-item">
                  <span className="quality-key mono">{key}</span>
                  <span className="quality-msg">{val.message}</span>
                  <span className={`badge badge-${val.passed ? 'pass' : 'fail'}`}>{val.passed ? 'OK' : 'FAIL'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn btn-primary" onClick={() => navigate('/')}>Validate Another →</button>
        <button className="btn btn-download" onClick={downloadPDF} disabled={pdfLoading}>
          {pdfLoading
            ? <span className="loading-text"><span className="spinner-dark" /> Generating PDF...</span>
            : '⬇ Download PDF Report'}
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/history')}>View History</button>
      </div>

    </div>
  )
}