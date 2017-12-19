var AsyncLock = require('node-async-locks').AsyncLock;
var moment = require('moment')

var identifiedLock = new AsyncLock()

var identifiedUsers = {}

function identifyUser(nick, status) {
  identifiedLock.enter((token) => {
    identifiedUsers[nick] = {
      status: status,
      lastChecked: moment(),
    }
    identifiedLock.leave(token)
  })
}

function isUserAvailable(nick, bot, cb) {
  identifiedLock.enter((token) => {
    var test = moment()
    test.add(-10, 'minutes')

    if (identifiedUsers[nick] && test.isBefore(identifiedUsers[nick].lastChecked)) {
      cb(true)
    } else {
      bot.say('NickServ', `ACC ${nick}`)
      cb(false)
    }
    identifiedLock.leave(token)
  })
}

function isUserIdentified(nick, bot, cb) {
  identifiedLock.enter((token) => {
    var test = moment()
    test.add(-10, 'minutes')

    if (identifiedUsers[nick] && test.isBefore(identifiedUsers[nick].lastChecked)) {
      cb(identifiedUsers[nick].status)
    } else {
      cb(false)
    }

    cb(false)
    identifiedLock.leave(token)
  })
}

module.exports = {
  'identifyUser': identifyUser,
  'isUserIdentified': isUserIdentified,
  'isUserAvailable': isUserAvailable,
}
