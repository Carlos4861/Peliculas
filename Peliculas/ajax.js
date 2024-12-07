window.onload = () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    const API_URL = 'https://www.omdbapi.com/?i=tt3896198&apikey=e8bcc8a1';

    let currentQuery = '';
    let currentPage = 1;
    let isLoading = false; // Para evitar múltiples solicitudes al mismo tiempo

    // Función para buscar películas
    function searchMovies(query) {
        currentQuery = query;
        currentPage = 1;

        const url = `${API_URL}&s=${encodeURIComponent(query)}&page=${currentPage}`;
        makeRequest(url, (data) => {
            if (data.Search) {
                renderResults(data.Search);
                showResultsPage();
            } else {
                document.getElementById("results-container").innerHTML = `<p>No se encontraron resultados.</p>`;
            }
        });
    }

    // Función para cargar más resultados
    function loadMoreMovies() {
        if (isLoading) return;
        isLoading = true;
        currentPage++;

        const url = `${API_URL}&s=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
        makeRequest(url, (data) => {
            if (data.Search) {
                renderResults(data.Search, true);
            }
            isLoading = false; // Liberar el bloqueo después de la carga
        });
    }

    // Evento de scroll infinito
    window.addEventListener("scroll", () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 50) { // Si el usuario está cerca del final de la página
            loadMoreMovies();
        }
    });

    // Función para mostrar detalles de una película
    function showMovieDetails(imdbID) {
        const url = `${API_URL}&i=${imdbID}`;
        makeRequest(url, (data) => {
            renderDetails(data);
            showDetailPage();
        });
    }
  // Función para mostrar detalles de una película, serie o juego
    function showMovieDetails(imdbID) {
        const url = `${API_URL}&i=${imdbID}`;
        makeRequest(url, (data) => {
            renderDetails(data);
            showDetailPage();
        });
    }
    // Realizar una petición AJAX
    function makeRequest(url, callback) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const response = JSON.parse(this.responseText);
                callback(response);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    // Renderizar resultados
    function renderResults(movies, append = false) {
        const resultsContainer = document.getElementById("results-container");
        const items = movies.map(movie => `
            <div class="result-item" onclick="showMovieDetails('${movie.imdbID}')">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}" />
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        `).join('');

        if (append) {
            resultsContainer.innerHTML += items;
        } else {
            resultsContainer.innerHTML = items;
        }
    }

    // Renderizar detalles
    function renderDetails(movie) {
        const detailContainer = document.getElementById("detail-container");
        detailContainer.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}" />
            <h2>${movie.Title}</h2>
            <p><strong>Director:</strong> ${movie.Director}</p>
            <p><strong>Actores:</strong> ${movie.Actors}</p>
            <p><strong>Sinopsis:</strong> ${movie.Plot}</p>
            <p><strong>Año:</strong> ${movie.Year}</p>
            <p><strong>Valoraciones:</strong> ${movie.Ratings.map(r => `${r.Source}: ${r.Value}`).join(', ')}</p>
        `;
    }

    // Mostrar/Ocultar vistas
    function showLandingPage() {
        document.getElementById("landing-page").classList.remove("hidden");
        document.getElementById("results-page").classList.add("hidden");
        document.getElementById("detail-page").classList.add("hidden");
    }

    function showResultsPage() {
        document.getElementById("landing-page").classList.add("hidden");
        document.getElementById("results-page").classList.remove("hidden");
        document.getElementById("detail-page").classList.add("hidden");
    }

    function showDetailPage() {
        document.getElementById("landing-page").classList.add("hidden");
        document.getElementById("results-page").classList.add("hidden");
        document.getElementById("detail-page").classList.remove("hidden");
    }
    
 // Generar informe
 function generateReport() {
    const topRated = allMovies.slice(0, 5).sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
    const topGrossing = allMovies.slice(0, 5).sort((a, b) => parseFloat(b.BoxOffice || 0) - parseFloat(a.BoxOffice || 0));
    const topVoted = allMovies.slice(0, 5).sort((a, b) => parseFloat(b.imdbVotes) - parseFloat(a.imdbVotes));

    renderReport({ topRated, topGrossing, topVoted });
    showReportPage();
}

function renderReport({ topRated, topGrossing, topVoted }) {
    const reportContainer = document.getElementById("report-container");
    reportContainer.innerHTML = `
        <h2>Informe de Películas</h2>

        <h3>Películas Más Valoradas (IMDb)</h3>
        <ul>
            ${topRated.map(movie => `<li>${movie.Title} (${movie.imdbRating})</li>`).join('')}
        </ul>

        <h3>Películas con Mayor Recaudación</h3>
        <ul>
            ${topGrossing.map(movie => `<li>${movie.Title} (${movie.BoxOffice || 'N/A'})</li>`).join('')}
        </ul>

        <h3>Películas Más Votadas</h3>
        <ul>
            ${topVoted.map(movie => `<li>${movie.Title} (${movie.imdbVotes})</li>`).join('')}
        </ul>

        <canvas id="report-chart" width="400" height="200"></canvas>
    `;

    generateChart({ topRated, topGrossing, topVoted });
}

function generateChart({ topRated, topGrossing, topVoted }) {
    const ctx = document.getElementById('report-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Más Valoradas', 'Mayor Recaudación', 'Más Votadas'],
            datasets: [
                {
                    label: 'Puntaje/Valoración',
                    data: [
                        topRated.reduce((acc, movie) => acc + parseFloat(movie.imdbRating), 0),
                        topGrossing.reduce((acc, movie) => acc + parseFloat(movie.BoxOffice || 0), 0),
                        topVoted.reduce((acc, movie) => acc + parseFloat(movie.imdbVotes), 0)
                    ],
                    backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

    // Agregar eventos a los enlaces de navegación
    document.getElementById("navbar").addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            event.preventDefault();
            const option = event.target.textContent.trim().toLowerCase();
            handleNavigation(option);
        }
    });

    // Evento para el clic del botón
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query.length >= 3) {
            searchMovies(query);
        }
    });

    // Evento para la tecla Enter
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length >= 3) {
                searchMovies(query);
            }
        }
    });

    document.getElementById("back-button").addEventListener("click", showLandingPage);
    document.getElementById("back-to-results-button").addEventListener("click", showResultsPage);
};
