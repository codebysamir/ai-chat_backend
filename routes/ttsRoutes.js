const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const fs = require('fs')
// const Speaker = require('speaker');
// const app = express()
// app.use(cors())

dotenv.config()

const router = express.Router()

router.route('/').post(async (req, res) => {
    const message = req.body.message
    console.log(message)
    const voice_id = 'EXAVITQu4vr4xnSDxMaL'
    const file_name = 'test.mp3'

    try {
        const getVoice = await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+ voice_id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'accept': '*/*',
            },
            // responseType: 'stream',
            body: JSON.stringify({
                text: message,
                voice_settings: {
                    'stability': 0,
                    'similarity_boost': 0
                }
            })
        })
        const resultBuffer = Buffer.from(await getVoice.arrayBuffer())
        console.log(resultBuffer)
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader('Content-Disposition', 'attachment; filename-"audio.mp3"')
        
        res.status(200).send(resultBuffer)
    } catch (error) {
        console.log('elevenlabs error is: ' + error)
    }
})

router.route('/').get((req, res) => {
    res.send('Elevenlabs Route is working')
})



module.exports = router