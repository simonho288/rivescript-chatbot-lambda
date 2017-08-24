/**
 * This module mainly handles AWS SimpleDB tasks
 */

const path = require('path')
const AWS = require('aws-sdk')

// Create the DynamoDB service object
AWS.config = new AWS.Config()

// let ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'})
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



/*
const SDB_DOMAIN = 'iamsimonchatbot' // SimpleDB domain we're using

// Configure & initialise AWS SimpleDB
aws.config = new aws.Config({
  accessKeyId: 'AKIAINI47NVF5QM25PYQ',
  secretAccessKey: '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'
})
var simpledb = new aws.SimpleDB({
  region: 'US-East',
  endpoint: 'https://sdb.amazonaws.com'
})

module.exports = {
  // Add a user record to SimpleDB
  saveUserRecord: (userId, values) => {
    console.assert(userId)
    console.assert(values)
    return new Promise((resolve, reject) => {
      let attrs = [{
        Name: 'user_record',
        Value: JSON.stringify(values)
      }]
      simpledb.putAttributes({
        DomainName: SDB_DOMAIN,
        ItemName: userId,
        Attributes: attrs
      }, (err, result) => {
        if (err) {
          return reject(err)
        } else {
          return resolve(result)
        }
      })
    })
  },

  // Retrieve user record from SimpleDB
  loadUserRecord: (userId) => {
    console.assert(userId)
    return new Promise((resolve, reject) => {
      simpledb.getAttributes({
        DomainName: SDB_DOMAIN,
        ItemName: userId
      }, (err, result) => {
        if (err) {
          return reject(err)
        } else {
          return resolve(result.Attributes)
        }
      })
    })
  }
}
*/