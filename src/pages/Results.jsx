// import { useEffect, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import axios from 'axios'
// import './Results.css'

// const API = 'http://localhost:5000/api'

// const backendassetUrl = "http://localhost:5000/api/download/"

// export default function Results() {
//   const { state }  = useLocation()
//   const navigate   = useNavigate()
//   const [pdfLoading, setPdfLoading] = useState(false)


//   // 1. Human Override State: AI ke saare actions initially 'approved' rahenge
//   const [approvedActions, setApprovedActions] = useState({})

//   useEffect(() => {
//     if (state?.result?.actions) {
//       const initialMap = {}
//       state.result.actions.forEach((_, index) => {
//         initialMap[index] = true // By default all AI actions are pre-selected
//       });
//       setApprovedActions(initialMap)
//     }
//   }, [state])

//   if (!state?.result) {
//     navigate('/')
//     return null
//   }

//   const { result, image } = state
//   const passed = result.success === 'PASS'
//   const resultImage = result.detected_image

//   const toggleAction = (index) => {
//     setApprovedActions(prev => ({
//       ...prev,
//       [index]: !prev[index]
//     }))
//   }


//   const downloadPDF = async () => {
//     setPdfLoading(true)

//     // 2. Only send human-approved actions to the PDF generator
//     const finalActions = result.actions.filter((_, index) => approvedActions[index]);


//     try {
//       const res = await axios.post(`${API}/report/generate`, {
//         result: result,
//         image:  image,
//       }, { responseType: 'blob' })
//       const url  = window.URL.createObjectURL(new Blob([res.data]))
//       const link = document.createElement('a')
//       link.href  = url
//       link.download = `TeleCheck_${result.category}_${result.success}.pdf`
//       link.click()
//       window.URL.revokeObjectURL(url)
//     } catch (e) {
//       alert('PDF generation failed. Make sure backend is running.')
//     } finally {
//       setPdfLoading(false)
//     }
//   }


//   const parseLLM = (text) => {
//     const lines = text.split('\n');
//     return {
//       status: lines[0]?.replace('**Status:**', '').trim(),
//       issue: lines[1]?.replace('**Issue:**', '').trim(),
//       action: lines[2]?.replace('**Action:**', '').trim()
//     };
//   };

//   const auditData = parseLLM(result.llm_explanation);

//   return (
//     <div className="results-page">

//       {/* Header */}
//       <div className="results-header">
//         <button className="btn btn-outline back-btn" onClick={() => navigate('/')}>← New Validation</button>
//         <span className="mono title-tag">&lt;RESULTS&gt;</span>
//       </div>


//       {/* Verdict */}
//       <div className={`verdict-card ${passed ? 'verdict-pass' : 'verdict-fail'}`}>
//         <div className="verdict-left">
//           <div className="verdict-icon">{passed ? '✅' : '❌'}</div>
//           <div>
//             <div className="verdict-result mono">{result.success}</div>
//             <div className="verdict-category">
//               {result.category} — {result.category_full_name}
//             </div>

//         {/* --- Naya GenAI Section Yahan Add Karo --- */}
//         {result.llm_explanation && (
//           <div className="verdict-reasoning-box">
//             <div className="reasoning-line">
//               <span className="reasoning-label">Insight:</span> 
//               <span className="reasoning-text">{result.llm_explanation.split('\n')[1]?.replace('**Issue:**', '')}</span>
//             </div>
//             <div className="action-line">
//               <span className="action-label">Next Step:</span> 
//               <span className="action-text">{result.llm_explanation.split('\n')[2]?.replace('**Action:**', '')}</span>
//             </div>
//           </div>
//         )}
//         {/* ---------------------------------------- */}
//         <div className="button-container-right">
//               <button 
//                 className="btn btn-download-sm" 
//                 onClick={downloadPDF} 
//                 disabled={pdfLoading}
//               >
//                 {pdfLoading ? (
//                   <span className="loading-text-sm">
//                     <span className="spinner-dark-sm" /> Processing...
//                   </span>
//                 ) : (
//                   '⬇ Report'
//                 )}
//               </button>
//           </div>
//       </div>

