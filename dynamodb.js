/**
 * This module mainly handles AWS Dynamodb tasks
 */

const path = require('path')
const AWS = require('aws-sdk')

// Create the DynamoDB service object
AWS.config.loadFromPath(path.join(__dirname, './aws.config.json'))
let ddb = new AWS.DynamoDB.DocumentClient()
const DYNAMNO_TABLE = {
  USERVARS: 'rive-uservars' // To store rivescript data from getUservars()
};

module.exports = {
  saveUserRecord(senderID, recipientID, values) {
    console.assert(senderID)
    console.assert(recipientID)
    console.assert(values)
    // console.log('senderID', senderID)
    // console.log('recipientID', recipientID)
    // console.log('values', values)
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
  },

  loadUserRecord(senderID, recipientID) {
    console.assert(senderID)
    console.assert(recipientID)
    // console.log('senderID', senderID)
    // console.log('recipientID', recipientID)
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
}
