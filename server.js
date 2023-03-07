const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const connectDB = require('./mongodb/connect')
const postRoutes = require('./routes/postRoutes')
const openaiRoutes = require('./routes/openaiRoutes')
const ttsRoutes = require('./routes/ttsRoutes')

const app = express()
const port = 3001
app.use(express.static('gpt-client'))
app.use(express.json({ limit: '50mb'}))
app.use(cors())

app.use('/api/v1/post', postRoutes)
app.use('/api/v1/openai', openaiRoutes)
app.use('/api/v1/tts', ttsRoutes)


try {
  connectDB(process.env.MONGODB_URL)
  app.listen(port, () => {
    console.log(`GPT 3 Test app listening on port ${port}`)
  })
} catch (error) {
  console.log('start server error: ' + error)
}
