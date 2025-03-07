import React, {useEffect, useState} from "react";
import "./index.css";
import {Search} from "./components/Search";
import {Spinner} from "./components/Spinner";
import {MovieCard} from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
};

function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [trendingMovies, setTrendingMovies] = useState("")

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 600, [searchTerm]);

    const fetchMovies = async (query = "") => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
                `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error("Bad Call");
            }

            const data = await response.json();

            if (data.Response === "False") {
                setErrorMsg(data.error || "Failed to fetch movies");
                setMovieList([]);
                return;
            }

            setMovieList(data.results);
            // console.log(data);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
            // updateSearchCount();

        } catch (error) {
            console.error(`Error fetching Movies ${error}`);
            setErrorMsg("Error Fetching Movies.");
        } finally {
            setIsLoading(false);
        }
    };

    async function loadTrendingMovies() {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error("error fetch trending movies" + error);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern"/>
            <div className="wrapper">
                <header className="header">
                    <img src="/hero.png" alt=""/>
                    <h1>
                        Find
                        <span className="text-gradient">Movies</span>
                        You'll Enjoy Without Any Hassle
                    </h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>
                {trendingMovies.length > 0 && (
                    <section className='trending'>
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                <section className="all-movies">
                    <h2>All Movies</h2>
                    {isLoading ? (
                        <p className="text-white"><Spinner/></p>
                    ) : errorMsg ? (
                        <p className="text-red-500">{errorMsg}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}

export default App;
