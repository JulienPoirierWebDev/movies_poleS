import './style.css';

// On récupère les élements HTML squelette
const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const moviesList = document.querySelector('#moviesList');
const controls = document.querySelector('#controls');
const details = document.querySelector('#details');
const collectionDiv = document.querySelector('#collection');

// On écoute l'événement submit du formulaire
searchForm.addEventListener('submit', (event) => {
	event.preventDefault(); // on empeche de le chargement
	const search = searchInput.value;
	searchMovies(search);
});

// API de recherche de films.
// La fonction searchMovies prend en paramètre une query et une page par défaut à 1 :
// son rôle est de lancer la recherche et de délégué l'affichage des films à la fonction displayMovies et la gestion de la pagination à la fonction managePagination.
const searchMovies = (query, page = 1) => {
	if (query === '') {
		return;
	}
	const url = `https://movies-api.julienpoirier-webdev.com/search/movies/${query}/${page}`;
	fetch(url)
		.then((response) => response.json()) // On attend la réponse de la requête et on la convertit en format JSON
		.then((data) => {
			// on attend la fin de la conversion en JSON
			displayMovies(data.results); // Appeler une fonction pour afficher les films
			displayControls(query, data.page, data.total_pages); // Gérer l'apparition des butons de controls
		})
		.catch((error) => console.error('Erreur lors de la requête:', error)); // Gérer les erreurs (au cas où)
};

// Le rôle de displayControls est d'afficher les boutons de navigation (précédent et suivant) en fonction de la page actuelle et du nombre total de pages.
const displayControls = (query, page, totalPages) => {
	console.log(query, page, totalPages);
	controls.innerHTML = '';

	if (page > 1) {
		// si la page actuelle est supérieure à 1 (donc il y a une page précédente)
		const prevButton = document.createElement('button');
		prevButton.innerText = 'Prev';
		prevButton.addEventListener('click', (e) => {
			searchMovies(query, page - 1);
		});
		controls.appendChild(prevButton);
	}

	if (page < totalPages) {
		// si la page actuelle est inférieure au nombre total de pages (donc il y a une page suivante)
		// bouton suivant
		const nextButton = document.createElement('button');
		nextButton.innerText = 'Next';
		nextButton.addEventListener('click', (e) => {
			searchMovies(query, page + 1);
		});
		controls.appendChild(nextButton);
	}
};

// Afficher la liste des films
const displayMovies = (movies) => {
	moviesList.innerHTML = ''; // on vide la liste des films

	movies.forEach((movie) => {
		// pour chaque film
		const movieItem = document.createElement('div'); // on créer un div
		movieItem.classList.add('movie'); // on lui donne une classe

		const poster = movie.poster_path // on vérifie si le film a une image
			? `https://image.tmdb.org/t/p/w500${movie.poster_path}` // si oui on l'affiche
			: 'https://via.placeholder.com/100x150?text=No+Image'; // sinon on affiche une image par défaut

		const div = document.createElement('div');
		const h3 = document.createElement('h3');
		const p = document.createElement('p');
		const image = document.createElement('img');
		const button = document.createElement('button');
		button.addEventListener('click', () => {
			getDetailsMovie(movie.id);
		});
		button.innerText = 'Voir les détails';
		image.src = poster;
		h3.innerText = movie.title;
		p.innerText = movie.release_date;
		div.appendChild(h3);
		div.appendChild(p);
		div.appendChild(button);

		movieItem.appendChild(image);
		movieItem.appendChild(div);

		// on créer de l'HTML pour chaque film ATTENTION : on ne devrait pas faire cela car c'est une faille de sécurité, il faudrait faire des createElement et appendChild pour chaque élément
		// La on va plus vite pour l'exemple

		moviesList.appendChild(movieItem); // on ajoute le film à la movieList
	});
};

