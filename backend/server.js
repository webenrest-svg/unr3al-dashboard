const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const jobs = {}

app.post('/api/jobs/start', (req, res) => {
  const jobId = Date.now().toString()
  jobs[jobId] = {
    id: jobId,
    status: 'running',
    offered: 0,
    couldnt: 0,
    spent: 0,
    accepted: 0,
    declined: 0,
    maxOffers: req.body.offers || 50
  }
  const interval = setInterval(() => {
    const job = jobs[jobId]
    if (!job || job.status !== 'running') {
      clearInterval(interval)
      return
    }
    job.offered = Math.min(job.offered + 1, job.maxOffers)
    job.couldnt += Math.floor(Math.random() * 3)
    job.spent += 10 + Math.floor(Math.random() * 10)
    if (Math.random() > 0.85) job.accepted++
    if (Math.random() > 0.9) job.declined++
    if (job.offered >= job.maxOffers) {
      job.status = 'completed'
      clearInterval(interval)
    }
  }, 1000)
  jobs[jobId].interval = interval
  res.json({ jobId, status: 'started' })
})

app.get('/api/jobs/:jobId', (req, res) => {
  const job = jobs[req.params.jobId]
  if (!job) return res.status(404).json({ error: 'Job not found' })
  const { interval, ...jobData } = job
  res.json(jobData)
})

app.post('/api/jobs/:jobId/stop', (req, res) => {
  const job = jobs[req.params.jobId]
  if (!job) return res.status(404).json({ error: 'Job not found' })
  clearInterval(job.interval)
  job.status = 'stopped'
  res.json({ status: 'stopped' })
})

app.get('/api/sorare/cards', async (req, res) => {
  const fetch = (await import('node-fetch')).default
  const query = '{ tokens { liveAuctions(last: 5) { nodes { id currentPrice anyCards { slug name rarityTyped } } } } }'
  try {
    const response = await fetch('https://api.sorare.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'unr3al backend running!' })
})

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001')
})