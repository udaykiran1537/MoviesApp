import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nowPlayingMovies: [],
  nowPlayingLoading: false,
  nowPlayingError: null,
  popularMovies: [],
  popularLoading: false,
  popularError: null,
  topRatedMovies: [],
  topRatedLoading: false,
  topRatedError: null,
  upcomingMovies: [],
  upcomingLoading: false,
  upcomingError: null,
  featuredMovie: {
    id: 299536,
    title: 'Avengers: Infinity War',
    description: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',
    image: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    genre: 'Adventure • Action • Science Fiction',
    rating: '8.3',
  },
};

const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setNowPlayingLoading: (state, action) => {
      state.nowPlayingLoading = action.payload;
    },
    setNowPlayingMovies: (state, action) => {
      state.nowPlayingMovies = action.payload;
      state.nowPlayingLoading = false;
      state.nowPlayingError = null;
    },
    setNowPlayingError: (state, action) => {
      state.nowPlayingError = action.payload;
      state.nowPlayingLoading = false;
    },
    clearNowPlayingError: (state) => {
      state.nowPlayingError = null;
    },
    setPopularLoading: (state, action) => {
      state.popularLoading = action.payload;
    },
    setPopularMovies: (state, action) => {
      state.popularMovies = action.payload;
      state.popularLoading = false;
      state.popularError = null;
    },
    setPopularError: (state, action) => {
      state.popularError = action.payload;
      state.popularLoading = false;
    },
    clearPopularError: (state) => {
      state.popularError = null;
    },
    setTopRatedLoading: (state, action) => {
      state.topRatedLoading = action.payload;
    },
    setTopRatedMovies: (state, action) => {
      state.topRatedMovies = action.payload;
      state.topRatedLoading = false;
      state.topRatedError = null;
    },
    setTopRatedError: (state, action) => {
      state.topRatedError = action.payload;
      state.topRatedLoading = false;
    },
    clearTopRatedError: (state) => {
      state.topRatedError = null;
    },
    setUpcomingLoading: (state, action) => {
      state.upcomingLoading = action.payload;
    },
    setUpcomingMovies: (state, action) => {
      state.upcomingMovies = action.payload;
      state.upcomingLoading = false;
      state.upcomingError = null;
    },
    setUpcomingError: (state, action) => {
      state.upcomingError = action.payload;
      state.upcomingLoading = false;
    },
    clearUpcomingError: (state) => {
      state.upcomingError = null;
    },
    setFeaturedMovie: (state, action) => {
      state.featuredMovie = action.payload;
    },
    resetMoviesState: (state) => {
      state.nowPlayingMovies = [];
      state.nowPlayingError = null;
      state.nowPlayingLoading = false;
      state.popularMovies = [];
      state.popularError = null;
      state.popularLoading = false;
      state.topRatedMovies = [];
      state.topRatedError = null;
      state.topRatedLoading = false;
      state.upcomingMovies = [];
      state.upcomingError = null;
      state.upcomingLoading = false;
    },
  },
});

export const {
  setNowPlayingLoading,
  setNowPlayingMovies,
  setNowPlayingError,
  clearNowPlayingError,
  setPopularLoading,
  setPopularMovies,
  setPopularError,
  clearPopularError,
  setTopRatedLoading,
  setTopRatedMovies,
  setTopRatedError,
  clearTopRatedError,
  setUpcomingLoading,
  setUpcomingMovies,
  setUpcomingError,
  clearUpcomingError,
  setFeaturedMovie,
  resetMoviesState,
} = movieSlice.actions;

export default movieSlice.reducer;