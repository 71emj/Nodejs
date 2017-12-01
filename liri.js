// npm dependencies
const Inquirer = require("inquirer"),
	Request = require("request"),
	FileS = require("fs"),
	Twitter = require("twitter"),
	Spotify = require("spotify-web-api-node");

// init apis
const Keys = require("./key.js"),
	twitterClient = new Twitter(Keys.twitterKeys),
	spotifyClient = new Spotify(Keys.spotifyKeys),
	omdbKeys = Keys.omdbKeys;

// Hi, my name is Liri
const Liri = {
	logActions: (argArr, action, that) => {
		let temp, tempTxt = "\n\n",
			accessCount = 0;

		FileS.exists("./log.txt", (exists) => {
			// if (!exists) { new Error("Log file doesn't exists..."); }
			FileS.readFile("./log.txt", "utf8", (err, data) => {
				!!err && console.log(err.message);

				if (exists) {
					temp = data.split("\n");
					accessCount = parseInt(temp[temp.length - 1]) + 1;
				} else {
					tempTxt = "";
					accessCount = 1;
				}
				tempTxt += accessCount < 10 ? "Access: 00" + accessCount : "Access: 0" + accessCount;
				tempTxt += ", " + "\"" + action + "\"\n\n" + "Search Result: \n"; //Access: 001, "my-tweets" \n\n
				argArr.forEach((elem) => {
					tempTxt += elem + "\n";
				});
				tempTxt += accessCount; // still need this in order to easily access stored num

				FileS.appendFile("./log.txt", tempTxt, "utf8", (err) => {
					!!err && console.log(err.message);
					setTimeout(() => {
						console.log("\n");
						that.liriAwaits("Hello again, what do you want to do next?");
					}, 2000);
				});
			});
		});
	},

	liriAwaits: function(msg) {
		const greetings = msg || "Hi, my name is Liri. What can I do for you today?";
		const actions = [
			"Liri, show me my tweets",
			"Liri, find me a song",
			"Liri, tell me about this movie",
			"Liri, I'm feeling adventurous today :)",
			"Liri, stop."
		];
		Inquirer.prompt([{
			"type": "list",
			"message": greetings,
			"choices": actions,
			"name": "action"
		}]).then((data) => {
			actions.forEach((elem, index) => {
				if (data.action === elem) {
					index == 0 && this["my-tweets"]("my-tweets");
					index == 1 && this["spotify-this-song"]("spotify-this-song");
					index == 2 && this["movie-this"]("movie-this");
					index == 3 && this["do-what-it-says"]("do-what-it-says");
					index == 4 && console.log("Okay, I'll see you next time.");
				}
			});
			return;
		});
	},

	"my-tweets": function(action) {
		Inquirer.prompt([{
			"type": "input",
			"message": "How many messages would you like me to pull from twitter post?",
			"name": "count",
			"default": 20
		}]).then((data) => {
			const msgCount = data.count;
			console.log("Okay, hold on a second..\n");
			twitterClient.get("statuses/user_timeline", { count: msgCount }, (error, tweets, res) => {
				if (!!error) {
					console.log("Uh oh something's not right, let's try it again.\n");
					return this["my-tweets"]("my-tweets");
				}
				console.log("Alright, here's your latest " + msgCount + " tweets.\n");
				setTimeout(() => {
					const datArr = new Array();
					tweets.forEach((elem, index) => {
						console.log(elem.created_at);
						console.log("Message %i: %s", index + 1, elem.text);
						datArr.push(elem.created_at + "\n" + elem.text);
					});
					this.logActions(datArr, action, this);
				}, 1000);
			});
		})
	},

	"spotify-this-song": function(action) {
		Inquirer.prompt([{
			"type": "input",
			"message": "What's the name of the song you are looking for?",
			"name": "songName"
		}, {
			"type": "list",
			"message": "Do you know the name of the artist?",
			"choices": [
				"Yes",
				"Err...no?"
			],
			"name": "nameExist",
			"filter": (str) => {
				return str === "Yes" ? true : false;
			}
		}, {
			"type": "input",
			"message": "Okay, what's the name of the artist?",
			"name": "artistName",
			"when": (answers) => {
				return answers.nameExist === true;
			}
		}]).then((data) => {
			let queryString = "";
			const songName = data.songName,
				artistName = data.artistName;

			if (!data.songName && !data.nameExist) {
				console.log("Well you didn't tell what to look for...so I gonna find you my favorite : )\n");
				queryString = "track:" + "The Sign" + " " + "artist:" + "Ace of Base";
			} else if (!!data.songName) {
				console.log("Okay, hang on a second...\n");
				queryString = data.nameExist ? "track:" + songName + " " + "artist:" + artistName : "track:" + songName;
			} else {
				console.log("Sorry I can't find a song without the name of the song...\n");
				return this["spotify-this-song"]("spotify-this-song");
			}

			spotifyClient.clientCredentialsGrant().then((data) => {
				spotifyClient.setAccessToken(data.body['access_token']);
				// spotifyClient.setRefreshToken(data.body['refresh_token']);
				spotifyClient.searchTracks(queryString, { limit: 1, market: "US" }).then((data) => {
					const datConcat = (arr) => {
						let artistName = "";
						arr.forEach((elem, index) => {
							index === arr.length - 1 ? artistName += elem.name : artistName += elem.name + ", ";
						})
						return "Artist(s): " + artistName;
					};
					const dataPath = data.body.tracks.items[0], // items === Array() && limit 1
						searchName = "Name of the song: " + dataPath["name"],
						searchArtist = datConcat(dataPath["artists"]),
						searchAlbum = "Album name: " + dataPath["album"].name,
						searchPreview = "Link to preview: " + dataPath["preview_url"],
						datArr = [searchName, searchArtist, searchAlbum, searchPreview];

					console.log("Okay, here's what I can find you about the song " + songName + ".\n");
					setTimeout(() => {
						datArr.forEach((elem) => {
							console.log(elem);
						});
						this.logActions(datArr, action, this);
					}, 1000);

				}, function(err) {
					console.log('Something went wrong!', err);
					console.log("Let's try this again.\n");
					return this["spotify-this-song"]("spotify-this-song");
				});
			}, function(err) {
				console.log('Something went wrong when retrieving an access token', err);
				console.log("I'm sorry there's nothing I can do right now, please report this bug to my creator.");
			});
		});
	},

	"movie-this": function(action) {
		Inquirer.prompt([{
			"type": "input",
			"message": "Cool I love movies, what do you want me to find?",
			"name": "movieName"
		}]).then((data) => {
			!!data.movieName ? console.log("Okay, hang on a second...\n") :
				console.log("Hmmm...well I'm gonna recommend you my favorite : )\n");
			const movie = data.movieName || "Mr. Nobody";
			const queryUrl = "http://www.omdbapi.com/?apikey=" + omdbKeys + "&t=" + movie + "&plot=full&type=movie&r=json";
			// omdb response with JSON string
			Request(queryUrl, (err, response, body) => {
				if (err) {
					console.log("Uh oh something's not right, let's try it again.\n");
					return this["movie-this"]("movie-this");
				}

				if (JSON.parse(body)["Error"]) {
					console.log("Hm I can't find any movie matches that name, maybe you remember it wrong...?");
					console.log("Let's try this again.\n")
					return this["movie-this"]("movie-this");
				}

				const movieObj = JSON.parse(body),
					searchTitle = "Movie title: " + movieObj["Title"],
					searchYear = "Release year: " + movieObj["Year"],
					searchRating = "IMDB: " + movieObj["imdbRating"],
					searchRatingRT = movieObj["Ratings"].length > 1 ? "Rotten Tomatoes: " + movieObj["Ratings"][1]["Value"] : "Rotten Tomatoes: no rating",
					searchCountry = "Country: " + movieObj["Country"],
					searchLang = "Language: " + movieObj["Language"],
					searchPlot = "Plot: " + movieObj["Plot"],
					searchCast = "Cast: " + movieObj["Actors"],
					datArr = [searchTitle, searchYear, searchRating, searchRatingRT, searchCountry, searchLang, searchPlot, searchCast];

				console.log("Alright, here's everything you would like to know about " + movieObj["Title"] + ".\n");
				setTimeout(() => {
					datArr.forEach((elem) => {
						console.log(elem);
					});
					this.logActions(datArr, action, this);
				}, 1000);
			});
		})
	},

	"do-what-it-says": function() {
		FileS.readFile("./random.txt", "utf8", (err, data) => {
			const random = (range) => {
					return Math.floor(Math.random() * range);
				},
				command = data.split(",")[random(data.split(",").length)];
			console.log(command.trim());
			command.trim() !== "spotify-this-song" ? this[command.trim()]() :
				this[command.trim()](command.trim());
		});
	}
};

// Liri, at your service
Liri.liriAwaits();