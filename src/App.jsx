import React, { useState, useEffect, useRef } from "react";
import Search from "./components/Search";
import Spinner from './components/Spinner';
import MovieCard from "./components/MovieCard";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const fetchMovies = async (query='') => {

    setIsLoading(true);
    setErrMessage('');

    try {
      const endpoint = query?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      
      if(!response.ok){
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      if(data.response==='False'){
        setErrMessage(data.error || 'Failed to fetch movies');
        setMovieList([])
        return;
      }
      
      setMovieList(data.results || []);

    } catch (err) {
      console.error(`Error fetching movies: ${err}`);
      setErrMessage(`Error fetching movies. Please try again later.`);
    }
    finally{
      setIsLoading(false);
    }
  };

  

  useEffect(() => {
    const timerId= setTimeout(()=>{
      fetchMovies(searchTerm);
    },500)
    
    return ()=> clearTimeout(timerId);
    
  }, [searchTerm]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="hero banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <div>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
        </header>
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies </h2>

            {isLoading ? <Spinner/>:
            errMessage? (<p className="text-red-500">{errMessage}</p>):(<ul>
              {movieList.map((movie)=>(
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>)}

         </section>
      </div>
    </main>
  );
};

export default App;
