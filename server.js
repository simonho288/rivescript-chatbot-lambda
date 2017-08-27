/**
 * Local express server for local testing only
 */

const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const fbWebhook = require('./webhookfb.js')
const RS = require('./rivescript.js')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

/**
 * Webhook to handle GET event sent by Facebook App (developers.facebook.com)
 * when subscribing webhook 
 */
app.get('/webhookfb', function(req, res) {
  // make serverless similar event object
  let event = {
    queryStringParameters: req.query
  }
  console.log(event) // dump the event for debugging
  fbWebhook.webhook(event, null, (err, response) => {
    if (err) {
      console.error('Error: ' + err.body)
    } else {
      res.end(response.body.toString())
    }
  })
})

/**
 * Webhook to handle POST event sent by Messenger when user
 * input message.
 */
app.post('/webhookfb', function(req, res) {
  // make serverless similar event object
  let event = {
    body: JSON.stringify(req.body)
  }
  fbWebhook.webhook(event, null, (err, response) => {
    if (err) {
      console.error(err)
    } else {
      res.end(response.body)
    }
  })
})

/**
 * Directly process the message to get reply. The reply will be
 * send to mine Messenger to see the result.
 */
app.get('/test_rs/:msg', (req, res) => {
  let msg = req.params.msg
  console.log('msg', msg)

  RS.init().then(() => {
    let obj = {
      sender: {
        id: '1434188906628402'
      },
      recipient: {
        id: '114248985967236'
      },
      timestamp: 114248985967236,
      message: {
        text: msg
      }
    }
    fbWebhook.receivedMessage(obj)
    return 'okay'
  }).then((answer) => {
    res.send(answer)
  }).catch((err) => {
    console.error(err)
    res.send('err!')
  })
})
  
app.listen(3000, function() {
  console.log('Server listening on port 3000')
})