/**
 * This module mainly handles RiveScript tasks
 */

const RiveScript = require('rivescript')
const path = require('path')

let rivescript = new RiveScript({
  utf8: true
})

module.exports = {
  /**
   * Initialise the RiveScript. It loads all brain files from rsBrainFiles directory
   */
  init() {
    return new Promise((resolve, reject) => {
      let dir = path.join(__dirname, '/rsBrainFiles')
      rivescript.loadDirectory(dir, (batchNum) => {
        console.log('Batch #' + batchNum + ' loaded successfully')
        // RiveScript brain files loaded
        rivescript.sortReplies()
        return resolve()
      }, () => {
        console.log('error', err)
        return reject(err)
      })
    })
  },

  getReply(userID, msg, state) {
    console.assert(userID)
    console.assert(msg)
    if (state) {
      rivescript.setUservars(userID, state)      
    }
    return new Promise((resolve, reject) => {
      rivescript.replyAsync(userID, msg).then((reply) => {
        return resolve(reply)
      }).catch((err) => {
        return reject(err)
      })
    })
  },

  getUserState(userID) {
    return rivescript.getUservars(userID)
  }
}