// quand on veut récupérer des données en ligne
const getDetailsMovie = async (idMovie) => {
	// Separation of concerns // separation des responsabilités -> chaque fonction a une .... fonction : une responsabilité UNIQUE
	// Etape 1 : faire la requete et recup les données
	try {
		const response = await fetch(
			`http://movies-api.julienpoirier-webdev.com/infos/movies/${idMovie}`
		);
		const data = await response.json();
		displayDetails(data);
	} catch (error) {
		console.log(error);
	}

	// Etape 2 : faire quelque chose avec ces données.
};

const displayDetails = (movie) => {
	moviesList.classList.toggle('hidden');
	searchForm.classList.toggle('hidden');
	controls.classList.toggle('hidden');

	const poster = movie.poster_path // on vérifie si le film a une image
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}` // si oui on l'affiche
		: 'https://via.placeholder.com/100x150?text=No+Image'; // sinon on affiche une image par défaut

	const backdrop_path = movie.backdrop_path // on vérifie si le film a une image
		? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` // si oui on l'affiche
		: 'https://via.placeholder.com/100x150?text=No+Image'; // sinon on affiche u

	const div = document.createElement('div');
	const h3 = document.createElement('h3');
	const p = document.createElement('p');
	const image1 = document.createElement('img');
	const image2 = document.createElement('img');
	const retourButton = document.createElement('button');
	image1.src = poster;
	image2.src = backdrop_path;
	h3.innerText = movie.original_title;
	p.innerText = movie.overview;
	retourButton.innerText = 'Retour';

	retourButton.addEventListener('click', () => {
		details.innerHTML = '';
		moviesList.classList.toggle('hidden');
		searchForm.classList.toggle('hidden');
		controls.classList.toggle('hidden');
	});
	div.appendChild(retourButton);

	div.appendChild(h3);
	div.appendChild(p);

	if (movie.belongs_to_collection) {
		const collectionButton = document.createElement('button');
		collectionButton.innerText = 'Voir la collection';
		collectionButton.addEventListener('click', () => {
			getCollection(movie.belongs_to_collection.id);
		});
		div.appendChild(collectionButton);
	}

	div.appendChild(image1);
	div.appendChild(image2);

	details.appendChild(div);
};

const getCollection = (collectionId) => {
	fetch(
		`http://movies-api.julienpoirier-webdev.com/infos/collections/${collectionId}`
	)
		.then((response) => {
			response
				.json()
				.then((data) => {
					console.log(data);
					displayCollection(data);
				})
				.catch((error) => {
					console.log(error);
				});
		})
		.catch((error) => {
			console.log(error);
		});
};