//     </div>
//   </div>

//       <div className="results-grid">
//         {/* Images */}
//         <div className="card result-image-card">
//           <div className="section-title">Images</div>

//           <div className="image-row">
//             <div className="image-box">
//               <span className="image-label">Uploaded Image</span>
//               <img src={image} alt="uploaded" className="result-image" />
//             </div>

//             <div className="image-box">
//               <span className="image-label">Result Image</span>
//               <img
//                 src={backendassetUrl + resultImage}
//                 alt="result"
//                 className="result-image"
//               />
//             </div>
//           </div>
//         </div>

//         {/* <div className="card">
//           <div className="section-title">Detected Objects</div>

//           <div className="checks-list">
//             {result.detected_objects?.map((item, i) => (
//               <div key={i} className="check-item check-pass">
//                 <span className="check-icon">✓</span>

//                 <div className="check-content">
//                   <div className="check-text">{item}</div>
//                 </div>

//                 <span className="badge badge-pass">DETECTED</span>
//               </div>
//             ))}
//           </div>
//         </div> */}

//         {/* <div className="card">
//           <div className="section-title">Missing Objects</div>

//           <div className="checks-list">
//             {result.missing_objects?.map((item, i) => (
//               <div key={i} className="check-item check-fail">
//                 <span className="check-icon">✗</span>

//                 <div className="check-content">
//                   <div className="check-text">{item}</div>
//                 </div>

//                 <span className="badge badge-fail">Missing</span>
//               </div>
//             ))}
//           </div>
//         </div> */}


//         {/* <div className="card">
//           <div className="section-title">Recommendations</div>

//           <div className="list-items">

//             {result.missing_objects?.map((item, i) => (
//               <div key={`miss-${i}`} className="list-item item-rec missing">
//                 <span>→</span>
//                 <span>
//                   {item.replaceAll("_", " ").toUpperCase()} is missing. Please install it to complete the setup.
//                 </span>
//               </div>
//             ))}


//             {result.forbidden_found?.map((item, i) => (
//               <div key={`forbid-${i}`} className="list-item item-rec forbidden">
//                 <span>→</span>
//                 <span>
//                   {item.replaceAll("_", " ").toUpperCase()} is found. Please fix this issue to ensure proper site configuration.
//                 </span>
//               </div>
//             ))}


//             {(!result.missing_objects?.length && !result.forbidden_found?.length) && (
//               <div className="list-item item-rec success">
//                 <span>✅</span>
//                 <span>All checks passed. No recommendations.</span>
//               </div>
//             )}

//           </div>
//         </div> */}

//         <div className="card agent-actions-card">
//           <div className="section-title mono">🤖 Agent Autonomous Actions</div>
//           <div className="actions-list">

//             {result.actions?.map((action, index) => {
//               let icon = "⚙️"; 
//               if (action.toLowerCase().includes("category")) icon = "📁";
//               if (action.toLowerCase().includes("ticket")) icon = "🎫";
//               if (action.toLowerCase().includes("notification") || action.toLowerCase().includes("alert")) icon = "🔔";
//               if (action.toLowerCase().includes("health")) icon = "❤️";
//               if (action.toLowerCase().includes("audit") || action.toLowerCase().includes("log")) icon = "🛡️";

//               return (
//                 // <div key={index} className="action-item">
//                 <div key={index} className={`action-item ${!approvedActions[index] ? 'action-disabled' : ''}`}>
//                   {/* <input 
//                     type="checkbox" 
//                     className="hitl-checkbox"
//                     checked={!!approvedActions[index]} 
//                     onChange={() => toggleAction(index)}
//                   /> */}
//                   <span className="action-icon">{icon}</span>{action.split(' ')[0]}
//                   <div className="action-info">
//                     {/* <div className="action-label">
//                       {action.split(' ')[0]}
//                     </div> */}
//                     <div className="action-desc mono">{action}</div>
//                     {/* <span className={`badge ${approvedActions[index] ? 'badge-pass' : 'badge-fail'}`}>
//                       {approvedActions[index] ? 'EXECUTING' : 'OVERRIDDEN'}
//                     </span> */}
//                   </div>
//                   {/* <span className="badge badge-pass">EXECUTED</span> */}
//                 </div>
//               );
//             })}

