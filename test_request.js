// const Twitter = require("twitter");
// const Keys = require("./key.js"),
// 	client = new Twitter(Keys.twitterKeys);

// client.get(path, param === Object, callback)
// client.get('statuses/user_timeline', { count: 2, max_id: 935661045997326300 }, function(error, tweets, response) {
// 	if (!!error) {
// 		throw error;
// 	}

// 	// look for the last 20 tweets, and console.log if less than
// 	try {
// 		for (let i = 0; i < 20; ++i) {
// 			console.log(tweets[i].id);
// 			console.log(tweets[i].user.id);
// 			console.log(tweets[i].user.screen_name);
// 			console.log(tweets[i].created_at);
// 			console.log(tweets[i].text);
// 		}
// 	} catch(err) {
// 		console.log(err.message);
// 		if (err.code === undefined) {
// 			console.log("Oopsy, seems like we reach to the end of your tweets.");	
// 		}
// 	}
// 	// console.log(response);  // Raw response object. 
// });


// const Spotify = require("spotify-web-api-node");
// const Keys = require("./key.js"),
// 	spotifyApi = new Spotify(Keys.spotifyKeys);


// // Retrieve an access token.
// spotifyApi.clientCredentialsGrant()
// 	.then(function(data) {
// 		// console.log('The access token expires in ' + data.body['expires_in']);
// 		// console.log('The access token is ' + data.body['access_token']);
// 		// console.log(data.body);

// 		// Save the access token so that it's used in future calls
// 		spotifyApi.setAccessToken(data.body['access_token']);
// 		spotifyApi.setRefreshToken(data.body['refresh_token']);
// 		Callback();
// 	}, function(err) {
// 		console.log('Something went wrong when retrieving an access token', err);
// 	});





// function Callback() {
// 	// Search artists whose name contains 'Love'
// 	// spotifyApi.searchArtists('Taylor Swift').then(function(data) {
// 	// 	// console.log('Search artists by "X Japan"', data.body.artists);

// 	// 	console.log(JSON.stringify(data.body, null, 3));
// 	// }, function(err) {
// 	// 	console.error(err.code);
// 	// });

// 	// Search tracks whose artist's name contains 'Love'
// 	spotifyApi.searchTracks('track:The Sign artist:Ace of Base', { limit: 1, market: "US" })
// 		.then(function(data) {
// 			// console.log('Search tracks by "Love" in the artist name', data.body);
// 			// console.log(JSON.stringify(data.body.tracks.items[0]["external_urls"], null, 3));

// 			const dataPath = data.body.tracks.items[0]; // items === Array() && limit 1
// 			console.log(dataPath["artists"][0].name);
// 			console.log(dataPath["name"]);
// 			console.log(dataPath["preview_url"]);
// 			console.log(dataPath["album"].name);
// 		}, function(err) {
// 			console.log('Something went wrong!', err);
// 		});

// }


// const Promise = require("es6-promise");

// function testPromise() {
// 	return new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			console.log("5 seconds later....");
// 			resolve("HAHA Promise polyfill");
// 		}, 5000);
// 	})
// }

// testPromise().then((res) => {
// 	console.log(res);
// });


const Keys = require("./key.js"),
	Request = require("request"),
	omdbKeys = Keys.omdbKeys;

console.log(omdbKeys);

const queryUrl = "http://www.omdbapi.com/?apikey=" + omdbKeys + "&t=In&plot=full&type=movie&r=json";

// omdb response with JSON string
Request(queryUrl, (err, response, body) => {
	!!err && console.log(err);
	// console.log(JSON.parse(body));
	const movieObj = JSON.parse(body),
		searchTitle = movieObj["Title"],
		searchYear = movieObj["Year"],
		searchRating = movieObj["imdbRating"],
		searchRatingRT = movieObj["Ratings"][1]["Value"],
		searchCountry = movieObj["Country"],
		searchLang = movieObj["Language"],
		searchPlot = movieObj["Plot"],
		searchCast = movieObj["Actors"],
		datArr = [searchTitle, searchYear, searchRating, searchRatingRT, searchCountry, searchLang, searchPlot, searchCast];
		datArr.forEach((elem) => {
			console.log(elem);
		});
});