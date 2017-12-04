const FileS = require("fs"),
	Twitter = require("twitter"),
	Promise = require("es6-promise"),
	Inquirer = require("inquirer");

const Keys = require("./key.js"),
	twitterClient = new Twitter(Keys.twitterKeys);

let globalCount = 1;

const textPath = "./fake_tweet.txt";

const Interface = {
	// we store data here : )
	data: {
		tweetCount: 0,
		intervalMax: 0,
		intervalMin: 0
	},

	confirmStart: function() {
		Inquirer.prompt([{
			"type": "confirm",
			"message": "Are we all set?",
			"name": "isReady",
			"filter": (str) => {
				return !!str.match(/\y|\g|\o/i) ? true : false;
			}
		}]).then((data) => {
			if (data.isReady) {
				console.log("Okay we are all set!! Let's launch this.");
				setTimeout(() => {

					// this needs some working on	
					postJibberishOnTwitter(this.tweetCount, this.intervalMax, this.intervalMin).then((msg) => {
						console.log(msg);
					}).catch((error) => {
						console.log(error);
						console.log("Noooo something went wrong and can't post jibberish on twitter. Please let post a bug report.");
						Files.appendFile("./error_log.txt", error + "\n\n", "utf8", (err) => {
							!!err && console.log(err.message);
							return;
						});
					});;

				}, 500);
			} else {
				console.log("Alright, let's start over.\n");
				setTimeout(() => {
					this.initiatiation();
				}, 500);
			}
		})
	},

	// basic interface
	initiatiation: function() {
		Inquirer.prompt([{
			"type": "confirm",
			"message": "Hi, I'm your helper Liri. Let's setup how we want to post our tweets, sounds good?",
			"name": "isInit",
			// it seems inquirer filter it out for me
			"filter": (str) => {
				return !!str.match(/\y|\g|\ok/i) ? true : false;
			}
		}, {
			"type": "input",
			"message": "Awesome, let's start the initial config. How many tweets would you like to send today?",
			"name": "numOfTweets",
			"validate": (value) => {
				return !isNaN(value) ? true : false;
			},
			"when": (answers) => {
				return answers.isInit;
			}
		}, {
			"type": "input",
			"message": "How about the maximum time(minutes) between each interval?",
			"name": "max",
			"validate": (value) => {
				return !isNaN(value) ? true : false;
			},
			"when": (answers) => {
				return answers.isInit;
			}
		}, {
			"type": "input",
			"message": "And the minimum time(minutes)?",
			"name": "min",
			"validate": (value) => {
				return !isNaN(value) ? true : false;
			},
			"when": (answers) => {
				return answers.isInit;
			}
		}]).then((data) => {
			if (!data.isInit) {
				return console.log("Okay, see you next time.");
			}
			this.tweetCount = data.numOfTweets || 5;
			this.intervalMax = data.max || 10;
			this.intervalMin = data.min || 1;
			this.confirmStart();
		})
	}
}

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

function postJibberishOnTwitter(numberOfTweets, maxInterval, minInterval) {
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
					postJibberishOnTwitter(numberOfTweets, maxInterval, minInterval);
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


Interface.initiatiation();


FileS.readFile(textPath, "utf8", (err, data) => {
	const text = data.replace(/\s+/g, " ");
	FileS.writeFile(textPath, text, "utf8", (err, data) => {
		// console.log("It is done");
	})
});