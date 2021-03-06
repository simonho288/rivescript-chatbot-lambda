/**
 * This module handles Facebook Messenger Platform API.
 * API reference: https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template
 */
const request = require('request')
const SDB = require('./dynamodb.js')
const RS = require('./rivescript.js')
const external = require('./libs/external.js')
const PAGE_ACCESS_TOKEN = 'EAAByBcEtFkIBAIzBnvNzFAS75Ij5Sad8wU5Ytm64deMZAiBejReHABgz3EFVZC9ENns5dtpiCIafJtKGunEV8UeynGXIpBcRQfPxKm2FyUEvL4vMWOOISK0EHIuoMZCNC6Kuw9ylBx8rLPLKndCpu3kSkGZBVZCh2E1tHcrGzggZDZD' // copied from Facebook API dashboard
const PAGE_VERIFY_TOKEN = 'imsimonchatbot_vt288'

/**
 * Messenger webhook entry point which executing in AWS Lambda.
 * @param {object} event Event object (include parameters) sent from Lambda
 * @param {object} context Lambda pass its context
 * @param {funciton} callback Lambda callback function. Call this when finish
 */
function webhook(event, context, callback) {
  if (event.queryStringParameters) {
    handleHttpGet(event.queryStringParameters, callback)
  } else if (event.body) {
    handleHttpPost(JSON.parse(event.body), callback)
  }
}

/**
 * This function handles webhook http GET event usually called from Facebook App WebHook Subscription.
 * @param {object} query 
 * @param {function} callback 
 */
function handleHttpGet(query, callback) {
  // Verify with our custom defined VERIFY_TOKEN
  if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === PAGE_VERIFY_TOKEN) {
    let challenge = query['hub.challenge']

    let response = {
      body: parseInt(challenge),
      statusCode: 200
    }
    callback(null, response)
  } else {
    let response = {
      body: 'Error, wrong validation token',
      statusCode: 422
    }
    callback(response)
  }
}

/**
 * This function handles webhook http POST event usually called from Messenger Platform when user input messages.
 * @param {object} data 
 * @param {function} callback 
 */
function handleHttpPost(data, callback) {
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Inititalise the RiveScript
    RS.init().then(() => {
      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        let pageID = entry.id
        let timeOfEvent = entry.time

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
    
      let response = {
        'body': 'ok',
        'statusCode': 200
      };
      callback(null, response);
    })
  } else {
    throw new Error('Unhandle object: ' + data.object);
  }
}

/**
 * Called from handleHttpPost() to process a single message when webhook receives.
 * @param {object} msg Message object pass by Messenger
 */
function receivedMessage(msg) {
  let senderID = msg.sender.id
  let recipientID = msg.recipient.id
  let timeOfMessage = msg.timestamp
  let message = msg.message

  console.log('Received message "%s" for user %d and recipient %d of time %d', message.text, senderID, recipientID, timeOfMessage)
  // console.log(JSON.stringify(message))

  // Send typing icon to sender
  sendTypingMessage(senderID)

  // Delay few seconds then process the message
  setTimeout(function() {
    handleMessageWithStateManagement(senderID, recipientID, message)
  }, 2000)
}

/**
 * Load the user state, process message, send back the reply and then save the user state finally.
 * @param {string} senderID Messenger sender ID
 * @param {*} recipientID Messenger recipient ID
 * @param {*} message Message object sent from Messenger
 */
function handleMessageWithStateManagement(senderID, recipientID, message) {
  let messageId = message.mid
  let messageText = message.text
  let messageAttachments = message.attachments

  // Load user state from dynamodb
  SDB.loadUserRecord(senderID, recipientID).then((record) => {
    let state = null
    if (record && record.Item && record.Item.vars)
      state = record.Item.vars
    // Process the incoming message
    return RS.getReply(senderID, messageText, state)
  }).then((answer) => {
    // Send the processed message back to sender
    return sendTextMessage(senderID, answer)    
  }).then(() => {
    // Save user state
    let userState = RS.getUserState(senderID)
    return SDB.saveUserRecord(senderID, recipientID, userState)
  }).then((result) => {
    console.log('User state saved')
  }).catch((err) => {
    console.error(err.message)
    sendTextMessage(senderID, 'Internal error: ' + messageText)
  })
}

/**
 * This function handles Postback type message from Messenger. Postback messages usually are our defined payload response to various actions.
 * @param {object} msg Message object pass by Mssenger
 */
function receivedPostback(msg) {
  let senderID = msg.sender.id
  let recipientID = msg.recipient.id
  let timeOfPostback = msg.timestamp

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  let payload = msg.postback.payload

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback)

  let parts = payload.split('_')
  let command = parts[0]
  if (command === 'GETSTOCKPRICE') {
    let symbol = parts[1]
    let stockName = decodeURI(parts[2])
    SDB.loadUserRecord(senderID, recipientID).then((record) => {
      let state = null
      if (record && record.Item && record.Item.vars)
        state = record.Item.vars
      RS.setUserState(senderID, state)
      return external.getStockPriceBySimbolFromYahoo(symbol)
    }).then((csv) => {
      console.log('csv', csv)
      let parts = csv.split(',')
      let price = parts[2]
      sendTextMessage(senderID, stockName + ' stock price is ' + price)
    })  
  } else {
    console.error('Unhandled payload: ' + payload)      
  }
  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
}

/**
 * Send a generic message to specify Messenger user.
 * @param {string} recipientId Messenger receipient ID to receive the message
 * Note: For info of Generic message: https://developers.facebook.com/docs/messenger-platform/send-api-reference/generic-template
 */
function sendGenericMessage(recipientId) {
  let messageData = {
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

/**
 * Send a text message to specify Messenger user.
 * @param {string} recipientId 
 * @param {string} messageText 
 */
function sendTextMessage(recipientId, messageText) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

/**
 * Build and send a button message to Messenger user
 * @param {string} recipientId Messenger user to receive this message
 * @param {string} prompt Prompt displays at the buttons window header
 * @param {object} buttons Array of button objects which include text & payload properties
 * Notes: https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template
 */
function sendButtonMessage(recipientId, prompt, buttons) {
  let sendBtns = []
  buttons.forEach((button) => {
    console.assert(button.text)
    console.assert(button.payload)
    sendBtns.push({
      type: 'postback',
      title: button.text,
      payload: button.payload
    })
  })
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: prompt,
          buttons: sendBtns
        }
      }
    }
  }

  callSendAPI(messageData)
}

/**
 * Send a "Typing" icon to specify Messenger user.
 * @param {string} recipientId Messenger user to receive this message
 * Note: Typing message info: https://developers.facebook.com/docs/messenger-platform/send-api-reference/sender-actions
 */
function sendTypingMessage(recipientId) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_on'
  }
  callSendAPI(messageData)
}

/**
 * Using NodeJS request package to send a POST message with data to Messenger Platform.
 * @param {object} messageData Message object to send to Messenger Platform
 * Note: Send API ref: https://developers.facebook.com/docs/messenger-platform/reference/send-api
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let recipientId = body.recipient_id
      let messageId = body.message_id

      console.log("Successfully sent generic message to recipient %s", recipientId)
    } else {
      console.error("Unable to send message.")
      // console.error(response)
      console.error(error)
    }
  })
}

// expose the functions for other modules
module.exports = {
  webhook,
  receivedMessage,
  sendButtonMessage
}