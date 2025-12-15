import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getImageUrl, tmdbService } from '../services/tmdbService';
import { 
  toggleSeriesInWishlist, 
  saveWishlistToStorage, 
  selectIsSeriesInWishlist 
} from '../redux/slices/wishlistSlice';
import {
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
  setSeasonEpisodesLoading,
  setSeasonEpisodes,
  setSeasonEpisodesError,
  clearSeasonEpisodesError,
  setCurrentSeriesId,
  setCurrentSeasonNumber,
  resetSeriesDetail,
} from '../redux/slices/seriesDetailSlice';


const { width, height } = Dimensions.get('window');

const getGenreColor = (genreName) => {
  const genreColors = {
    'Action & Adventure': '#ff4757',
    Animation: '#3742fa',
    Comedy: '#2ed573',
    Crime: '#5f27cd',
    Documentary: '#00d2d3',
    Drama: '#ff6b81',
    Family: '#70a1ff',
    Kids: '#ffa502',
    Mystery: '#747d8c',
    News: '#a4b0be',
    Reality: '#ff9ff3',
    'Sci-Fi & Fantasy': '#1e90ff',
    Soap: '#ff6348',
    Talk: '#40407a',
    'War & Politics': '#2c2c54',
    Western: '#cd853f',
  };
  return genreColors[genreName] || '#21262d';
};

const SeriesDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { series } = route.params || {};
  const [selectedSeason, setSelectedSeason] = useState(1);
 const { isDarkMode } = useSelector(state => state.theme);

  if (!series || !series.id) {
    return (
      <View
        style={[
          styles.errorContainer,
          !isDarkMode && styles.lightErrorContainer,
        ]}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#0d1117' : '#f8f9fbff'}
        />
        <Text style={styles.errorText}>
          Invalid series data. Please try again.
        </Text>
        <TouchableOpacity
          style={[
            styles.backButton,
            !isDarkMode && styles.lightBackButton,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={[
              styles.backButtonText,
              !isDarkMode && styles.lightBackButtonText,
            ]}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    seriesDetails,
    seriesDetailsLoading,
    seriesDetailsError,
    seriesCredits,
    seriesCreditsLoading,
    seriesCreditsError,
    seriesReviews,
    seriesReviewsLoading,
    seriesReviewsError,
    similarSeries,
    similarSeriesLoading,
    similarSeriesError,
    seriesVideos,
    seriesVideosLoading,
    seriesVideosError,
    seasonEpisodes,
    seasonEpisodesLoading,
    seasonEpisodesError,
    currentSeriesId,
    currentSeasonNumber,
  } = useSelector((state) => state.seriesDetail);

  const isInWishlist = useSelector((state) =>
    selectIsSeriesInWishlist(state, series.id),
  );

  const handleWishlistToggle = () => {
    const seriesData = {
      id: series.id,
      name: series.name,
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      overview: series.overview,
      first_air_date: series.first_air_date,
      vote_average: series.vote_average,
      type: 'series',
      image: series.image,
    };
    dispatch(toggleSeriesInWishlist(seriesData));
    dispatch(saveWishlistToStorage());
  };

  useEffect(() => {
    dispatch(setCurrentSeriesId(series.id));
    dispatch(setCurrentSeasonNumber(selectedSeason));
    fetchSeriesDetails();
    fetchSeriesCredits();
    fetchSeriesReviews();
    fetchSimilarSeries();
    fetchSeriesVideos();
    fetchSeasonEpisodes(selectedSeason);
    return () => {
      dispatch(resetSeriesDetail());
    };
  }, [series.id]);

  useEffect(() => {
    if (selectedSeason !== currentSeasonNumber) {
      dispatch(setCurrentSeasonNumber(selectedSeason));
      fetchSeasonEpisodes(selectedSeason);
    }
  }, [selectedSeason]);

  const handlePlaySeries = () => {
    if (seriesVideos && seriesVideos.length > 0) {
      const trailer = seriesVideos[0];
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      Linking.openURL(youtubeUrl).catch(() => {
        Alert.alert('Error', 'Could not open YouTube');
      });
    } else {
      Alert.alert('No Trailer', 'No trailer available for this series');
    }
  };

  const handleSimilarSeriesPress = (item) => {
    navigation.push('SeriesDetail', {
      series: {
        id: item.id,
        name: item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        first_air_date: item.first_air_date,
      },
    });
  };

  const handleEpisodePress = (episode) => {
    const sampleYouTubeUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
    Linking.openURL(sampleYouTubeUrl).catch(() => {
      Alert.alert('Error', 'Could not open video');
    });
  };

  const fetchSeriesDetails = async () => {
    try {
      dispatch(setSeriesDetailsLoading(true));
      dispatch(clearSeriesDetailsError());
      const data = await tmdbService.getSeriesDetails(series.id);
      dispatch(setSeriesDetails(data));
    } catch (error) {
      dispatch(
        setSeriesDetailsError(
          `Failed to load series details: ${error.message}`,
        ),
      );
    }
  };

  const fetchSeriesCredits = async () => {
    try {
      dispatch(setSeriesCreditsLoading(true));
      dispatch(clearSeriesCreditsError());
      const data = await tmdbService.getSeriesCredits(series.id);
      dispatch(setSeriesCredits(data));
    } catch (error) {
      dispatch(
        setSeriesCreditsError(
          `Failed to load series credits: ${error.message}`,
        ),
      );
    }
  };

  const fetchSeriesReviews = async () => {
    try {
      dispatch(setSeriesReviewsLoading(true));
      dispatch(clearSeriesReviewsError());
      const data = await tmdbService.getSeriesReviews(series.id);
      dispatch(setSeriesReviews(data.results || []));
    } catch (error) {
      dispatch(
        setSeriesReviewsError(
          `Failed to load series reviews: ${error.message}`,
        ),
      );
    }
  };

  const fetchSimilarSeries = async () => {
    try {
      dispatch(setSimilarSeriesLoading(true));
      dispatch(clearSimilarSeriesError());
      const data = await tmdbService.getSimilarSeries(series.id);
      dispatch(setSimilarSeries(data.results || []));
    } catch (error) {
      dispatch(
        setSimilarSeriesError(
          `Failed to load similar series: ${error.message}`,
        ),
      );
    }
  };

  const fetchSeriesVideos = async () => {
    try {
      dispatch(setSeriesVideosLoading(true));
      dispatch(clearSeriesVideosError());
      const data = await tmdbService.getSeriesVideos(series.id);
      const trailers =
        data.results?.filter(
          (video) => video.type === 'Trailer' && video.site === 'YouTube',
        ) || [];
      dispatch(setSeriesVideos(trailers));
    } catch (error) {
      dispatch(
        setSeriesVideosError(
          `Failed to load series videos: ${error.message}`,
        ),
      );
    }
  };

  const fetchSeasonEpisodes = async (seasonNumber) => {
    try {
      dispatch(setSeasonEpisodesLoading(true));
      dispatch(clearSeasonEpisodesError());
      const data = await tmdbService.getSeriesSeason(series.id, seasonNumber);
      dispatch(setSeasonEpisodes(data.episodes || []));
    } catch (error) {
      dispatch(
        setSeasonEpisodesError(
          `Failed to load season episodes: ${error.message}`,
        ),
      );
    }
  };

  const handleRetry = () => {
    fetchSeriesDetails();
    fetchSeriesCredits();
    fetchSeriesReviews();
    fetchSimilarSeries();
    fetchSeriesVideos();
    fetchSeasonEpisodes(selectedSeason);
  };

  if (seriesDetailsLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          !isDarkMode && styles.lightLoadingContainer,
        ]}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#0d1117' : '#f0f2f4ff'}
        />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading series details...</Text>
      </View>
    );
  }

  if (seriesDetailsError) {
    return (
      <View
        style={[
          styles.errorContainer,
          !isDarkMode && styles.lightErrorContainer,
        ]}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#0d1117' : '#f8f9fbff'}
        />
        <Text style={styles.errorText}>{seriesDetailsError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.backButton,
            !isDarkMode && styles.lightBackButton,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={[
              styles.backButtonText,
              !isDarkMode && styles.lightBackButtonText,
            ]}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getBackdropUrl = () => {
    if (seriesDetails?.backdrop_path) {
      return getImageUrl(seriesDetails.backdrop_path);
    }
    if (series.backdrop_path) {
      return getImageUrl(series.backdrop_path);
    }
    if (series.image) {
      return series.image;
    }
    return 'https://via.placeholder.com/500x750?text=No+Image';
  };

  const getPosterUrl = () => {
    if (seriesDetails?.poster_path) {
      return getImageUrl(seriesDetails.poster_path);
    }
    if (series.poster_path) {
      return getImageUrl(series.poster_path);
    }
    if (series.image) {
      return series.image;
    }
    return 'https://via.placeholder.com/300x450?text=No+Poster';
  };

  return (
    <View
      style={[
        styles.container,
        !isDarkMode && styles.lightContainer,
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: getBackdropUrl() }}
            style={styles.backdropImage}
          />
          <View
            style={[
              styles.heroOverlay,
              !isDarkMode && styles.lightHeroOverlay,
            ]}
          >
            <View style={styles.heroContent}>
              <Image
                source={{ uri: getPosterUrl() }}
                style={[
                  styles.posterImage,
                  !isDarkMode && styles.lightPosterImage,
                ]}
              />
              <View style={styles.seriesInfo}>
                <Text
                  style={[
                    styles.seriesTitle,
                    !isDarkMode && styles.lightSeriesTitle,
                  ]}
                >
                  {seriesDetails?.name || series.name}
                </Text>
                <View style={styles.seriesMeta}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.rating}>
                      {seriesDetails?.vote_average?.toFixed(1) ||
                        series.vote_average?.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <Text style={styles.year}>
                    {(seriesDetails?.first_air_date ||
                      series.first_air_date ||
                      ''
                    ).slice(0, 4)}
                  </Text>
                  {seriesDetails?.number_of_seasons && (
                    <>
                      <View style={styles.metaDivider} />
                      <Text style={styles.seasons}>
                        {seriesDetails.number_of_seasons} Season
                        {seriesDetails.number_of_seasons > 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                  {seriesDetails?.status && (
                    <>
                      <View style={styles.metaDivider} />
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              seriesDetails.status === 'Ended'
                                ? '#e50914'
                                : seriesDetails.status === 'Returning Series'
                                ? '#2ed573'
                                : '#747d8c',
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {seriesDetails.status}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                <View style={styles.genres}>
                  {seriesDetails?.genres?.map((genre) => (
                    <View
                      key={genre.id}
                      style={[
                        styles.genreContainer,
                        { backgroundColor: getGenreColor(genre.name) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.genre,
                          !isDarkMode && styles.lightGenre,
                        ]}
                      >
                        {genre.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.mainPlayButton}
                onPress={handlePlaySeries}
              >
                <View style={styles.playButtonContent}>
                  <Text style={styles.playIconMain}>▶</Text>
                  <Text style={styles.mainPlayButtonText}>
                    Play Trailer
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.secondaryButtons}>
                <TouchableOpacity
                  style={[
                    styles.watchlistButton,
                    isInWishlist && styles.watchlistButtonActive,
                  ]}
                  onPress={handleWishlistToggle}
                >
                  <Text
                    style={[
                      styles.watchlistButtonText,
                      isInWishlist && styles.watchlistButtonTextActive,
                    ]}
                  >
                    {isInWishlist
                      ? 'Remove from Watchlist'
                      : 'Add to Watchlist'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.overviewSection}>
          <Text
            style={[
              styles.sectionTitle,
              !isDarkMode && styles.lightSectionTitle,
            ]}
          >
            Overview
          </Text>
          <Text
            style={[
              styles.overview,
              !isDarkMode && styles.lightOverview,
            ]}
          >
            {seriesDetails?.overview || series.overview}
          </Text>
        </View>

        {/* Seasons */}
        {seriesDetails?.seasons && (
          <View style={styles.seasonsSection}>
            <View style={styles.episodesSectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  !isDarkMode && styles.lightSectionTitle,
                ]}
              >
                Seasons
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonsList}
            >
              {seriesDetails.seasons.map((season) => (
                <TouchableOpacity
                  key={season.season_number}
                  style={[
                    styles.seasonButton,
                    selectedSeason === season.season_number &&
                      styles.selectedSeasonButton,
                  ]}
                  onPress={() =>
                    setSelectedSeason(season.season_number)
                  }
                >
                  <Text
                    style={[
                      styles.seasonButtonText,
                      selectedSeason === season.season_number &&
                        styles.selectedSeasonButtonText,
                    ]}
                  >
                    {season.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {seasonEpisodesLoading ? (
              <View style={styles.loadingContainerInline}>
                <ActivityIndicator size="large" color="#e50914" />
                <Text style={styles.loadingText}>
                  Loading episodes...
                </Text>
              </View>
            ) : seasonEpisodesError ? (
              <View style={styles.errorContainerInline}>
                <Text style={styles.errorText}>
                  {seasonEpisodesError}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() =>
                    fetchSeasonEpisodes(selectedSeason)
                  }
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
              seasonEpisodes.map((episode) => (
                <TouchableOpacity
                  key={episode.id}
                  style={styles.episodeItem}
                  onPress={() => handleEpisodePress(episode)}
                >
                  <View style={styles.episodeImageContainer}>
                    <Image
                      source={{
                        uri: getImageUrl(episode.still_path),
                      }}
                      style={styles.episodeImage}
                    />
                    <View style={styles.playOverlay}>
                      <View style={styles.playButton}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.episodeInfoTouchable}>
                    <View style={styles.episodeHeader}>
                      <Text style={styles.episodeNumber}>
                        Episode {episode.episode_number}
                      </Text>
                      <View style={styles.episodeRatingContainer}>
                        <Text style={styles.episodeRatingIcon}>⭐</Text>
                        <Text style={styles.episodeRating}>
                          {episode.vote_average?.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.episodeTitle}>
                      {episode.name}
                    </Text>
                    <Text
                      style={styles.episodeOverview}
                      numberOfLines={2}
                    >
                      {episode.overview}
                    </Text>
                    <View style={styles.episodeMeta}>
                      <Text style={styles.episodeRuntime}>
                        {episode.runtime
                          ? `${episode.runtime} min`
                          : ''}
                      </Text>
                      <Text style={styles.episodeAirDate}>
                        {episode.air_date}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>
                No episodes found for this season.
              </Text>
            )}
          </View>
        )}

        {/* Cast */}
        {seriesCredits &&
          seriesCredits.cast &&
          seriesCredits.cast.length > 0 && (
            <View style={styles.castSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  !isDarkMode && styles.lightSectionTitle,
                ]}
              >
                Cast
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castList}
              >
                {seriesCredits.cast.slice(0, 15).map((cast) => (
                  <View key={cast.id} style={styles.castItem}>
                    <Image
                      source={{
                        uri: getImageUrl(cast.profile_path),
                      }}
                      style={styles.castImage}
                    />
                    <Text style={styles.castName}>{cast.name}</Text>
                    <Text style={styles.castCharacter}>
                      {cast.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

        {/* Reviews */}
        {seriesReviews && seriesReviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text
              style={[
                styles.sectionTitle,
                !isDarkMode && styles.lightSectionTitle,
              ]}
            >
              Reviews
            </Text>
            {seriesReviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>
                    {review.author}
                  </Text>
                  <Text style={styles.reviewRating}>
                    {review.author_details?.rating
                      ? `⭐ ${review.author_details.rating}`
                      : ''}
                  </Text>
                </View>
                <Text
                  style={styles.reviewContent}
                  numberOfLines={4}
                >
                  {review.content}
                </Text>
                <Text style={styles.reviewDate}>
                  {review.created_at?.slice(0, 10)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Similar */}
        <View style={styles.similarSection}>
          <Text
            style={[
              styles.sectionTitle,
              !isDarkMode && styles.lightSectionTitle,
            ]}
          >
            Similar Series
          </Text>
          {similarSeriesLoading ? (
            <View style={styles.loadingContainerInline}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingText}>
                Loading similar series...
              </Text>
            </View>
          ) : similarSeriesError ? (
            <View style={styles.errorContainerInline}>
              <Text style={styles.errorText}>
                {similarSeriesError}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchSimilarSeries}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : similarSeries && similarSeries.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
            >
              {similarSeries.slice(0, 10).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarSeriesItem}
                  onPress={() => handleSimilarSeriesPress(item)}
                >
                  <Image
                    source={{ uri: getImageUrl(item.poster_path) }}
                    style={styles.similarSeriesImage}
                  />
                  <Text
                    style={[
                      styles.similarSeriesTitle,
                      !isDarkMode &&
                        styles.lightSimilarSeriesTitle,
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.similarSeriesRating}>
                    ⭐ {item.vote_average?.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>
              No similar series found
            </Text>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // dark base
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  lightContainer: {
    flex: 1,
    backgroundColor: '#fcfbfbff',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightLoadingContainer: {
    flex: 1,
    backgroundColor: '#f0f2f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainerInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    color: '#8b949e',
    fontSize: 16,
    marginTop: 10,
    marginLeft: 10,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lightErrorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fbff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorContainerInline: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  errorText: {
    color: '#8b949e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  backButton: {
    backgroundColor: '#21262d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  lightBackButton: {
    backgroundColor: '#fbfcfcff',
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  lightBackButtonText: {
    color: '#040404ff',
  },

  scrollView: {
    flex: 1,
  },

  heroSection: {
    height: height * 0.6,
    position: 'relative',
  },

  backdropImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
  },
  lightHeroOverlay: {
    backgroundColor: 'rgba(133, 136, 141, 0.8)',
  },

  heroContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#21262d',
    marginRight: 15,
  },
  lightPosterImage: {
    backgroundColor: '#dde8f7ff',
  },

  seriesInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  seriesTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 28,
  },
  lightSeriesTitle: {
    color: '#070707ff',
  },

  seriesMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd700',
  },

  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  rating: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '600',
  },

  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#30363d',
    marginHorizontal: 10,
  },

  year: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },

  seasons: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  genreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  genre: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  lightGenre: {
    color: '#040404ff',
  },

  actionButtons: {
    flexDirection: 'column',
    gap: 12,
  },

  mainPlayButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playIconMain: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },

  mainPlayButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  watchlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  watchlistButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  watchlistButtonActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderColor: '#e50914',
  },

  watchlistButtonTextActive: {
    color: '#e50914',
    fontWeight: 'bold',
  },

  overviewSection: {
    padding: 20,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e50914',
    paddingLeft: 12,
  },
  lightSectionTitle: {
    color: '#0a0a0aff',
  },

  overview: {
    color: '#8b949e',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  lightOverview: {
    color: '#050505ff',
  },

  seasonsSection: {
    padding: 20,
    paddingTop: 10,
  },

  episodesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  seasonsList: {
    paddingLeft: 0,
    marginBottom: 20,
  },

  seasonButton: {
    backgroundColor: '#21262d',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  selectedSeasonButton: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
    shadowColor: '#e50914',
    shadowOpacity: 0.3,
    elevation: 4,
  },

  seasonButtonText: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },

  selectedSeasonButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  episodeItem: {
    flexDirection: 'row',
    backgroundColor: '#21262d',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#30363d',
    minHeight: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  episodeImageContainer: {
    position: 'relative',
    width: 140,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },

  episodeImage: {
    width: 140,
    height: 85,
    backgroundColor: '#30363d',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  playOverlay: {
    position: 'absolute',
    width: 140,
    height: 85,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  playIcon: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: 'bold',
  },

  episodeInfoTouchable: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },

  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  episodeNumber: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  episodeRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },

  episodeRatingIcon: {
    fontSize: 10,
    marginRight: 2,
  },

  episodeRating: {
    color: '#ffd700',
    fontSize: 10,
    fontWeight: '600',
  },

  episodeTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },

  episodeOverview: {
    color: '#8b949e',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },

  episodeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  episodeRuntime: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '500',
    backgroundColor: '#161b22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  episodeAirDate: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '400',
    fontStyle: 'italic',
  },

  castSection: {
    padding: 20,
    paddingTop: 10,
  },

  castList: {
    paddingLeft: 0,
  },

  castItem: {
    marginRight: 15,
    width: 100,
    alignItems: 'center',
  },

  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#21262d',
    marginBottom: 8,
  },

  castName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },

  castCharacter: {
    color: '#8b949e',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },

  reviewsSection: {
    padding: 20,
    paddingTop: 10,
  },

  reviewItem: {
    backgroundColor: '#21262d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  reviewAuthor: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  reviewRating: {
    color: '#8b949e',
    fontSize: 12,
  },

  reviewContent: {
    color: '#8b949e',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },

  reviewDate: {
    color: '#8b949e',
    fontSize: 12,
  },

  similarSection: {
    padding: 20,
    paddingTop: 10,
  },

  similarList: {
    paddingLeft: 0,
  },

  similarSeriesItem: {
    marginRight: 15,
    width: 120,
  },

  similarSeriesImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#21262d',
    marginBottom: 8,
  },

  similarSeriesTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  lightSimilarSeriesTitle: {
    color: '#090909ff',
  },

  similarSeriesRating: {
    color: '#8b949e',
    fontSize: 11,
    textAlign: 'center',
  },

  noDataText: {
    color: '#8b949e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },

  bottomSpacing: {
    height: 40,
  },
});

export default SeriesDetail;
