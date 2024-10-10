import './style.css';

// On récupère les élements HTML squelette
const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const moviesList = document.querySelector('#moviesList');
const controls = document.querySelector('#controls');

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
		image.src = poster;
		h3.innerText = movie.title;
		p.innerText = movie.release_date;
		div.appendChild(h3);
		div.appendChild(p);

		movieItem.appendChild(image);
		movieItem.appendChild(div);

		/*
		movieItem.innerHTML = ` 
          <img src="${poster}" alt="${movie.title}">
          <div>
              <h3>${movie.title}</h3>
              <p>${movie.release_date}</p>
              </div>
      `;
    */
		// on créer de l'HTML pour chaque film ATTENTION : on ne devrait pas faire cela car c'est une faille de sécurité, il faudrait faire des createElement et appendChild pour chaque élément
		// La on va plus vite pour l'exemple

		moviesList.appendChild(movieItem); // on ajoute le film à la movieList
	});
};
