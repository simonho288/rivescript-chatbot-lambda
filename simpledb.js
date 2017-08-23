const path = require('path')
const aws = require('aws-sdk')

const SDB_DOMAIN = 'iamsimonchatbot' // SimpleDB domain we're using

// Configure & initialise AWS SimpleDB
var simpledb = new aws.SimpleDB({
  region: 'US-East',
  endpoint: 'https://sdb.amazonaws.com'
})

module.exports.SDB = {
  /**
   * Add a user record to SimpleDB
   */
  addUserRecord: (userId, values) => {
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

  /**
   * Retrieve user record from SimpleDB
   */
  getUserRecord: (userId) => {
    console.assert(userId)
    return new Promise((resolve, reject) => {
      simpledb.getAttributes({
        DomainName: SDB_DOMAIN,
        ItemName: userId
      }, (err, result) => {
        if (err) {
          return reject(err)
        } else {
          if (!result.Attributes) {
            return reject('Record attributes not found!')
          } else {
            return resolve(result.Attributes)
          }
        }
      })
    })
  }
}
