import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movieDetails: null,
  movieDetailsLoading: false,
  movieDetailsError: null,
  movieCredits: null,
  movieCreditsLoading: false,
  movieCreditsError: null,
  movieReviews: [],
  movieReviewsLoading: false,
  movieReviewsError: null,
  similarMovies: [],
  similarMoviesLoading: false,
  similarMoviesError: null,
  movieVideos: [],
  movieVideosLoading: false,
  movieVideosError: null,
  currentMovieId: null,
};

const movieDetailSlice = createSlice({
  name: 'movieDetail',
  initialState,
  reducers: {
    setMovieDetailsLoading: (state, action) => {
      state.movieDetailsLoading = action.payload;
    },
    setMovieDetails: (state, action) => {
      state.movieDetails = action.payload;
      state.movieDetailsLoading = false;
      state.movieDetailsError = null;
    },
    setMovieDetailsError: (state, action) => {
      state.movieDetailsError = action.payload;
      state.movieDetailsLoading = false;
    },
    clearMovieDetailsError: (state) => {
      state.movieDetailsError = null;
    },
    setMovieCreditsLoading: (state, action) => {
      state.movieCreditsLoading = action.payload;
    },
    setMovieCredits: (state, action) => {
      state.movieCredits = action.payload;
      state.movieCreditsLoading = false;
      state.movieCreditsError = null;
    },
    setMovieCreditsError: (state, action) => {
      state.movieCreditsError = action.payload;
      state.movieCreditsLoading = false;
    },
    clearMovieCreditsError: (state) => {
      state.movieCreditsError = null;
    },
    setMovieReviewsLoading: (state, action) => {
      state.movieReviewsLoading = action.payload;
    },
    setMovieReviews: (state, action) => {
      state.movieReviews = action.payload;
      state.movieReviewsLoading = false;
      state.movieReviewsError = null;
    },
    setMovieReviewsError: (state, action) => {
      state.movieReviewsError = action.payload;
      state.movieReviewsLoading = false;
    },
    clearMovieReviewsError: (state) => {
      state.movieReviewsError = null;
    },
    setSimilarMoviesLoading: (state, action) => {
      state.similarMoviesLoading = action.payload;
    },
    setSimilarMovies: (state, action) => {
      state.similarMovies = action.payload;
      state.similarMoviesLoading = false;
      state.similarMoviesError = null;
    },
    setSimilarMoviesError: (state, action) => {
      state.similarMoviesError = action.payload;
      state.similarMoviesLoading = false;
    },
    clearSimilarMoviesError: (state) => {
      state.similarMoviesError = null;
    },
    setMovieVideosLoading: (state, action) => {
      state.movieVideosLoading = action.payload;
    },
    setMovieVideos: (state, action) => {
      state.movieVideos = action.payload;
      state.movieVideosLoading = false;
      state.movieVideosError = null;
    },
    setMovieVideosError: (state, action) => {
      state.movieVideosError = action.payload;
      state.movieVideosLoading = false;
    },
    clearMovieVideosError: (state) => {
      state.movieVideosError = null;
    },
    setCurrentMovieId: (state, action) => {
      state.currentMovieId = action.payload;
    },
    resetMovieDetail: (state) => {
      return initialState;
    },
    resetMovieDetailErrors: (state) => {
      state.movieDetailsError = null;
      state.movieCreditsError = null;
      state.movieReviewsError = null;
      state.similarMoviesError = null;
      state.movieVideosError = null;
    },
  },
});

export const {
  setMovieDetailsLoading,
  setMovieDetails,
  setMovieDetailsError,
  clearMovieDetailsError,
  setMovieCreditsLoading,
  setMovieCredits,
  setMovieCreditsError,
  clearMovieCreditsError,
  setMovieReviewsLoading,
  setMovieReviews,
  setMovieReviewsError,
  clearMovieReviewsError,
  setSimilarMoviesLoading,
  setSimilarMovies,
  setSimilarMoviesError,
  clearSimilarMoviesError,
  setMovieVideosLoading,
  setMovieVideos,
  setMovieVideosError,
  clearMovieVideosError,
  setCurrentMovieId,
  resetMovieDetail,
  resetMovieDetailErrors,
} = movieDetailSlice.actions;

export default movieDetailSlice.reducer;