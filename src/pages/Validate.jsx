import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Validate.css'

const API = 'http://localhost:5000/api'

const CATEGORIES = [
  { id: 'S1', name: 'Cabinet Mounting & Accessibility',          icon: '🏗️',  desc: 'Cabinet properly mounted, secured & accessible' },
  { id: 'S2', name: 'IP55 Cabinet Filter',                       icon: '🔲',  desc: 'Filter in place, clean & properly fitted' },
  { id: 'S3', name: 'Base Station Installation',                  icon: '📡',  desc: 'Secure install, perfect horizontal/vertical position' },
  { id: 'S4', name: 'IP Seals & Plugs',                          icon: '🔌',  desc: 'IP seals/plugs installed in all modules' },
  { id: 'S5', name: 'RRU — GND Jumper, Weatherproofing & Label', icon: '⚡',  desc: 'GND jumper clamping, weatherproofing & labeling' },
]

export default function Validate() {
  const [category,    setCategory]    = useState(null)
  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [dragOver,    setDragOver]    = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!category) { setError('Please select a category'); return }
    if (!file)     { setError('Please upload an image');   return }

    setLoading(true)
    setError(null)

    const form = new FormData()
    form.append('image',    file)
    form.append('category', category)

    try {
      const res = await axios.post(`${API}/validate`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate('/results', { state: { result: res.data, image: preview } })
    } catch (err) {
      const msg = err.response?.data
      if (msg?.stage === 'quality_check') {
        setError(`Image quality issue: ${msg.error}. ${(msg.issues || []).join('. ')}`)
      } else {
        setError(msg?.error || 'Something went wrong. Make sure backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="validate-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <span className="mono title-tag">&lt;VALIDATE&gt;</span>
          <h1>Site Installation Check</h1>
          <p>Select a category and upload a site image to validate installation compliance</p>
        </div>
      </div>

      <div className="validate-grid">

        {/* Step 1 — Category */}
        <div className="step-section">
          <div className="step-label"><span className="step-num">01</span> Select Category</div>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-btn ${category === cat.id ? 'selected' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <div className="cat-header">
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-id mono">{cat.id}</span>
                </div>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-desc">{cat.desc}</div>
                {category === cat.id && <div className="cat-selected-bar" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Upload */}
        <div className="step-section">
          <div className="step-label"><span className="step-num">02</span> Upload Image</div>
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {preview ? (
              <div className="preview-wrap">
                <img src={preview} alt="preview" className="preview-img" />
                <div className="preview-overlay">
                  <span>Click to change image</span>
                </div>
                <div className="preview-filename mono">{file?.name}</div>
              </div>
            ) : (
              <div className="drop-placeholder">
                <div className="drop-icon">📷</div>
                <div className="drop-text">Drop image here or click to browse</div>
                <div className="drop-sub mono">JPG · PNG · WEBP</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="error-box">
          <span className="mono">⚠ ERROR:</span> {error}
        </div>
      )}

      {/* Submit */}
      <div className="submit-row">
        <div className="submit-info">
          {category && <span className="badge badge-pass mono">{category} selected</span>}
          {file     && <span className="badge badge-pass mono">{(file.size/1024).toFixed(0)} KB</span>}
        </div>
        <button
          className="btn btn-primary btn-validate"
          onClick={handleSubmit}
          disabled={loading || !category || !file}
        >
          {loading ? (
            <span className="loading-text">
              <span className="spinner" /> Analyzing...
            </span>
          ) : 'Validate Installation →'}
        </button>
      </div>

    </div>
  )
}
