/**
 * This module is to handle AWS Dynamodb to save/load Rivescript user state.
 */

const path = require('path')
const AWS = require('aws-sdk')

// AWS.config = new AWS.Config({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
//   region: 'ap-southeast-1'
// })
// Load AWS config file instead of environment variables
AWS.config.loadFromPath(path.join(__dirname, './aws.config.json'))

// Create the DynamoDB service object
let ddb = new AWS.DynamoDB.DocumentClient()
const DYNAMNO_TABLE = {
  USERVARS: 'rive-uservars' // To store rivescript data from getUservars()
}

/**
 * Call AWS DynamoDB to save user state.
 * @param {string} senderID 
 * @param {string} recipientID 
 * @param {object} values 
 */
function saveUserRecord(senderID, recipientID, values) {
  console.assert(senderID)
  console.assert(recipientID)
  console.assert(values)
  // console.log('senderID', senderID)
  // console.log('recipientID', recipientID)
  // console.log('values', values)

  // Wrap it into Promise
  return new Promise((resolve, reject) => {
    var params = {
      TableName: DYNAMNO_TABLE.USERVARS,
      Item: {
        userId: senderID,
        appId: recipientID,
        vars: values
      }
    }
    ddb.put(params, (err, data) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(data)
      }
    })
  })
}

/**
 * Call AWS DynamoDB to load user state.
 * @param {string} senderID 
 * @param {string} recipientID 
 */
function loadUserRecord(senderID, recipientID) {
  console.assert(senderID)
  console.assert(recipientID)
  // console.log('senderID', senderID)
  // console.log('recipientID', recipientID)

  // Wrap it into Promise
  return new Promise((resolve, reject) => {
    var params = {
      TableName: DYNAMNO_TABLE.USERVARS,
      Key: {
        userId: senderID,
        appId: recipientID
      }
    }
    ddb.get(params, (err, data) =>{
      if (err) {
        return reject(err)
      } else {
        return resolve(data)
      }
    })
  })
}

// expose the functions for other modules
module.exports = {
  saveUserRecord,
  loadUserRecord
}
