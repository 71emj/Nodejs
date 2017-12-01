const FileS = require("fs"),
	Twitter = require("twitter"),
	Promise = require("es6-promise");

const Keys = require("./key.js"),
	twitterClient = new Twitter(Keys.twitterKeys);

let globalCount = 1;

const textPath = "./fake_tweet.txt";
const numberOfTweets = 5,
	maxInterval = 10,
	minInterval = 1;

function grabRandomPara() {
	return new Promise((resolve) => {
		FileS.readFile(textPath, "utf8", (err, data) => {
			const text = data;
			const ranBoundary = (arrLen) => {
					return Math.floor(Math.random() * arrLen);
				},
				ranTextLen = () => {
					return Math.floor(Math.random() * 141) + 48; // max 140 min 15 characters
				};

			const textIndexArr = text.match(/\W[A-Z]/g), // return an array
				boundaryIndex = text.indexOf(textIndexArr[ranBoundary(textIndexArr.length)]);
			let newText = "",
				textLen = ranTextLen();
			for (let i = boundaryIndex; i < boundaryIndex + textLen; ++i) {
				newText += text[i];
			}

			newText.trim();
			newText = newText.replace(/\n/g, "");
			newText = newText.replace(/\"\'/, "");
			const lastIndexOfPeriod = newText.lastIndexOf(".");

			const postText = !!(lastIndexOfPeriod) ? newText.slice(0, lastIndexOfPeriod + 1) : newText + ".";
			resolve(postText.trim());
		});
	})
}

function postJibberishOnTwitter() {
	return new Promise((resolve, reject) => {
		grabRandomPara().then((text) => {
			const fakeTweet = text;
			console.log("Tweet No." + globalCount + " posted!!");
			console.log(fakeTweet + "this is the posted text....\n");

			twitterClient.post('statuses/update', { status: fakeTweet }).then(function(tweet) {
				console.log("Tweet No." + globalCount + " posted!!");
				console.log(fakeTweet + "this is the posted text....\n");

				twitterClient.get("statuses/user_timeline", { count: globalCount }, (error, tweets, res) => {
					if (!!error) {
						console.log(error.message);
						console.log("Oopsy, something went wrong");
					}

					tweets.forEach((elem, index) => {
						console.log(elem.created_at);
						console.log("Message %i: %s", index + 1, elem.text);
					});
				});

				const timeoutId = setTimeout(() => {
					++globalCount;
					postJibberishOnTwitter();
				}, (Math.floor(Math.random() * maxInterval) + minInterval) * 60000);

				if (globalCount >= numberOfTweets) {
					clearTimeout(timeoutId);
					resolve("Success!!");
				}
			}).catch(function(error) {
				reject(error);
			});
		});
	});
};

postJibberishOnTwitter().then((msg) => {
	console.log(msg);
}).catch((error) => {
	console.log(error);
	console.log("Noooo something went wrong and can't post jibberish on twitter. Please let post a bug report.");
	Files.appendFile("./error_log.txt", error + "\n\n", "utf8", (err) => {
		!!err && console.log(err.message);
		return;
	});
});

FileS.readFile(textPath, "utf8", (err, data) => {
	const text = data.replace(/\s+/g, " ");
	FileS.writeFile(textPath, text, "utf8", (err, data) => {
		console.log("It is done");
	})
});