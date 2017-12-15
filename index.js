var IRC = require('irc-framework')
var axios = require('axios')

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
  console.log(`${event.target}: ${event.message}`)
})

bot.on('privmsg', function(event) {
  if (event.target.match(/^\#/)) {
    return
  }
  var cmd_match = event.message.match(/^!([a-zA-Z0-9\_]+)(?: (.+))?$/)

  if (cmd_match) {
    switch(cmd_match[1]) {
      case 'say':
        var say_match = cmd_match[2].match(/^(\#?[a-zA-Z0-9\_\@]+) (.+)$/)
        if (say_match) {
          var target = say_match[1]
          var msg = say_match[2]
          bot.say(target, msg)
        }
        break;
      case 'action':
        var action_match = cmd_match[2].match(/^(\#?[a-zA-Z0-9\_\@]+) (.+)$/)
        if (action_match) {
          var target = action_match[1]
          var action = action_match[2]
          bot.action(target, action)
        }
        break;
      case 'mode':
        var mode_match = cmd_match[2].match(/(\#\S+) ([+-][opsitnmlbvkw]+)(?: (.+))?$/)
        if (mode_match) {
          var channel = mode_match[1]
          var ops = mode_match[2]
          var nick = (mode_match[3]) ? mode_match[3] : null

          if (nick) {
            bot.raw(`MODE ${channel} ${ops} ${nick}`)
          } else {
            bot.raw(`MODE ${channel} ${ops}`)
          }
          event.reply('Setting mode for channel ' + channel + ' with ' + ops + ' for ' + nick)
        }
        break;
      case 'join':
        var to_join = cmd_match[2]
      	event.reply('Joining ' + to_join + '..');
      	bot.join(to_join);
        break;
      case 'part':
      case 'leave':
        var to_leave = cmd_match[2]
        event.reply('Leaving ' + to_leave + '..')
        bot.part(to_leave)
        break;
      case 'quit':
        event.reply('Quitting')
        bot.quit()
        break;
      case 'kick':
        var kick_params = cmd_match[2].match(/(\#\S+) (\S+)/)
        if (kick_params) {
          var channel = kick_params[1]
          var who = kick_params[2]
          bot.raw(`KICK ${channel} ${who}`)
          event.reply(`Kicking ${who} from ${channel}`)
        }
        break;
      case 'kickban':
        var kick_params = cmd_match[2].match(/(\#\S+) (\S+)/)
        if (kick_params) {
          var channel = kick_params[1]
          var who = kick_params[2]
          bot.raw(`KICK ${channel} ${who}`)
          bot.raw(`MODE ${channel} +b ${who}`)
          event.reply(`Kicking ${who} from ${channel}`)
        }
        break;
      case 'topic':
        var topic_params = cmd_match[2].match(/^(\#\S+) (.+)$/)
        if (topic_params) {
          var channel = topic_params[1]
          var topic = topic_params[2]
          bot.setTopic(channel, topic)
        }
        break;
      case 'nick':
        var nick_param = cmd_match[2].match(/^\s*(.+)\s*$/)
        if (nick_param) {
          event.reply(`Changing nick to ${nick_param[1]}`)
          bot.changeNick(nick_param[1])
        }
        break;
    }
  } else {
    axios.post('http://localhost:2000/', {
      text: event.message
    }).then(resp => {
      var response = resp.data.response
      if(response && response.length > 0) {
        response.forEach(text => {
          event.reply(text)
        })
      }
    }).catch(err => {

    })
  }
});
