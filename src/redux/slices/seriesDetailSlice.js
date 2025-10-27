import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSeriesId: null,
  seriesDetails: null,
  seriesDetailsLoading: false,
  seriesDetailsError: null,
  seriesCredits: null,
  seriesCreditsLoading: false,
  seriesCreditsError: null,
  seriesReviews: [],
  seriesReviewsLoading: false,
  seriesReviewsError: null,
  similarSeries: [],
  similarSeriesLoading: false,
  similarSeriesError: null,
  seriesVideos: [],
  seriesVideosLoading: false,
  seriesVideosError: null,
  seriesSeasons: [],
  seriesSeasonsLoading: false,
  seriesSeasonsError: null,
  seasonEpisodes: [],
  seasonEpisodesLoading: false,
  seasonEpisodesError: null,
  currentSeasonNumber: 1,
};

const seriesDetailSlice = createSlice({
  name: 'seriesDetail',
  initialState,
  reducers: {
    setCurrentSeriesId: (state, action) => {
      state.currentSeriesId = action.payload;
    },
    resetSeriesDetail: () => {
      return initialState;
    },
    setSeriesDetailsLoading: (state, action) => {
      state.seriesDetailsLoading = action.payload;
    },
    setSeriesDetails: (state, action) => {
      state.seriesDetails = action.payload;
      state.seriesDetailsLoading = false;
      state.seriesDetailsError = null;
    },
    setSeriesDetailsError: (state, action) => {
      state.seriesDetailsError = action.payload;
      state.seriesDetailsLoading = false;
    },
    clearSeriesDetailsError: (state) => {
      state.seriesDetailsError = null;
    },
    setSeriesCreditsLoading: (state, action) => {
      state.seriesCreditsLoading = action.payload;
    },
    setSeriesCredits: (state, action) => {
      state.seriesCredits = action.payload;
      state.seriesCreditsLoading = false;
      state.seriesCreditsError = null;
    },
    setSeriesCreditsError: (state, action) => {
      state.seriesCreditsError = action.payload;
      state.seriesCreditsLoading = false;
    },
    clearSeriesCreditsError: (state) => {
      state.seriesCreditsError = null;
    },
    setSeriesReviewsLoading: (state, action) => {
      state.seriesReviewsLoading = action.payload;
    },
    setSeriesReviews: (state, action) => {
      state.seriesReviews = action.payload;
      state.seriesReviewsLoading = false;
      state.seriesReviewsError = null;
    },
    setSeriesReviewsError: (state, action) => {
      state.seriesReviewsError = action.payload;
      state.seriesReviewsLoading = false;
    },
    clearSeriesReviewsError: (state) => {
      state.seriesReviewsError = null;
    },
    setSimilarSeriesLoading: (state, action) => {
      state.similarSeriesLoading = action.payload;
    },
    setSimilarSeries: (state, action) => {
      state.similarSeries = action.payload;
      state.similarSeriesLoading = false;
      state.similarSeriesError = null;
    },
    setSimilarSeriesError: (state, action) => {
      state.similarSeriesError = action.payload;
      state.similarSeriesLoading = false;
    },
    clearSimilarSeriesError: (state) => {
      state.similarSeriesError = null;
    },
    setSeriesVideosLoading: (state, action) => {
      state.seriesVideosLoading = action.payload;
    },
    setSeriesVideos: (state, action) => {
      state.seriesVideos = action.payload;
      state.seriesVideosLoading = false;
      state.seriesVideosError = null;
    },
    setSeriesVideosError: (state, action) => {
      state.seriesVideosError = action.payload;
      state.seriesVideosLoading = false;
    },
    clearSeriesVideosError: (state) => {
      state.seriesVideosError = null;
    },
    setSeriesSeasonsLoading: (state, action) => {
      state.seriesSeasonsLoading = false;
    },
    setSeriesSeasons: (state, action) => {
      state.seriesSeasons = action.payload;
      state.seriesSeasonsLoading = false;
      state.seriesSeasonsError = null;
    },
    setSeriesSeasonsError: (state, action) => {
      state.seriesSeasonsError = action.payload;
      state.seriesSeasonsLoading = false;
    },
    clearSeriesSeasonsError: (state) => {
      state.seriesSeasonsError = null;
    },
    setSeasonEpisodesLoading: (state, action) => {
      state.seasonEpisodesLoading = action.payload;
    },
    setSeasonEpisodes: (state, action) => {
      state.seasonEpisodes = action.payload;
      state.seasonEpisodesLoading = false;
      state.seasonEpisodesError = null;
    },
    setSeasonEpisodesError: (state, action) => {
      state.seasonEpisodesError = action.payload;
      state.seasonEpisodesLoading = false;
    },
    clearSeasonEpisodesError: (state) => {
      state.seasonEpisodesError = null;
    },
    setCurrentSeasonNumber: (state, action) => {
      state.currentSeasonNumber = action.payload;
    },
  },
});

export const {
  setCurrentSeriesId,
  resetSeriesDetail,
  setSeriesDetailsLoading,
  setSeriesDetails,
  setSeriesDetailsError,
  clearSeriesDetailsError,
  setSeriesCreditsLoading,
  setSeriesCredits,
  setSeriesCreditsError,
  clearSeriesCreditsError,
  setSeriesReviewsLoading,
  setSeriesReviews,
  setSeriesReviewsError,
  clearSeriesReviewsError,
  setSimilarSeriesLoading,
  setSimilarSeries,
  setSimilarSeriesError,
  clearSimilarSeriesError,
  setSeriesVideosLoading,
  setSeriesVideos,
  setSeriesVideosError,
  clearSeriesVideosError,
  setSeriesSeasonsLoading,
  setSeriesSeasons,
  setSeriesSeasonsError,
  clearSeriesSeasonsError,
  setSeasonEpisodesLoading,
  setSeasonEpisodes,
  setSeasonEpisodesError,
  clearSeasonEpisodesError,
  setCurrentSeasonNumber,
} = seriesDetailSlice.actions;

export default seriesDetailSlice.reducer;
