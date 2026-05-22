import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Validate.css'

const API = 'http://localhost:5000/api'

const CATEGORIES = [
  // { id: 'S1', name: 'Cabinet Mounting & Accessibility',          icon: '🏗️',  desc: 'Cabinet properly mounted, secured & accessible' },
  // { id: 'S2', name: 'IP55 Cabinet Filter',                       icon: '🔲',  desc: 'Filter in place, clean & properly fitted' },
  // { id: 'S3', name: 'Base Station Installation',                  icon: '📡',  desc: 'Secure install, perfect horizontal/vertical position' },
  // { id: 'S4', name: 'IP Seals & Plugs',                          icon: '🔌',  desc: 'IP seals/plugs installed in all modules' },
  { id: 'S5', name: 'RRU — GND Jumper, Weatherproofing & Label', icon: '⚡',  desc: 'GND jumper clamping, weatherproofing & labeling' },
  // { id: 'S5_A2', name: 'RRU — GND Jumper, Weatherproofing & Label', icon: '⚡',  desc: 'GND jumper clamping, weatherproofing & labeling' },
  // { id: 'S5_A3', name: 'RRU — GND Jumper, Weatherproofing & Label', icon: '⚡',  desc: 'GND jumper clamping, weatherproofing & labeling' },
]

export default function Validate() {

  const [category,    setCategory]    = useState(null)
  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const[issues, setIssues] = useState(null)
  const [dragOver,    setDragOver]    = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()


  // New State
  const [agentSteps, setAgentSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState([]);





  // {old code}
  // const handleFile = (f) => {
  //   if (!f) return
  //   setFile(f)
  //   setError(null)
  //   const reader = new FileReader()
  //   reader.onload = (e) => setPreview(e.target.result)
  //   reader.readAsDataURL(f)
  // }

  const handleFolderUpload = (selectedFiles) => {

    const fileArray = Array.from(selectedFiles)

    if (fileArray.length === 0) return

    setError(null)

    const firstPath = fileArray[0].webkitRelativePath
    const rootFolder = firstPath.split('/')[0]

    // Category Validation
    if (rootFolder !== category) {
      setError(`Please upload ${category} folder only`)
      return
    }

    // =========================
    // S4 / S5 SPECIAL VALIDATION
    // =========================

    if (category === 'S4' || category === 'S5') {

      const requiredSubFolders = [
        `${category}_A1`,
        `${category}_A2`,
        `${category}_A3`
      ]

      const detectedFolders = new Set()

      fileArray.forEach(file => {

        const parts = file.webkitRelativePath.split('/')

        // S4/S4_A1/img1.jpg

        if (parts.length >= 2) {
          detectedFolders.add(parts[1])
        }
      })

      const missing = requiredSubFolders.filter(
        folder => !detectedFolders.has(folder)
      )

      if (missing.length > 0) {
        setError(`Missing folders: ${missing.join(', ')}`)
        return
      }
    }

    // Save files
    setFiles(fileArray)

    // Preview first image
    setFile(fileArray[0])

    const reader = new FileReader()

    reader.onload = (e) => setPreview(e.target.result)

    reader.readAsDataURL(fileArray[0])
  }




  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  // const handleSubmit = async () => {
  //   if (!category) { setError('Please select a category'); return }
  //   if (!file)     { setError('Please upload an image');   return }

  //   setLoading(true)
  //   setError(null)

  //   const form = new FormData()
  //   form.append('image',    file)
  //   form.append('category', category)

  //   try {
  //     const res = await axios.post(`${API}/validate`, form, {
  //       headers: { 'Content-Type': 'multipart/form-data' }
  //     })
  //     setIsProcessing(true);
  //     for (let i = 0; i < steps.length; i++) {
  //         setAgentSteps(prev => [...prev, steps[i]]);
  //         await new Promise(r => setTimeout(r, 800)); // Har step ke beech 0.8s gap
  //     }

  //     // Last mein navigate
  //     setTimeout(() => {
  //         navigate('/results', { state: { result: res.data, image: preview } });
  //     }, 500);
  //     // navigate('/results', { state: { result: res.data, image: preview } })
  //   } catch (err) {
  //     const msg = err.response?.data
  //     if (msg?.stage === 'quality_check') {
  //       setError(`Image quality issue: ${msg.error}. ${(msg.issues || []).join('. ')}`)
  //     } else {
  //       setError(msg?.error || 'Something went wrong. Make sure backend is running.')
  //     }
  //   } finally {
  //     setLoading(false)
  //   }
  // }


  const handleSubmit = async () => {
    if (!category) { setError('Please select a category'); return }
    // if (!file)     { setError('Please upload an image');   return }

    if (files.length === 0) {
      setError('Please upload folder')
      return
    }

    setLoading(true);
    setError(null);
    setIsProcessing(true);
    setAgentSteps([]);

    const form = new FormData();
    // form.append('image', file);
    files.forEach((f) => {
      form.append('images', f)

      form.append('paths', f.webkitRelativePath)
    })
    form.append('category', category);

    

    try {
      // 1. API Call background mein start karo
      const apiPromise = axios.post(`${API}/validate`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Fixed Perception & Reasoning Steps (Sabke liye common)
      const initialSteps = [
        "🔍 [PERCEPTION] Analyzing Image Quality...",
        "🤖 [ORCHESTRATION] Routing to Model...",
        "🧠 [REASONING] Validating Safety Rules..."
      ];

      for (let step of initialSteps) {
        setAgentSteps(prev => [...prev, step]);
        await new Promise(r => setTimeout(r, 1000));
      }

      // 3. Dynamic Wait Step (Jab tak API response nahi aata)
      setAgentSteps(prev => [...prev, "⚙️ [FINALIZING] Synchronizing Autonomous Actions..."]);
      // AB WAIT KARO: Jab tak backend processing (10-12s) khatam na ho
      const res = await apiPromise;

      await new Promise(r => setTimeout(r, 2000));

      // 4. Success Message (Data aane ke baad)
      setAgentSteps(prev => [...prev, "✅ [COMPLETE] All actions executed successfully!"]);

      await new Promise(r => setTimeout(r, 1000));

      setTimeout(() => {
          navigate('/results', { state: { result: res.data, image: preview } });
          setIsProcessing(false);
      }, 1500);

    } catch (err) {
      setIsProcessing(false);
      const msg = err.response?.data;
      setError(msg?.error || 'Something went wrong.');
      setIssues(msg?.issues || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validate-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          {/* <span className="mono title-tag">&lt;VALIDATE&gt;</span> */}
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
          <div className="step-label"><span className="step-num">02</span> Upload Image Folder</div>
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {/* old code */}
            {/* <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            /> */}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              webkitdirectory="true"
              directory="true"
              style={{ display: 'none' }}
              onChange={(e) => handleFolderUpload(e.target.files)}
            />




            {/* {preview ? (
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
                <div className="drop-text">Drop folder here</div>
                <div className="drop-sub mono">JPG · PNG · JPEG</div>
              </div>
            )} */}


            {preview ? (
                <div className="folder-uploaded">
                  <div className="folder-icon">📁</div>

                  <div className="folder-success">
                    Folder Uploaded Successfully
                  </div>

                  <div className="folder-count mono">
                    {files.length} files detected
                  </div>

                  <div className="change-folder mono">
                    Click to change folder
                  </div>
                </div>
            ) : (
              <div className="drop-placeholder">
                <div className="drop-icon">📁</div>
                <div className="drop-text">Drop folder here</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="error-box">
          <span className="mono">⚠ ERROR:</span> {error} {issues}
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
          ) : 'Ask to AI →'}
        </button>
      </div>

      {/* New */}

      {isProcessing && (
        <div className="agent-overlay">
          <div className="agent-brain-card">
            <div className="brain-header mono">🤖 AGENTIC REASONING ENGINE</div>
            <div className="steps-list">
              {agentSteps.map((step, i) => (
                <div key={i} className="step-entry typing-animation">
                  {step}
                </div>
              ))}
            </div>
            <div className="brain-footer">
              <span className="spinner-small" /> Processing Autonomous Decisions...
            </div>
          </div>
        </div>
      )}

    </div>
  )
}