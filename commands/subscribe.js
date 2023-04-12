var http = require("http");
var https = require("https");
const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);

function checkWebsite(username) {
  return new Promise((resolve, reject) => {
    https
      .get(
        `https://www.backloggd.com/u/${username}/reviews/rss/`,
        function (res) {
          resolve(res.statusCode === 200);
        }
      )
      .on("error", function (e) {
        resolve(false);
      });
  });
}

async function getUser(username) {
  try {
    const content = await readFile("./usernames.txt", "utf8");
    var data = JSON.parse(content);
    return data[username];
  } catch (e) {
    console.error(e);
  }
}

function subscribeUser(username) {
  console.log("implement me");
}

module.exports = {
  config: {
    name: "subscribe",
    description: "Get updates for user",
    usage: `!subscribe`,
  },
  async run(bot, message, args) {
    const username = args[0];
    const user = await getUser(username);
    const isUser = await checkWebsite(username);
    if (user !== undefined) {
      message.channel.send("Already subscribed");
    } else {
      if (isUser) {
        subscribeUser(username);
        message.channel.send("Subscribed to " + username);
      } else {
        message.channel.send(
          "Invalid Username. Not subscribed to `" + username
        );
      }
    }
  },
  async getUser(username) {
    try {
      const content = await readFile("./usernames.txt", "utf8");
      var data = JSON.parse(content);
      return data[username];
    } catch (e) {
      console.error(e);
    }
  },
};
