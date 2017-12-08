var IRC = require('irc-framework')
var axios = require('axios')

var bot = new IRC.Client();
bot.connect({
  host: 'irc.freenode.net',
  port: 6667,
  nick: 'aethred'
});

bot.on('privmsg', function(event) {
  if (event.target.match(/^\#/)) {
    return
  }
  var cmd_match = event.message.match(/^!([a-zA-Z0-9\_]+)(?: (.+))?$/)
  var mode_match = event.message.match(/^!mode (\#[a-zA-Z0-9\_]+) ([+-][opsitnml]+)(?: (.+))?$/)
  var say_match = event.message.match(/^!say (\#[a-zA-Z0-9\_]+) (.+)$/)
  if (say_match) {
    var channel = say_match[1]
    var msg = say_match[2]
    bot.say(channel, msg)
  } else if (mode_match) {
    var channel = mode_match[1]
    var ops = mode_match[2]
    var nick = (mode_match[3]) ? mode_match[3] : null

    if (nick) {
      bot.raw(`MODE ${channel} ${ops} ${nick}`)
    } else {
      bot.raw(`MODE ${channel} ${ops}`)
    }
    event.reply('Setting mode for channel ' + channel + ' with ' + ops + ' for ' + nick)
  } else if (cmd_match) {
    switch(cmd_match[1]) {
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
    }
  } else {
    axios.post('http://localhost:5000/', {
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