const displayCollection = (collection) => {
	details.classList.toggle('hidden');

	const imageCollection = document.createElement('img');

	imageCollection.src = `https://image.tmdb.org/t/p/w500${collection.backdrop_path}`;
	const h1 = document.createElement('h1');
	h1.innerText = collection.name;
	collectionDiv.appendChild(h1);
	collectionDiv.appendChild(imageCollection);

	const retourButton = document.createElement('button');
	retourButton.innerText = 'Retour';
	retourButton.addEventListener('click', () => {
		collectionDiv.innerHTML = '';
		details.classList.toggle('hidden');
	});

	collectionDiv.appendChild(retourButton);

	collection.parts.forEach((movie) => {
		const div = document.createElement('div');
		const h2 = document.createElement('h2');
		h2.innerText = movie.original_title + ' | ' + movie.title;
		div.appendChild(h2);
		const p = document.createElement('p');

		p.innerText = movie.overview;
		div.appendChild(p);

		// afficher le poster_path, la popularity, la date de sortie, le vote_average, le vote_count
		const poster = movie.poster_path // on vérifie si le film a une image
			? `https://image.tmdb.org/t/p/w500${movie.poster_path}` // si oui on l'affiche
			: 'https://via.placeholder.com/100x150?text=No+Image'; // sinon on affiche une image par défaut

		const image = document.createElement('img');
		image.src = poster;
		div.appendChild(image);

		collectionDiv.appendChild(div);

		const popularity = document.createElement('p');
		popularity.innerText = 'Popularity : ' + movie.popularity;
		div.appendChild(popularity);

		const release_date = document.createElement('p');
		release_date.innerText = 'Release date : ' + movie.release_date;
		div.appendChild(release_date);

		const vote_average = document.createElement('p');
		vote_average.innerText = 'Vote average : ' + movie.vote_average;
		div.appendChild(vote_average);

		const vote_count = document.createElement('p');
		vote_count.innerText = 'Vote count : ' + movie.vote_count;
		div.appendChild(vote_count);

		collectionDiv.appendChild(div);
	});
	/* 
	{
  "id": 528,
  "name": "Terminator - Saga",
  "overview": "Une série de films de science-fiction sur le conflit futuriste entre les humains dirigé par John Connor et les Terminators qui sont réalisés et contrôlés par Skynet, un super ordinateur conscient de lui-même qui a déclenché Armageddon et pourrait en effet mettre fin à l’humanité pour de bon. Les produits les plus connus de Skynet dans ses objectifs génocidaires sont les différents modèles de terminateurs, tels que le T-800 (modèle 101).",
  "poster_path": "/pF5GIijY2fyZcByqNDzhS8v4h1x.jpg",
  "backdrop_path": "/5swQRtrFigXwLdaH4Y2UeJjZHCy.jpg",
  "parts": [
    {
      "backdrop_path": "/ffdqHMWkh1h9MABwIfbfRJhgFW6.jpg",
      "id": 218,
      "title": "Terminator",
      "original_title": "The Terminator",
      "overview": "À Los Angeles en 1984, un Terminator, cyborg surgi du futur, a pour mission d'exécuter Sarah Connor, une jeune femme dont l'enfant à naître doit sauver l'humanité. Kyle Reese, un résistant humain, débarque lui aussi pour combattre le robot, et aider la jeune femme…",
      "poster_path": "/z9nwlPCvMpgxDwQ9JQ3zRAPpEjd.jpg",
      "media_type": "movie",
      "adult": false,
      "original_language": "en",
      "genre_ids": [
        28,
        53,
        878
      ],
      "popularity": 247.361,
      "release_date": "1984-10-26",
      "video": false,
      "vote_average": 7.7,
      "vote_count": 13006
    },
    {
      "backdrop_path": "/vINgGecnz95iDL6fjQMARDsocgG.jpg",
      "id": 280,
      "title": "Terminator 2 : Le Jugement dernier",
      "original_title": "Terminator 2: Judgment Day",
      "overview": "En 2029, après leur échec pour éliminer Sarah Connor, les robots de Skynet programment un nouveau Terminator, le T‐1000, pour retourner dans le passé et éliminer son fils John Connor, futur leader de la résistance humaine. Ce dernier programme un autre cyborg, le T‐800, et l’envoie également en 1995, pour le protéger. Une seule question déterminera le sort de l’humanité : laquelle des deux machines trouvera John la première ?",
      "poster_path": "/mRtFOHF93zW4kTp4JOYrH71vxBh.jpg",
      "media_type": "movie",
      "adult": false,
      "original_language": "en",
      "genre_ids": [
        28,
        53,
        878
      ],
      "popularity": 75.489,
      "release_date": "1991-07-03",
      "video": false,
      "vote_average": 8.1,
      "vote_count": 12749
    },
    {
      "backdrop_path": "/kbXMOnz2RhTSAbLtHX5hy5AXtwv.jpg",
      "id": 296,
      "title": "Terminator 3 : Le Soulèvement des machines",
      "original_title": "Terminator 3: Rise of the Machines",
      "overview": "10 ans ont passé depuis « Le Jugement dernier ». Désormais âgé de 22 ans, John Connor vit dans l'ombre, sans foyer, sans travail, sans identité. Mais les machines de Skynet parviennent à retrouver sa trace. Ils envoient alors vers le passé la T-X, une androïde nouvelle génération quasi-invulnérable, pour éliminer le futur leader de la résistance humaine mais également Kate Brewster, une jeune vétérinaire. Un autre Terminator, le T-101, est venu protéger la vie de John Connor. Ensemble, l'homme et la machine vont mener une lutte acharnée contre la T-X : de l'issue de ce combat dépendra le futur de l'humanité…",
      "poster_path": "/rnvUndOuRmnMwTghMLhwsTMY4mf.jpg",
      "media_type": "movie",
      "adult": false,
      "original_language": "en",
      "genre_ids": [
        28,
        53,
        878
      ],
      "popularity": 66.219,
      "release_date": "2003-07-02",
      "video": false,
      "vote_average": 6.2,
      "vote_count": 6562
    },
    {
      "backdrop_path": "/lo70DEjfUOweEosuPPIlcIOhhBm.jpg",
      "id": 534,
      "title": "Terminator Renaissance",
      "original_title": "Terminator Salvation",
      "overview": "En 2018, après l'apocalypse qui a vu s'affronter les hommes et les robots, John Connor est devenu le chef de la résistance humaine contre Skynet et son armée de Terminators. Sa vision du monde est pourtant remise en cause par l'apparition de Marcus Wright, un inconnu qui se souvient seulement de s'être trouvé dans le quartier des condamnés à mort. Connor doit découvrir si Marcus a été envoyé du futur ou s'il est un rescapé du passé. Alors que Skynet prépare l'assaut final, Connor et Marcus s'engagent dans une odyssée qui va les mener au cœur même des opérations de Skynet. Ils y perceront le terrible secret qui se cache derrière l'annihilation programmée de l'humanité tout entière…",
      "poster_path": "/yvNh6F4jxb263ewe1kKTlq94ZAR.jpg",
      "media_type": "movie",
      "adult": false,
      "original_language": "en",
      "genre_ids": [
        28,
        878,
        53
      ],
      "popularity": 41.117,
      "release_date": "2009-05-20",
      "video": false,
      "vote_average": 6.1,
      "vote_count": 6398
    },
    {
      "backdrop_path": "/tZvP8DNNSyC9Cir4viXXn3S7uhn.jpg",
      "id": 87101,
      "title": "Terminator Genisys",
      "original_title": "Terminator Genisys",
      "overview": "Le leader de la résistance, John Connor, envoie le sergent Kyle Reese dans le passé, afin de protéger sa mère, Sarah Connor, et de préserver l’avenir de l’humanité. Des événements inattendus provoquent une fracture temporelle. Sarah et Kyle se retrouvent dans une nouvelle version du passé. Ils y découvrent un allié inattendu : le Guardian. Ensemble, ils doivent faire face à un nouvel ennemi cybernétique. La menace a changé de visage.",
      "poster_path": "/y5NSvSCXM6nX2M68mRGGPk5Hvoy.jpg",
      "media_type": "movie",
      "adult": false,
      "original_language": "en",
      "genre_ids": [
        878,
        28,
        53,
        12
      ],
      "popularity": 79.583,
      "release_date": "2015-06-23",
      "video": false,
      "vote_average": 5.937,
      "vote_count": 8327
    },
    {
      "backdrop_path": "/a6cDxdwaQIFjSkXf7uskg78ZyTq.jpg",
      "id": 290859,
      "title": "Terminator : Dark Fate",
      "original_title": "Terminator: Dark Fate",
      "overview": "De nos jours, à Mexico. Dani Ramos, 21 ans, travaille sur une chaîne de montage dans une usine automobile. Elle voit sa vie bouleversée lorsqu'elle se retrouve soudainement confrontée à deux inconnus. D’un côté, Gabriel, une machine Terminator des plus évoluées, indestructible et protéiforme, un « Rev-9 », venue du futur pour la tuer. De l’autre, Grace, un super-soldat génétiquement augmenté, envoyé pour la protéger.",
      "poster_path": "/hiHsAVw2M6j3JHUOPoqAR7X55iB.jpg",
      "media_type": "movie",
      "adult": false,
      "original_language": "en",
      "genre_ids": [
        878,
        28,
        12
      ],
      "popularity": 59.783,
      "release_date": "2019-10-23",
      "video": false,
      "vote_average": 6.434,
      "vote_count": 5040
    }
  ]
}*/
};
