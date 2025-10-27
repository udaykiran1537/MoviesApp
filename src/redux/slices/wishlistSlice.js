import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getMoviesStorageKey = (userId) => `@MoviesApp:wishlist:movies:${userId}`;
const getSeriesStorageKey = (userId) => `@MoviesApp:wishlist:series:${userId}`;

const initialState = {
  wishlistMovies: [],
  wishlistSeries: [],
  wishlistLoading: false,
  wishlistError: null,
  isLoading: false,
  isSaving: false,
  totalItems: 0,
  totalMovies: 0,
  totalSeries: 0,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistLoading: (state, action) => {
      state.wishlistLoading = action.payload;
    },
    setWishlistError: (state, action) => {
      state.wishlistError = action.payload;
      state.wishlistLoading = false;
    },
    clearWishlistError: (state) => {
      state.wishlistError = null;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    addMovieToWishlist: (state, action) => {
      const movie = action.payload;
      const existingIndex = state.wishlistMovies.findIndex(item => item.id === movie.id);
      if (existingIndex === -1) {
        state.wishlistMovies.push({
          ...movie,
          addedAt: new Date().toISOString(),
          type: 'movie',
        });
      }
      state.totalMovies = state.wishlistMovies.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    addSeriesToWishlist: (state, action) => {
      const series = action.payload;
      const existingIndex = state.wishlistSeries.findIndex(item => item.id === series.id);
      if (existingIndex === -1) {
        state.wishlistSeries.push({
          ...series,
          addedAt: new Date().toISOString(),
          type: 'series',
        });
      }
      state.totalSeries = state.wishlistSeries.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    removeMovieFromWishlist: (state, action) => {
      const movieId = action.payload;
      state.wishlistMovies = state.wishlistMovies.filter(movie => movie.id !== movieId);
      state.totalMovies = state.wishlistMovies.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    removeSeriesFromWishlist: (state, action) => {
      const seriesId = action.payload;
      state.wishlistSeries = state.wishlistSeries.filter(series => series.id !== seriesId);
      state.totalSeries = state.wishlistSeries.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    toggleMovieInWishlist: (state, action) => {
      const movie = action.payload;
      const existingIndex = state.wishlistMovies.findIndex(item => item.id === movie.id);
      if (existingIndex === -1) {
        state.wishlistMovies.push({
          ...movie,
          addedAt: new Date().toISOString(),
          type: 'movie',
        });
      } else {
        state.wishlistMovies.splice(existingIndex, 1);
      }
      state.totalMovies = state.wishlistMovies.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    toggleSeriesInWishlist: (state, action) => {
      const series = action.payload;
      const existingIndex = state.wishlistSeries.findIndex(item => item.id === series.id);
      if (existingIndex === -1) {
        state.wishlistSeries.push({
          ...series,
          addedAt: new Date().toISOString(),
          type: 'series',
        });
      } else {
        state.wishlistSeries.splice(existingIndex, 1);
      }
      state.totalSeries = state.wishlistSeries.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    clearMoviesWishlist: (state) => {
      state.wishlistMovies = [];
      state.totalMovies = 0;
      state.totalItems = state.wishlistSeries.length;
    },
    clearSeriesWishlist: (state) => {
      state.wishlistSeries = [];
      state.totalSeries = 0;
      state.totalItems = state.wishlistMovies.length;
    },
    setWishlistFromStorage: (state, action) => {
      const { movies, series } = action.payload;
      state.wishlistMovies = movies || [];
      state.wishlistSeries = series || [];
      state.totalMovies = state.wishlistMovies.length;
      state.totalSeries = state.wishlistSeries.length;
      state.totalItems = state.wishlistMovies.length + state.wishlistSeries.length;
    },
    sortWishlist: (state, action) => {
      const { type, sortBy } = action.payload;
      const sortFunction = (a, b) => {
        switch (sortBy) {
          case 'title':
            const titleA = (a.title || a.name || '').toLowerCase();
            const titleB = (b.title || b.name || '').toLowerCase();
            return titleA.localeCompare(titleB);
          case 'rating':
            return (b.vote_average || 0) - (a.vote_average || 0);
          case 'addedAt':
          default:
            return new Date(b.addedAt) - new Date(a.addedAt);
        }
      };
      if (type === 'movies') state.wishlistMovies.sort(sortFunction);
      else if (type === 'series') state.wishlistSeries.sort(sortFunction);
    },
  },
});

export const loadWishlistFromStorage = (userId) => async (dispatch) => {
  if (!userId) return;
  try {
    dispatch(setIsLoading(true));
    const [moviesData, seriesData] = await Promise.all([
      AsyncStorage.getItem(getMoviesStorageKey(userId)),
      AsyncStorage.getItem(getSeriesStorageKey(userId)),
    ]);
    const movies = moviesData ? JSON.parse(moviesData) : [];
    const series = seriesData ? JSON.parse(seriesData) : [];
    dispatch(setWishlistFromStorage({ movies, series }));
  } catch (error) {
    dispatch(setWishlistError('Failed to load wishlist'));
  } finally {
    dispatch(setIsLoading(false));
  }
};

export const saveWishlistToStorage = (userId) => async (dispatch, getState) => {
  if (!userId) return;
  try {
    dispatch(setIsSaving(true));
    const { wishlist } = getState();
    const { wishlistMovies, wishlistSeries } = wishlist;
    await AsyncStorage.setItem(getMoviesStorageKey(userId), JSON.stringify(wishlistMovies));
    await AsyncStorage.setItem(getSeriesStorageKey(userId), JSON.stringify(wishlistSeries));
  } catch (error) {
    dispatch(setWishlistError('Failed to save wishlist'));
  } finally {
    dispatch(setIsSaving(false));
  }
};

export const selectIsMovieInWishlist = (state, movieId) =>
  state.wishlist.wishlistMovies.some(movie => movie.id === movieId);

export const selectIsSeriesInWishlist = (state, seriesId) =>
  state.wishlist.wishlistSeries.some(series => series.id === seriesId);

export const selectWishlistMoviesCount = (state) => state.wishlist.wishlistMovies.length;
export const selectWishlistSeriesCount = (state) => state.wishlist.wishlistSeries.length;
export const selectTotalWishlistCount = (state) =>
  state.wishlist.wishlistMovies.length + state.wishlist.wishlistSeries.length;

export const {
  setWishlistLoading,
  setWishlistError,
  clearWishlistError,
  setIsLoading,
  setIsSaving,
  addMovieToWishlist,
  addSeriesToWishlist,
  removeMovieFromWishlist,
  removeSeriesFromWishlist,
  toggleMovieInWishlist,
  toggleSeriesInWishlist,
  clearMoviesWishlist,
  clearSeriesWishlist,
  setWishlistFromStorage,
  sortWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
