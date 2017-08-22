const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const webhook_fb = require('./webhookfb.js').fb_webhook

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/webhook_fb', function(req, res) {
  webhook_fb.get(req, res)
})

app.post('/webhook_fb', function (req, res) {
  webhook_fb.post(req, res)
})
  
app.listen(3000, function() {
  console.log('Server listening on port 3000')
})