const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
// const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const port = 3001
app.use(express.static('gpt-client'))
app.use(express.json())
app.use(cors())

const configuration = new Configuration({
    organization: process.env.ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

app.post('/message', async (req, res) => {
  // Get the message from the request body
  const message = req.body.message;
  // console.log(message)

  // Send the message to the API and get the response

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `You are a helpful and very kind Teacher that knows everything about the world and the given topics. 
      You describe topics and questions in an easy and understandable way so that children understand it and can teach young kids in early age. 
      You answer the question precisely, plus give extra information to the answer and offer follow-up question or suggestions to spur curiosity.
      You maintain a cool, entertaining and professional ton.
      You avoid the question or sentence if it is inappropriate for kids. 
      You reply in that language, that the Kid sends you.
      Teacher: How can i help you today? ${message}.`,
      max_tokens: 500,
      temperature: 0.5,
      stream: false,
    });

    // Send the response back to the client

    console.log(response.data.choices[0])
    // res.write(response.data)
    res.json({
      message: response.data.choices[0].text
    })
  } catch (err) {
    console.log(err)
    // res.status(429).res.json({})
  }
  
});

app.listen(port, () => {
  console.log(`GPT 3 Test app listening on port ${port}`)
})