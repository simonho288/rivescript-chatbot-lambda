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

/**
 * Initialise the RiveScript. It loads all brain files from rsBrainFiles directory
 */
function init() {
  return new Promise((resolve, reject) => {
    let dir = path.join(__dirname, '/rsBrainFiles')
    rivescript.loadDirectory(dir, (batchNum) => {
      console.log('Batch #' + batchNum + ' loaded successfully')
      // RiveScript brain files loaded
      setupSubroutines(rivescript)
      rivescript.sortReplies()
      return resolve()
    }, () => {
      console.log('error', err)
      return reject(err)
    })
  })
}

/**
 * Register rivescript subroutines
 * @param {object} RiveScript object 
 */
function setupSubroutines(rs) {
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
}

/**
 * Process the message by using RiveScript and return the reply
 * @param {string} userID 
 * @param {string} msg 
 * @param {object} state 
 */
function getReply(userID, msg, state) {
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
}

/**
 * Assign a user state to Rivescript object.
 * @param {string} userID Rivescript user ID
 * @param {object} state Reivescript user state
 * More info user state management: https://github.com/aichaos/rivescript-js/issues/46
 */
function setUserState(userID, state) {
  rivescript.setUservars(userID, state)
}

/**
 * Get current user state from Rivescript object.
 * @param {string} userID Rivescript user ID
 */
function getUserState(userID) {
  return rivescript.getUservars(userID)
}

/**
 * Get a user variable from Rivescript
 * @param {string} userID Rivescript user ID
 * @param {string} name Variable name
 * Note: More info of Rivescript variables: https://www.rivescript.com/docs/tutorial#definitions
 */
function getUserVariable(userID, name) {
  return rivescript.getUservar(userID, name)
}

// expose the functions for other modules
module.exports = {
  init,
  getReply,
  setUserState,
  getUserState,
  getUserVariable
}