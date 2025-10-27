const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '72390b9873bf09e66356072ef621491d'; 
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const buildUrl = (endpoint, params = {}) => {
  const cleanBase = TMDB_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  let url = `${cleanBase}/${cleanEndpoint}`;
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params,
  });
  url += `?${queryParams.toString()}`;
  return url;
};

const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const url = buildUrl(endpoint, params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `Status: ${response.status}`;
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    throw error;
  }
};

export const tmdbService = {
  getNowPlaying: async (page = 1) => {
    return await fetchFromTMDB('/movie/now_playing', { page });
  },
  getPopular: async (page = 1) => {
    return await fetchFromTMDB('/movie/popular', { page });
  },
  getTopRated: async (page = 1) => {
    return await fetchFromTMDB('/movie/top_rated', { page });
  },
  getUpcoming: async (page = 1) => {
    return await fetchFromTMDB('/movie/upcoming', { page });
  },
  getAiringTodayTv: async (page = 1) => {
    return await fetchFromTMDB('/tv/airing_today', { page });
  },
  getPopularTv: async (page = 1) => {
    return await fetchFromTMDB('/tv/popular', { page });
  },
  getTopRatedTv: async (page = 1) => {
    return await fetchFromTMDB('/tv/top_rated', { page });
  },
  getOnTheAirTv: async (page = 1) => {
    return await fetchFromTMDB('/tv/on_the_air', { page });
  },
  getMovieDetails: async (movieId) => {
    return await fetchFromTMDB(`/movie/${movieId}`);
  },
  getMovieCredits: async (movieId) => {
    return await fetchFromTMDB(`/movie/${movieId}/credits`);
  },
  getMovieReviews: async (movieId) => {
    return await fetchFromTMDB(`/movie/${movieId}/reviews`);
  },
  getSimilarMovies: async (movieId) => {
    return await fetchFromTMDB(`/movie/${movieId}/similar`);
  },
  getMovieVideos: async (movieId) => {
    return await fetchFromTMDB(`/movie/${movieId}/videos`);
  },
  getSeriesDetails: async (seriesId) => {
    return await fetchFromTMDB(`/tv/${seriesId}`);
  },
  getSeriesCredits: async (seriesId) => {
    return await fetchFromTMDB(`/tv/${seriesId}/credits`);
  },
  getSeriesReviews: async (seriesId) => {
    return await fetchFromTMDB(`/tv/${seriesId}/reviews`);
  },
  getSimilarSeries: async (seriesId) => {
    return await fetchFromTMDB(`/tv/${seriesId}/similar`);
  },
  getSeriesVideos: async (seriesId) => {
    return await fetchFromTMDB(`/tv/${seriesId}/videos`);
  },
  getSeriesSeason: async (seriesId, seasonNumber) => {
    return await fetchFromTMDB(`/tv/${seriesId}/season/${seasonNumber}`);
  },
  getEpisodeDetails: async (seriesId, seasonNumber, episodeNumber) => {
    return await fetchFromTMDB(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`);
  },
  searchMulti: async (query, page = 1) => {
    return await fetchFromTMDB('/search/multi', { query, page });
  },
  searchMovies: async (query, page = 1) => {
    return await fetchFromTMDB('/search/movie', { query, page });
  },
  searchTvShows: async (query, page = 1) => {
    return await fetchFromTMDB('/search/tv', { query, page });
  },
  searchPeople: async (query, page = 1) => {
    return await fetchFromTMDB('/search/person', { query, page });
  },
};

export const getImageUrl = (imagePath, size = 'w500') => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x450/0d1117/ffffff?text=No+Image';
  }
  return `${IMAGE_BASE_URL}/${size}${imagePath}`;
};

export default tmdbService;
