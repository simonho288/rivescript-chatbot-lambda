/**
 * Local express server for local testing purpose only
 */

const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const webhook_fb = require('./webhookfb.js').handler
const RS = require('./rivescript.js')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/webhookfb', function(req, res) {
  console.log(req.query)
  let event = {
    queryStringParameters: req.query
  }
  webhook_fb(event, null, (err, response) => {
    if (err) {
      console.error(err)
    } else {
      res.end(response.body.toString())
    }
  })
})

app.post('/webhookfb', function(req, res) {
  let event = {
    body: JSON.stringify(req.body)
  }
  webhook_fb(event, null, (err, response) => {
    if (err) {
      console.error(err)
    } else {
      res.end(response.body)
    }
  })
})

app.get('/test_rs/:msg', (req, res) => {
  let msg = req.params.msg
  console.log('msg', msg)

  RS.init().then(() => {
    return RS.getReply(msg)
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