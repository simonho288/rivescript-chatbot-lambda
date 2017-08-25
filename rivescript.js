/**
 * This module mainly handles RiveScript tasks
 */

const RiveScript = require('rivescript')
const path = require('path')
const external = require('./libs/external.js')
const util = require('./libs/util.js')

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
        this.setupSubroutines(rivescript)
        rivescript.sortReplies()
        return resolve()
      }, () => {
        console.log('error', err)
        return reject(err)
      })
    })
  },

  /**
   * Register rivescript subroutines
   * @param {object} RiveScript object 
   */
  setupSubroutines(rs) {
    // getStockPrice subroutine
    rivescript.setSubroutine('getStockPrice', (rs, args) => {
      console.log(args)
      let stockName = args[0]
      let userId = rs.currentUser()
      return new rs.Promise((resolve, reject) => {
        external.getStockSymbolsByNameFromYahoo(rs, stockName).then((symbols) => {
          // console.log('symbols:')
          // console.log(symbols)
          if (symbols.length === 0) {
            // no symbol found
            resolve('Unkown company name:' + stockName)
          } else if (symbols.length === 1) {
            // only one symbol, so get & display the stock price directly
            external.getStockPriceBySimbolFromYahoo(symbols[0].symbol).then((result) => {
              console.log('result', result)
              let parts = result.split(',')
              resolve(stockName + ' stock price is ' + parts[2])
            })
          } else {
            // multi symbols return, make buttons list
            let buttons = []
            symbols.forEach((symb) => {
              buttons.push({
                text: symb.exchDisp,
                payload: 'GETSTOCKPRICE_' + symb.symbol + '_' + encodeURI(stockName)
              })
            })
            const fbWebook = require('./webhookfb.js')
            fbWebook.sendButtonMessage(userId, 'Please specify which market of ' + stockName, buttons)
          }
        })
      })
    })
  },

  /**
   * Process the message by using RiveScript and return the reply
   * @param {string} userID 
   * @param {string} msg 
   * @param {object} state 
   */
  getReply(userID, msg, state) {
    console.assert(userID)
    console.assert(msg)
    if (state) {
      rivescript.setUservars(userID, state)
    } else {
      rivescript.setUservars(userID, null)
    }
    return new Promise((resolve, reject) => {
      rivescript.replyAsync(userID, msg).then((reply) => {
        return resolve(reply)
      }).catch((err) => {
        return reject(err)
      })
    })
  },

  setUserState(userID, state) {
    rivescript.setUservars(userID, state)
  },

  getUserState(userID) {
    return rivescript.getUservars(userID)
  },

  getUserVariable(userID, name) {
    return rivescript.getUservar(userID, name)
  }
}
