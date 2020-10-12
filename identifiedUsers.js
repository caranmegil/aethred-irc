/*

identifiedUsers.js - functions used around determination if a user is identified
Copyright (C) 2020  William R. Moore <caranmegil@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

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
