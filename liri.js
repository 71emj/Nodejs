// npm dependencies
const Request = require("request"),
	FileS = require("fs"),
	Twitter = require("twitter"),
	Spotify = require("spotify-web-api-node");

// init apis
const Keys = require("./key.js"),
	twitterClient = new Twitter(Keys.twitterKeys),
	spotifyClient = new Spotify(Keys.spotifyKeys),
	omdbKeys = Keys.omdbKeys;

// process.argv variables
const action = process.argv[2] || "default",
	arg1 = process.argv[3],
	arg2 = process.argv[4];


const Liri = {
	// these are helper methods
	default: () => {
		console.log("You need to tell liri what to do!!");
	},

	logActions: (argArr) => {
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
					return;
				});
			});
		});
	},
	// liri functionalities
	"my-tweets": function(msgCount = 20) {
		twitterClient.get("statuses/user_timeline", { count: msgCount }, (error, tweets, res) => {
			if (!!error) {
				console.log(error.code);
				console.log(error.message);
				return;
			}
			const datArr = new Array();
			tweets.forEach((elem, index) => {
				console.log(elem.created_at);
				console.log("Message %i: %s", index + 1, elem.text);
				datArr.push(elem.created_at + "\n" + elem.text);
			});
			this.logActions(datArr);
		});
	},

	"spotify-this-song": function(songName, artistName) {
		let queryString = "";
		if (!songName && !artistName) {
			queryString = "track:" + "The Sign" + " " + "artist:" + "Ace of Base";
		} else {
			queryString = !!artistName ? "track:" + songName + " " + "artist:" + artistName : "track:" + songName;
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

				datArr.forEach((elem) => {
					console.log(elem);
				});
				this.logActions(datArr);
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		}, function(err) {
			console.log('Something went wrong when retrieving an access token', err);
		});
	},

	"movie-this": function(movieName) {
		const movie = movieName || "Mr. Nobody";
		const queryUrl = "http://www.omdbapi.com/?apikey=" + omdbKeys + "&t=" + movie + "&plot=full&type=movie&r=json";
		// omdb response with JSON string
		Request(queryUrl, (err, response, body) => {
			!!err && console.log(err);
			// console.log(JSON.parse(body));
			const movieObj = JSON.parse(body),
				searchTitle = "Movie title: " + movieObj["Title"],
				searchYear = "Release year: " + movieObj["Year"],
				searchRating = "IMDB: " + movieObj["imdbRating"],
				searchRatingRT = "Rotten Tomatoes: " + movieObj["Ratings"][1]["Value"],
				searchCountry = "Country: " + movieObj["Country"],
				searchLang = "Language: " + movieObj["Language"],
				searchPlot = "Plot: " + movieObj["Plot"],
				searchCast = "Cast: " + movieObj["Actors"],
				datArr = [searchTitle, searchYear, searchRating, searchRatingRT, searchCountry, searchLang, searchPlot, searchCast];

			datArr.forEach((elem) => {
				console.log(elem);
			});
			this.logActions(datArr);
		});
	},

	"do-what-it-says": function() {
		FileS.readFile("./random.txt", "utf8", (err, data) => {
			const random = (range) => {
					return Math.floor(Math.random() * range);
				},
				command = data.split(",")[random(data.split(",").length)];
			console.log(command.trim());
			command.trim() !== "spotify-this-song" ? this[command.trim()]() :
				this[command.trim()]("I Want it That Way");
		});
	}
};


Liri[action](arg1, arg2);
