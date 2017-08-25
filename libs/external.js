const request = require('request')
const util = require('./util')
const _ = require('lodash')

module.exports = {
  /**
   * Call Yahoo Finance to get stock symbol from company name
   * @param {object} rs Rivescript object 
   * @param {string} companyName Company name looking for
   * Notes: http://www.jarloo.com/yahoo-stock-symbol-lookup/
   */
  getStockSymbolsByNameFromYahoo(rs, companyName) {
    return new Promise((resolve, reject) => {
      // Prepare to call Yahoo Finance
      let nameEnc = encodeURI(companyName)
      let yurl = 'http://autoc.finance.yahoo.com/autoc?query=' + nameEnc + '&region=any&lang=en'
      request(yurl, (err, response, body) => {
        if (err) {
          console.error(err)
          return reject(err)
        } else {
          let yres = JSON.parse(body)
          // console.log(yres)
          // Consolidate the useful result(s)
          const USEFUL = ['NYSE', 'NASDAQ', 'London', 'Hong Kong']
          let exchAdded = []
          let symbols = []
          yres.ResultSet.Result.forEach((symRec) => {
            // console.log(symRec)
            // ignore some unhandled markets
            if (USEFUL.indexOf(symRec.exchDisp) >= 0 && exchAdded.indexOf(symRec.exchDisp) < 0) {
                symbols.push(symRec)
                exchAdded.push(symRec.exchDisp)
            }
          })
          return resolve(symbols)
        }
      })
    })
  },

  /**
   * Call Yahoo Finance API to get stock price 
   * @param {string} symb Stock symbol. e.g. APPL
   * Note: http://wern-ancheta.com/blog/2015/04/05/getting-started-with-the-yahoo-finance-api/
   */
  getStockPriceBySimbolFromYahoo(symb) {
    return new Promise((resolve, reject) => {
      let yurl = 'http://finance.yahoo.com/d/quotes.csv?s=' + symb + '&f=abo'
      request(yurl, (err, response, body) => {
        if (err) {
          console.error(err)
          return reject(err)
        } else {
          return resolve(body)
        }
      })
    })
  }
}