//             {/* Fallback if actions is empty (Optional) */}
//             {(!result.actions || result.actions.length === 0) && (
//               <div className="action-item">
//                 <span className="action-icon">🛡️</span>
//                 <div className="action-text">No autonomous actions required for this state.</div>
//               </div>
//             )}
//           </div>
//           {/* <div className="button-container-right">
//               <button 
//                 className="btn btn-download-sm" 
//                 onClick={downloadPDF} 
//                 disabled={pdfLoading}
//               >
//                 {pdfLoading ? (
//                   <span className="loading-text-sm">
//                     <span className="spinner-dark-sm" /> Processing...
//                   </span>
//                 ) : (
//                   '⬇ Report'
//                 )}
//               </button>
//           </div> */}
//         </div>


//         {/* Image Quality */}
//         {result.quality && (
//           <div className="card">
//             <div className="section-title">Image Quality</div>
//             <div className="quality-items">
//               {Object.entries(result.quality.checks || {}).map(([key, val]) => (
//                 <div key={key} className="quality-item">
//                   <span className="quality-key mono">{key}</span>
//                   <span className="quality-msg">{val.message}</span>
//                   <span className={`badge badge-${val.passed ? 'pass' : 'fail'}`}>{val.passed ? 'OK' : 'FAIL'}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//       </div>

//       {/* Actions */}
//       <div className="results-actions">
//         <button className="btn btn-primary" onClick={() => navigate('/')}>Validate Another →</button>
//         {/* <button className="btn btn-download" onClick={downloadPDF} disabled={pdfLoading}>
//           {pdfLoading
//             ? <span className="loading-text"><span className="spinner-dark" /> Generating PDF...</span>
//             : '⬇ Download PDF Report'}
//         </button>
//         <button className="btn btn-outline" onClick={() => navigate('/history')}>View History</button> */}
//       </div>

//     </div>
//   )
// }




import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Results.css'

const API = 'http://localhost:5000/api'

