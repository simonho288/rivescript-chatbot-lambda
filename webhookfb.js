const request = require('request')

const PAGE_ACCESS_TOKEN = 'EAAByBcEtFkIBAIzBnvNzFAS75Ij5Sad8wU5Ytm64deMZAiBejReHABgz3EFVZC9ENns5dtpiCIafJtKGunEV8UeynGXIpBcRQfPxKm2FyUEvL4vMWOOISK0EHIuoMZCNC6Kuw9ylBx8rLPLKndCpu3kSkGZBVZCh2E1tHcrGzggZDZD'

function receivedMessage(msg) {
  var senderID = msg.sender.id
  var recipientID = msg.recipient.id
  var timeOfMessage = msg.timestamp
  var message = msg.message

  console.log('Received message for user %d and page %d at %d with message:', senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  var messageId = message.mid

  var messageText = message.text
  var messageAttachments = message.attachments

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break
      default:
        sendTextMessage(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received")
  }
}

function receivedPostback(msg) {
  var senderID = msg.sender.id
  var recipientID = msg.recipient.id
  var timeOfPostback = msg.timestamp

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = msg.postback.payload

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback)

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called")
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData)
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id
      var messageId = body.message_id

      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId)
    } else {
      console.error("Unable to send message.")
      console.error(response)
      console.error(error)
    }
  })
}

// Module export object
module.exports.fb_webhook = function(event, context, callback) {
  if (event.queryStringParameters) {
    handleHttpGet(event.queryStringParameters, callback)
  } else if (event.body) {
    handleHttpPost(JSON.parse(event.body), callback)
  }
}

function handleHttpGet(query, callback) {
  if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === 'imsimonchatbot_vt288') {
    let challenge = query['hub.challenge'];

    let response = {
      'body': parseInt(challenge),
      'statusCode': 200
    }
    callback(null, response);
  } else {
    let response = {
      'body': 'Error, wrong validation token',
      'statusCode': 422
    }
    callback(null, response);
  }
}

function handleHttpPost(data, callback) {		
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id
      var timeOfEvent = entry.time

      // Iterate over each messaging event
      entry.messaging.forEach((msg) => {
        if (msg.message) {
          receivedMessage(msg)
        } else if (msg.postback) {
          receivedPostback(msg)
        } else {
          console.log("Webhook received unknown event: ", event)
        }
      })
    })
  
    var response = {
      'body': 'ok',
      'statusCode': 200
    };
    callback(null, response);
  } else {
    throw new Error('Unhandle object: ' + data.object);
  }
}
