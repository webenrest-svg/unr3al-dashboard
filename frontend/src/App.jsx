import { useState, useEffect, useRef } from 'react'

const API = 'https://unr3al-dashboard-production.up.railway.app'

function Sidebar() {
  return (
    <div style={{ width: '180px', minWidth: '180px', background: '#161616', display: 'flex', flexDirection: 'column', borderRight: '1px solid #2a2a2a', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 14px 12px' }}>
        <div style={{ width: '28px', height: '28px', background: '#f5c518', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px', color: '#000' }}>U</div>
        <span style={{ fontWeight: '700', fontSize: '14px' }}>unr3al</span>
      </div>
      <div style={{ margin: '0 10px 10px', background: '#1e1e1e', borderRadius: '10px', padding: '10px 12px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700' }}>@yeg</div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>20,600 Rax</div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px', flex: 1 }}>
        {['Accounts','Predictions','Global Offers','Pack Feed','Marketplace','Auto Boost','Scheduler','Tools'].map(item => (
          <button key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: item === 'Global Offers' ? '#fff' : 'none', color: item === 'Global Offers' ? '#000' : '#888', fontWeight: item === 'Global Offers' ? '700' : '500', fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            {item}
          </button>
        ))}
      </nav>
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid #2a2a2a' }}>
        <div style={{ fontSize: '11px', color: '#555', textAlign: 'center', marginBottom: '8px' }}>22h 6m remaining</div>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px', border: '1px solid #2a2a2a', background: 'none', color: '#888', cursor: 'pointer', fontSize: '12px', width: '100%' }}>Sign Out</button>
      </div>
    </div>
  )
}

function GlobalOffers() {
  const [running, setRunning] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [stats, setStats] = useState({ offered: 0, couldnt: 0, spent: 0, accepted: 0, declined: 0 })
  const [offers, setOffers] = useState(50)
  const pollRef = useRef(null)

  async function startJob() {
    try {
      const res = await fetch(`${API}/api/jobs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers })
      })
      const data = await res.json()
      setJobId(data.jobId)
      setRunning(true)

      // Poll the backend every second for live stats
      pollRef.current = setInterval(async () => {
        const r = await fetch(`${API}/api/jobs/${data.jobId}`)
        const job = await r.json()
        setStats({
          offered: job.offered,
          couldnt: job.couldnt,
          spent: job.spent,
          accepted: job.accepted,
          declined: job.declined
        })
        if (job.status !== 'running') {
          clearInterval(pollRef.current)
          if (job.status === 'completed') setRunning(false)
        }
      }, 1000)
    } catch (err) {
      alert('Could not connect to backend! Make sure server.js is running.')
    }
  }

  async function stopJob() {
    if (jobId) {
      await fetch(`${API}/api/jobs/${jobId}/stop`, { method: 'POST' })
    }
    clearInterval(pollRef.current)
    setRunning(false)
    setJobId(null)
  }

  return (
    <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', background: '#0d0d0d' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Global Offers</h1>
        {running && <span style={{ background: '#0d2d1a', border: '1px solid #22c55e', color: '#22c55e', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>● RUNNING</span>}
      </div>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '28px' }}>Automatically offer for cards in the global pool</p>

      {running ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[['Offered', `${stats.offered} / ${offers}`], ["Couldn't Offer", stats.couldnt], ['Spent', `${stats.spent} Rax`], ['Accepted', stats.accepted], ['Declined', stats.declined]].map(([label, val]) => (
              <div key={label} style={{ background: '#1e1e1e', borderRadius: '10px', padding: '16px 18px', border: '1px solid #2a2a2a' }}>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{val}</div>
              </div>
            ))}
          </div>
          <button onClick={stopJob} style={{ width: '100%', padding: '16px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px' }}>STOP JOB</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Sport</div>
                <select style={{ width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}><option>UFC</option><option>NFL</option><option>NBA</option></select>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Season</div>
                <select style={{ width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}><option>All-Time</option><option>2024</option><option>2023</option></select>
              </div>
            </div>
            <input placeholder="Search players..." style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Pricing Strategy</div>
              <select style={{ width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}><option>Minimum Offer</option><option>Market Price</option></select>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Skip Rarities</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#888', fontWeight: '700', cursor: 'pointer' }}>LEGENDARY</button>
                <button style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #f5c518', background: '#f5c518', color: '#000', fontWeight: '700', cursor: 'pointer' }}>MYSTIC</button>
                <button style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #e91e8c', background: '#e91e8c', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>ICONIC</button>
              </div>
            </div>
            <textarea placeholder="Skip users: john, louis, etc." style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none', height: '70px', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Auto skip users who blocked offers','Skip non pro users','Skip previously sold cards','Skip owned','Cancel outgoing offers before starting'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
                <div style={{ width: '36px', height: '20px', background: '#2a2a2a', borderRadius: '20px', cursor: 'pointer' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Offers</div>
                <input value={offers} onChange={e => setOffers(Number(e.target.value))} style={{ width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '16px', fontWeight: '700', textAlign: 'center', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Skip First N</div>
                <input defaultValue="0" style={{ width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '16px', fontWeight: '700', textAlign: 'center', outline: 'none' }} />
              </div>
            </div>
            <button onClick={startJob} style={{ marginTop: 'auto', padding: '14px', background: '#2a2a2a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Start</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d0d0d', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <GlobalOffers />
    </div>
  )
}