const backendassetUrl = "http://localhost:5000/api/download/"

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [pdfLoading, setPdfLoading] = useState(false)




  if (!state?.result) {
    navigate('/')
    return null
  }

  const { result, image } = state

  const categories = Object.entries(result)

  const [showModal, setShowModal] = useState(false) 
  const [selectedCategory, setSelectedCategory] = useState(null) 
  const [manualReview, setManualReview] = useState({ uid: '', result: 'SELECT', remarks: '', validationId:""})

  const openReviewModal = (category,validationId) => { 
    setSelectedCategory(category) 
    setManualReview({ uid: '', result: 'SELECT', remarks: '', validationId: validationId}) 
    setShowModal(true) 
  }



  return (
    <div className="results-page">

      {/* Header */}
      <div className="results-header">
        <button className="btn btn-outline back-btn" onClick={() => navigate('/')}>← New Validation</button>
        <span className="mono title-tag">&lt;RESULTS&gt;</span>
      </div>



      

      {categories.map(([categoryKey, categoryData]) => {


        const agent = categoryData.agent_result

        if (!agent) return null

        const passed = agent.success === 'PASS'

        return (
          <div key={categoryKey}>

            {/* Verdict Card */}

            <div className={`verdict-card ${passed ? 'verdict-pass' : 'verdict-fail'}`}>

              <div className="verdict-left">
                <div className="verdict-icon">{passed ? '✅' : '❌'}</div>
                <div>
                  <div className="verdict-result mono">
                    {agent.success}
                  </div>

                  <div className="verdict-category">
                    {agent.category} — {agent.category_full_name}
                  </div>

                  <div className="verdict-reasoning-box">

                    <div className="action-line">

                      <span className="action-label">
                        Detected Objects:
                      </span>

                      <span className="action-text">
                        {
                          agent.detected_objects?.length > 0
                            ? agent.detected_objects.join(', ')
                            : 'None'
                        }
                      </span>

                    </div>

                    <div className="reasoning-line">

                      <span className="reasoning-label">
                        Missing Objects:
                      </span>

                      <span className="reasoning-text">
                        {
                          agent.forbidden_found?.length > 0
                            ? agent.forbidden_found.join(', ')
                            : "No Missing Object"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}

            <div className="card result-image-card">

              {/* <div className="section-title">
                {agent.category}
              </div> */}


              <div className="section-title-row">

                <div className="section-title">
                  {agent.category}
                </div>

                <button
                  className="btn btn-review"
                  onClick={() => openReviewModal(agent.category,agent.validation_id) }
                >
                  Manual Review
                </button>

              </div>



              <div className="image-row">

                <div className="image-box">

                  <span className="image-label">
                    Upload Image
                  </span>

                  <img
                    src={backendassetUrl + agent.real_image}
                    alt="uploaded"
                    className="result-image"
                  />

                </div>

                <div className="image-box">

                  <span className="image-label">
                    Result Image
                  </span>

                  <img
                    src={backendassetUrl + agent.detected_image}
                    alt="result"
                    className="result-image"
                  />

                </div>

              </div>
              
            </div>

          </div>
          
        )
      })}

      {/* REVIEW MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="review-modal">

            <div className="modal-header">

              <h3>
                Manual Review — {selectedCategory}
              </h3>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>

            </div>

            {/* UID */}

            <div className="form-group">

              <label>UST ID</label>

              <input
                type="text"
                value={manualReview.uid}
                onChange={(e) =>
                  setManualReview({
                    ...manualReview,
                    uid: e.target.value
                  })
                }
                placeholder="Enter UST ID"
              />

            </div>

            {/* RESULT */}

            <div className="form-group">

              <label>Your Result</label>

              <select
                value={manualReview.result}
                onChange={(e) =>
                  setManualReview({
                    ...manualReview,
                    result: e.target.value
                  })
                }
              >
                <option value="">SELECT</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
              </select>

            </div>

            {/* REMARKS */}

            <div className="form-group">

              <label>Remarks</label>

              <textarea
                rows="4"
                value={manualReview.remarks}
                onChange={(e) =>
                  setManualReview({
                    ...manualReview,
                    remarks: e.target.value
                  })
                }
                placeholder="Enter remarks"
              />

            </div>

            {/* FOOTER */}

            <div className="modal-footer">

              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              {/* <button
                className="btn btn-primary"
                onClick={() => {

                  console.log(manualReview)

                  setShowModal(false)
                }}
              >
                Submit
              </button> */}
              <button
                className="btn btn-primary"
                onClick={async () => {
                  console.log(manualReview,"manualReview")
                  if (
                    !manualReview.uid.trim() ||
                    !manualReview.result.trim() ||
                    !manualReview.remarks.trim()
                  ) {
                    alert("All fields are mandatory")
                    return
                  }

                  try {

                    await axios.post(`${API}/validation/manual-review`, {

                      validation_id: manualReview.validationId,

                      uid: manualReview.uid,

                      result: manualReview.result,

                      remarks: manualReview.remarks

                    })

                    alert("Review submitted successfully")
                    setSelectedCategory(null) 
                    setManualReview({ uid: '', result: 'SELECT', remarks: '', validationId:""}) 
                    setShowModal(false)

                  } catch (err) {

                    alert("Failed to submit review")

                  }

                }}
              >
                Submit
              </button>

            </div>

          </div>

        </div>
      )}


      {/* Actions */}
      <div className="results-actions">
        <button className="btn btn-primary" onClick={() => navigate('/')}>Validate Another →</button>
      </div>

    </div>
  )
}