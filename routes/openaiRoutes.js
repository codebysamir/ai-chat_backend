const express = require('express')
const dotenv = require('dotenv')
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const fileUpload = require('express-fileupload')
const app = express()
app.use(cors())

dotenv.config()

const fileExistsChecker = require('../middleware/fileExistsChecker')
const fileSizeLimitChecker = require('../middleware/fileSizeLimitChecker')
const fileTypeChecker = require('../middleware/fileTypeChecker')

const router = express.Router()

const configuration = new Configuration({
    organization: process.env.ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.route('/').get((req, res) => {
    res.send('Dall-E Route is working')
})

router.route('/chat').post(async (req, res) => {
  // Get the message from the request body
  const {message, chatHistory} = req.body;
  // console.log(message)

  const systemContent = `The following is a conversation with an AI Teacher. You are a helpful and very kind Teacher that knows everything about the world and the given topics. 
  You explain, describe and teach topics and questions in an easy and understandable way so that a 7 year old child would understand it. 
  You answer the question truthfully, precisely, plus give extra information to the answer and offer follow-up question or suggestions to spur curiosity.
  You maintain a cool, entertaining and professional ton.
  You avoid questions or sentences if it is inappropriate for kids. 
  You always reply in the same language as the question.`
  
  const userResponse = () => {
    if (chatHistory) {
      return [
        ...chatHistory,
      {
        role: 'user',
        content: message
      }]
    } else {
      return [{
        role: 'user',
        content: message
      }]
    }
  }

  console.log(...userResponse())

  // Send the message to the API and get the response
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system', 
          content: systemContent
        },
        {
          role: 'assistant',
          content: 'Hello how can i help you?'
        },
        {
          role: 'user',
          content: 'In which way can you help me?'
        },
        {
          role: 'assistant',
          content: 'I can help you with every topic, just ask me a Question or tell me whats on your mind.'
        },
        ...userResponse()
      ],
      // max_tokens: 500,
      temperature: 0.8,
      stream: false,
    });

    // Send the response back to the client

    console.log(response.data.choices[0] || response.data.error)
    console.log(response.data.usage)
    // res.write(response.data)
    res.status(200).json({
      message: response.data.choices[0].message.content,
      tokens: response.data.usage.total_tokens
    })
  } catch (err) {
    console.log('Catch Error is: ' + err)
    res.status(500).send(err?.response.data.error.message)
  }
});

router.route('/message').post(async (req, res) => {
  // Get the message from the request body
  const message = req.body.message;
  // console.log(message)

  // Send the message to the API and get the response

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `The following is a conversation with an AI Teacher. You are a helpful and very kind Teacher that knows everything about the world and the given topics. 
      You explain, describe and teach topics and questions in an easy and understandable way so that a 7 year old child would understand it. 
      You answer the question truthfully, precisely, plus give extra information to the answer and offer follow-up question or suggestions to spur curiosity.
      You maintain a cool, entertaining and professional ton.
      You avoid questions or sentences if it is inappropriate for kids. 
      You always reply in the same language as the question.
      
      Teacher: How can i help you today? ${message}?`,
      max_tokens: 500,
      temperature: 0.5,
      stream: false,
    });

    // Send the response back to the client

    console.log(response.data.choices[0] || response.data.error)
    console.log(response.data.usage)
    // res.write(response.data)
    res.status(200).json({
      message: response.data.choices[0].text,
      tokens: response.data.usage.total_tokens
    })
  } catch (err) {
    console.log('Catch Error is: ' + err)
    res.status(500).send(err?.response.data.error.message)
  }
});
  
router.route('/image').post(async (req, res) => {
  // Get the message from the request body
  const message = req.body.message;
  // console.log(message)

  // Send the message to the API and get the response

  try {
    const response = await openai.createImage({
    prompt: message,
    n: 1,
    size: "512x512",
    response_format: 'b64_json'
    });

    // Send the response back to the client

    console.log(response.data)

    const image_url = response.data.data[0].b64_json;
    const image_id = response.data.created;
    res.status(200).json({
    message: image_url,
    created: image_id
    // tokens: response.data.usage.total_tokens
    })
  } catch (err) {
    console.log('Catch Error is: ' + err)
    res.status(500).send(err?.response.data.error.message)
  }
});


router.route('/upload').post( 
  fileUpload({ createParentPath: true }), 
  fileExistsChecker,
  fileTypeChecker(['.png', '.rgba']),
  fileSizeLimitChecker,
  async (req, res) => {
  // Get the message from the request body
  // const message = req.body.message;
  console.log(req.body)
  const files = req.files
  console.log(Object.keys(files)[0])
  
  Object.keys(files).forEach(key => {
    const filepath = path.join(__dirname, 'images', files[key].name)
    console.log(filepath)
    files[key].mv(filepath, (err) => {
      if (err) return res.status(500).json({ message: err})
    })
  })

  // Send the message to the API and get the response
    
  try {
    const response = await openai.createImageVariation(
      fs.createReadStream(`./images/${Object.keys(files)[0]}`),
      1,
      "512x512",
      'b64_json'
    );
  
    // Send the response back to the client

    const image_url = response.data.data[0].b64_json;
    console.log(image_url)
    res.status(200).json({
      message: image_url,
    })
  } catch (err) {
    console.log(err.response.data)
    console.log('Catch Error is: ' + err)
    res.status(500).send(err?.response.data.error.message)
  }
  
});

module.exports = router