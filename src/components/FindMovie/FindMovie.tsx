import React, { FormEvent, useState } from 'react';
import classNames from 'classnames';
import { MovieCard } from '../MovieCard';
import { getMovie } from '../../api';
import { Movie } from '../../types/Movie';
import { MovieData } from '../../types/MovieData';
import './FindMovie.scss';

type Props = {
  movies: Movie[];
  addMovie: (movies: Movie[]) => void;
};

export const FindMovie: React.FC<Props> = ({ movies, addMovie }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [movieData, setMovieData] = useState<Movie | null>(null);
  const [hasError, setHasError] = useState(false);

  const setMovieDataFromApi = (data: MovieData) => {
    const hasValidPoster = data.Poster && data.Poster !== 'N/A';
    const imgUrl = hasValidPoster
      ? data.Poster
      : 'https://via.placeholder.com/360x270.png?text=no%20preview';

    setMovieData({
      title: data.Title,
      description: data.Plot,
      imgUrl,
      imdbId: data.imdbID,
      imdbUrl: `https://www.imdb.com/title/${data.imdbID}`,
    });
  };

  const handleError = () => {
    setHasError(true);
    setMovieData(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const data = await getMovie(query.trim());

      if (!('Title' in data && 'Plot' in data && 'imdbID' in data)) {
        handleError();

        return;
      }

      setMovieDataFromApi(data);
    } catch (error) {
      handleError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    if (!movieData) {
      return;
    }

    const isNewMovie = !movies.some(movie => movie.imdbId === movieData.imdbId);

    if (isNewMovie) {
      addMovie([...movies, movieData]);
    }

    setMovieData(null);
    setHasError(false);
    setQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (hasError) {
      setHasError(false);
    }
  };

  return (
    <>
      <form className="find-movie" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>
          <div className="control">
            <input
              data-cy="titleField"
              type="text"
              id="movie-title"
              placeholder="Enter a title to search"
              className={classNames('input', { 'is-danger': hasError })}
              value={query}
              onChange={handleInputChange}
            />
          </div>
          {hasError && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              data-cy="searchButton"
              type="submit"
              className={classNames('button is-light', {
                'is-loading': isLoading,
              })}
              disabled={!query.trim()}
            >
              Find a movie
            </button>
          </div>

          {movieData && (
            <div className="control">
              <button
                data-cy="addButton"
                type="button"
                className="button is-primary"
                onClick={handleAdd}
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      {movieData && (
        <div className="container" data-cy="previewContainer">
          <h2 className="title">Preview</h2>
          <MovieCard movie={movieData} />
        </div>
      )}
    </>
  );
};
