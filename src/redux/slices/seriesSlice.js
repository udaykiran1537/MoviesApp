import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  airingTodayTvSeries: [],
  airingTodayLoading: false,
  airingTodayError: null,
  popularTvSeries: [],
  popularLoading: false,
  popularError: null,
  topRatedTvSeries: [],
  topRatedLoading: false,
  topRatedError: null,
  onTheAirTvSeries: [],
  onTheAirLoading: false,
  onTheAirError: null,
  featuredSeries: {
    id: 1396,
    title: 'Breaking Bad',
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    image: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    genre: 'Drama • Crime • Thriller',
    rating: '9.5',
  },
};

const seriesSlice = createSlice({
  name: 'series',
  initialState,
  reducers: {
    setAiringTodayLoading: (state, action) => {
      state.airingTodayLoading = action.payload;
    },
    setAiringTodayTvSeries: (state, action) => {
      state.airingTodayTvSeries = action.payload;
      state.airingTodayLoading = false;
      state.airingTodayError = null;
    },
    setAiringTodayError: (state, action) => {
      state.airingTodayError = action.payload;
      state.airingTodayLoading = false;
    },
    clearAiringTodayError: (state) => {
      state.airingTodayError = null;
    },
    setPopularLoading: (state, action) => {
      state.popularLoading = action.payload;
    },
    setPopularTvSeries: (state, action) => {
      state.popularTvSeries = action.payload;
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
    setTopRatedTvSeries: (state, action) => {
      state.topRatedTvSeries = action.payload;
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
    setOnTheAirLoading: (state, action) => {
      state.onTheAirLoading = action.payload;
    },
    setOnTheAirTvSeries: (state, action) => {
      state.onTheAirTvSeries = action.payload;
      state.onTheAirLoading = false;
      state.onTheAirError = null;
    },
    setOnTheAirError: (state, action) => {
      state.onTheAirError = action.payload;
      state.onTheAirLoading = false;
    },
    clearOnTheAirError: (state) => {
      state.onTheAirError = null;
    },
    setFeaturedSeries: (state, action) => {
      state.featuredSeries = action.payload;
    },
    resetSeriesState: (state) => {
      state.airingTodayTvSeries = [];
      state.airingTodayError = null;
      state.airingTodayLoading = false;
      state.popularTvSeries = [];
      state.popularError = null;
      state.popularLoading = false;
      state.topRatedTvSeries = [];
      state.topRatedError = null;
      state.topRatedLoading = false;
      state.onTheAirTvSeries = [];
      state.onTheAirError = null;
      state.onTheAirLoading = false;
    },
  },
});

export const {
  setAiringTodayLoading,
  setAiringTodayTvSeries,
  setAiringTodayError,
  clearAiringTodayError,
  setPopularLoading,
  setPopularTvSeries,
  setPopularError,
  clearPopularError,
  setTopRatedLoading,
  setTopRatedTvSeries,
  setTopRatedError,
  clearTopRatedError,
  setOnTheAirLoading,
  setOnTheAirTvSeries,
  setOnTheAirError,
  clearOnTheAirError,
  setFeaturedSeries,
  resetSeriesState,
} = seriesSlice.actions;

export default seriesSlice.reducer;
