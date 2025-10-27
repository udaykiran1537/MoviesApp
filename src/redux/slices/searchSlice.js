import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchType: 'all',
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,
  recentSearches: [],
  trendingSearches: [
    'Avengers',
    'Breaking Bad',
    'Stranger Things',
    'The Batman',
    'Game of Thrones',
    'Marvel',
    'Netflix',
    'Disney'
  ],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload;
    },
    setSearchResults: (state, action) => {
      const { results, page, total_pages, total_results } = action.payload;
      if (page === 1) {
        state.searchResults = results || [];
      } else {
        state.searchResults = [...state.searchResults, ...(results || [])];
      }
      state.currentPage = page;
      state.totalPages = total_pages || 1;
      state.totalResults = total_results || 0;
      state.searchLoading = false;
      state.searchError = null;
    },
    setSearchError: (state, action) => {
      state.searchError = action.payload;
      state.searchLoading = false;
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalResults = 0;
      state.searchError = null;
    },
    setSearchType: (state, action) => {
      state.searchType = action.payload;
    },
    addRecentSearch: (state, action) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches = [query, ...state.recentSearches.slice(0, 9)];
      }
    },
    removeRecentSearch: (state, action) => {
      state.recentSearches = state.recentSearches.filter(
        search => search !== action.payload
      );
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    incrementPage: (state) => {
      if (state.currentPage < state.totalPages) {
        state.currentPage += 1;
      }
    },
  },
});

export const {
  setSearchQuery,
  clearSearchQuery,
  setSearchLoading,
  setSearchResults,
  setSearchError,
  clearSearchError,
  clearSearchResults,
  setSearchType,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  incrementPage,
} = searchSlice.actions;

export default searchSlice.reducer;
