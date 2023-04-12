var http = require("http");
var https = require("https");
const fs = require("fs");
const util = require("util");
const XmlStream = require("xml-stream");
const { getUser } = require("./subscribe");

const readFile = util.promisify(fs.readFile);

async function writeUserData(username, importData) {
  const content = await readFile("./usernames.txt", "utf8");
  const data = JSON.parse(content);
  const tempData = { ...data };
  tempData[username] = importData;
  console.log(tempData);
  console.log(JSON.stringify(tempData));
  try {
    fs.writeFileSync("./usernames.txt", JSON.stringify(tempData));
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

async function getUserData(username) {
  const user = await getUser(username);
  const userReviews = [];

  return new Promise((resolve, reject) => {
    https
      .get(
        `https://www.backloggd.com/u/${username}/reviews/rss/`,
        function (response) {
          response.setEncoding("utf8");
          var xml = new XmlStream(response);
          xml.on("updateElement: item", function (item) {
            const { title, link, pubDate, description, image, guid } = item;
            delete image["$name"];
            const id = guid["$text"];
            delete guid["$"];
            delete guid["$text"];
            delete guid["$name"];
            console.log(id);
            userReviews.push({
              title,
              link,
              pubDate,
              description,
              image,
              id,
            });
          });
          user["reviews"] = userReviews;
          writeUserData(username, user);
        }
      )
      .on("error", function (e) {
        resolve(false);
      });
  });
}

module.exports = {
  config: {
    name: "review",
    description: "Get updates for user",
    usage: `!review`,
  },
  async run(bot, message, args) {
    const username = args[0];
    getUserData(username);
  },
};
