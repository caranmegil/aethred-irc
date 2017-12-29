var IRC = require('irc-framework')
var axios = require('axios')
var idUsers = require('./identifiedUsers')

var bot = new IRC.Client();
bot.connect({
  host: 'irc.freenode.net',
  port: 6667,
  nick: 'aethred',
  username: 'aethred',
  gecos: 'aethred',
});

bot.on('registered', function(event) {
  console.log(`${event.nick} registered`)
})

bot.on('connected', function(event) {
  console.log(`${event.nick} connected`)
})

bot.on('nick', function(event) {
  console.log(event)
})

bot.on('message', function(event) {
  console.log(`${event.nick} -> ${event.target}: ${event.message}`)
  if (event.nick === 'NickServ') {
    var msgMatch = event.message.match(/^(.+) ACC (\d+)$/)
    if (msgMatch) {
      if (msgMatch[2] === '3') {
        console.log(true)
        idUsers.identifyUser(msgMatch[1], true)
      } else {
        console.log(false, msgMatch[2])
        idUsers.identifyUser(msgMatch[1], false)
      }
    }
    return;
  }
})

bot.on('privmsg', function(event) {
  let chance = Math.floor(Math.random() * 10)
  if (chance > 2 && event.target.match(/^\#/)) {
    return
  }
  var cmdMatch = event.message.match(/^!([a-zA-Z0-9\_]+)(?: (.+))?$/)

  if (cmdMatch) {
    axios
      .get(`http://localhost:3000/IRC/${event.nick}`)
      .then((response) => {
        var permissions = response.data.results.filter( (permission) => {
          return permission === 'master'// || permission === 'commander'
        })

        if (permissions.length > 0) {
          matchCommand(cmdMatch, event, response.data.results)
        }
      })
      .catch((err) => console.log(err))
  } else {
    axios
      .post('http://localhost:2000/', {
        text: event.message
      })
      .then(resp => {
        var response = resp.data.response
        if(response && response.length > 0) {
          response.forEach(text => {
            event.reply(text)
          })
        }
      })
      .catch(err => console.log(err))
  }
});

function matchCommand(cmdMatch, event, permissions) {
  switch(cmdMatch[1]) {
    case 'say':
      var sayParams = cmdMatch[2].match(/^(\#?[a-zA-Z0-9\_\@]+) (.+)$/)
      if (sayParams) {
        var target = sayParams[1]
        var msg = sayParams[2]
        bot.say(target, msg)
      }
      break;
    case 'action':
      var actionParams = cmdMatch[2].match(/^(\#?[a-zA-Z0-9\_\@]+) (.+)$/)
      if (actionParams) {
        var target = actionParams[1]
        var action = actionParams[2]
        bot.action(target, action)
      }
      break;
    case 'mode':
      var modeParams = cmdMatch[2].match(/(\#\S+) ([+-][opsitnmlbvkw]+)(?: (.+))?$/)
      if (modeParams) {
        var channel = modeParams[1]
        var ops = modeParams[2]
        var nick = (modeParams[3]) ? modeParams[3] : null

        if (nick) {
          bot.raw(`MODE ${channel} ${ops} ${nick}`)
        } else {
          bot.raw(`MODE ${channel} ${ops}`)
        }
        event.reply('Setting mode for channel ' + channel + ' with ' + ops + ' for ' + nick)
      }
      break;
    case 'join':
      var toJoin = cmdMatch[2]
      event.reply('Joining ' + toJoin + '..');
      bot.join(toJoin);
      break;
    case 'part':
    case 'leave':
      var toLeave = cmdMatch[2]
      event.reply('Leaving ' + toLeave + '..')
      bot.part(toLeave)
      break;
    case 'quit':
      event.reply('Quitting')
      bot.quit()
      break;
    case 'kick':
      var kickParams = cmdMatch[2].match(/(\#\S+) (\S+)/)
      if (kickParams) {
        var channel = kickParams[1]
        var who = kickParams[2]
        bot.raw(`KICK ${channel} ${who}`)
        event.reply(`Kicking ${who} from ${channel}`)
      }
      break;
    case 'kickban':
      var kickParams = cmdMatch[2].match(/(\#\S+) (\S+)/)
      if (kickParams) {
        var channel = kickParams[1]
        var who = kickParams[2]
        bot.raw(`KICK ${channel} ${who}`)
        bot.raw(`MODE ${channel} +b ${who}`)
        event.reply(`Kicking ${who} from ${channel}`)
      }
      break;
    case 'topic':
      var topicParams = cmdMatch[2].match(/^(\#\S+) (.+)$/)
      if (topicParams) {
        var channel = topicParams[1]
        var topic = topicParams[2]
        bot.setTopic(channel, topic)
      }
      break;
    case 'nick':
      var nickParam = cmdMatch[2].match(/^\s*(.+)\s*$/)
      if (nickParam) {
        event.reply(`Changing nick to ${nickParam[1]}`)
        bot.changeNick(nickParam[1])
      }
      break;
  }
}
