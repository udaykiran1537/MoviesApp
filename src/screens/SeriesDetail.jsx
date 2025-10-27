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
  FlatList,
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
    'Animation': '#3742fa',
    'Comedy': '#2ed573',
    'Crime': '#5f27cd',
    'Documentary': '#00d2d3',
    'Drama': '#ff6b81',
    'Family': '#70a1ff',
    'Kids': '#ffa502',
    'Mystery': '#747d8c',
    'News': '#a4b0be',
    'Reality': '#ff9ff3',
    'Sci-Fi & Fantasy': '#1e90ff',
    'Soap': '#ff6348',
    'Talk': '#40407a',
    'War & Politics': '#2c2c54',
    'Western': '#cd853f',
  };
  return genreColors[genreName] || '#21262d';
};

const SeriesDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { series } = route.params;
  const [selectedSeason, setSelectedSeason] = useState(1);

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
  const isInWishlist = useSelector((state) => selectIsSeriesInWishlist(state, series.id));

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
      image:series.image
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
      Linking.openURL(youtubeUrl).catch(err => {
        Alert.alert('Error', 'Could not open YouTube');
      });
    } else {
      Alert.alert('No Trailer', 'No trailer available for this series');
    }
  };

  const handleSimilarSeriesPress = (similarSeries) => {
    navigation.push('SeriesDetail', { 
      series: {
        id: similarSeries.id,
        name: similarSeries.name,
        overview: similarSeries.overview,
        poster_path: similarSeries.poster_path,
        backdrop_path: similarSeries.backdrop_path,
        vote_average: similarSeries.vote_average,
        first_air_date: similarSeries.first_air_date,
      }
    });
  };

  const handleEpisodePress = (episode) => {
    const sampleYouTubeUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
    Linking.openURL(sampleYouTubeUrl).catch(err => {
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
      dispatch(setSeriesDetailsError(`Failed to load series details: ${error.message}`));
    }
  };

  const fetchSeriesCredits = async () => {
    try {
      dispatch(setSeriesCreditsLoading(true));
      dispatch(clearSeriesCreditsError());
      const data = await tmdbService.getSeriesCredits(series.id);
      dispatch(setSeriesCredits(data));
    } catch (error) {
      dispatch(setSeriesCreditsError(`Failed to load series credits: ${error.message}`));
    }
  };

  const fetchSeriesReviews = async () => {
    try {
      dispatch(setSeriesReviewsLoading(true));
      dispatch(clearSeriesReviewsError());
      const data = await tmdbService.getSeriesReviews(series.id);
      dispatch(setSeriesReviews(data.results || []));
    } catch (error) {
      dispatch(setSeriesReviewsError(`Failed to load series reviews: ${error.message}`));
    }
  };

  const fetchSimilarSeries = async () => {
    try {
      dispatch(setSimilarSeriesLoading(true));
      dispatch(clearSimilarSeriesError());
      const data = await tmdbService.getSimilarSeries(series.id);
      dispatch(setSimilarSeries(data.results || []));
    } catch (error) {
      dispatch(setSimilarSeriesError(`Failed to load similar series: ${error.message}`));
    }
  };

  const fetchSeriesVideos = async () => {
    try {
      dispatch(setSeriesVideosLoading(true));
      dispatch(clearSeriesVideosError());
      const data = await tmdbService.getSeriesVideos(series.id);
      const trailers = data.results?.filter(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || [];
      dispatch(setSeriesVideos(trailers));
    } catch (error) {
      dispatch(setSeriesVideosError(`Failed to load series videos: ${error.message}`));
    }
  };

  const fetchSeasonEpisodes = async (seasonNumber) => {
    try {
      dispatch(setSeasonEpisodesLoading(true));
      dispatch(clearSeasonEpisodesError());
      const data = await tmdbService.getSeriesSeason(series.id, seasonNumber);
      dispatch(setSeasonEpisodes(data.episodes || []));
    } catch (error) {
      dispatch(setSeasonEpisodesError(`Failed to load season episodes: ${error.message}`));
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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading series details...</Text>
      </View>
    );
  }

  if (seriesDetailsError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
        <Text style={styles.errorText}>{seriesDetailsError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {series.name || series.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image 
            source={{ 
              uri: getImageUrl(seriesDetails?.backdrop_path || series.backdrop_path || series.poster_path, 'w780') 
            }} 
            style={styles.backdropImage}
            defaultSource={{ uri: 'https://via.placeholder.com/780x400/0d1117/ffffff?text=No+Image' }}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Image 
                source={{ 
                  uri: series.image || getImageUrl(seriesDetails?.poster_path || series.poster_path, 'w500') 
                }} 
                style={styles.posterImage}
                defaultSource={{ uri: 'https://via.placeholder.com/300x450/0d1117/ffffff?text=No+Image' }}
              />
              <View style={styles.seriesInfo}>
                <Text style={styles.seriesTitle}>{series.name || series.title}</Text>
                <View style={styles.seriesMeta}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.rating}>
                      {(() => {
                        const rating = seriesDetails?.vote_average || series.vote_average;
                        if (rating && typeof rating === 'number' && rating > 0) {
                          return rating.toFixed(1);
                        }
                        return 'NR';
                      })()}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <Text style={styles.year}>
                    {new Date(series.first_air_date || series.release_date).getFullYear()}
                  </Text>
                  {seriesDetails?.number_of_seasons && (
                    <>
                      <View style={styles.metaDivider} />
                      <Text style={styles.seasons}>
                        {seriesDetails.number_of_seasons} Season{seriesDetails.number_of_seasons > 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                  {seriesDetails?.status && (
                    <>
                      <View style={styles.metaDivider} />
                      <View style={[styles.statusBadge, { 
                        backgroundColor: seriesDetails.status === 'Ended' ? '#ff4757' : 
                                        seriesDetails.status === 'Returning Series' ? '#2ed573' : '#ffa502' 
                      }]}>
                        <Text style={styles.statusText}>
                          {seriesDetails.status}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                <View style={styles.genres}>
                  {seriesDetails?.genres?.slice(0, 3).map((genre, index) => (
                    <View key={genre.id} style={[styles.genreContainer, { backgroundColor: getGenreColor(genre.name) }]}>
                      <Text style={styles.genre}>
                        {genre.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.mainPlayButton} onPress={handlePlaySeries}>
                <View style={styles.playButtonContent}>
                  <Text style={styles.playIcon}>▶</Text>
                  <Text style={styles.mainPlayButtonText}>
                    {seriesVideosLoading ? 'Loading...' : 'Play Trailer'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.secondaryButtons}>
                <TouchableOpacity 
                  style={[
                    styles.watchlistButton, 
                    isInWishlist && styles.watchlistButtonActive
                  ]} 
                  onPress={handleWishlistToggle}
                >
                  <Text style={[
                    styles.watchlistButtonText,
                    isInWishlist && styles.watchlistButtonTextActive
                  ]}>
                    {isInWishlist ? '✓ My List' : '+ My List'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoButtonText}>ℹ Info</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.overview}>
            {series.overview || seriesDetails?.overview || 'No overview available.'}
          </Text>
          {seriesDetails && (
            <>
              <Text style={styles.sectionTitle}>Series Information</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>📺</Text>
                  </View>
                  <Text style={styles.detailLabel}>Seasons</Text>
                  <Text style={styles.detailValue}>
                    {seriesDetails.number_of_seasons || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>🎬</Text>
                  </View>
                  <Text style={styles.detailLabel}>Episodes</Text>
                  <Text style={styles.detailValue}>
                    {seriesDetails.number_of_episodes || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>⏱️</Text>
                  </View>
                  <Text style={styles.detailLabel}>Runtime</Text>
                  <Text style={styles.detailValue}>
                    {seriesDetails.episode_run_time?.[0] ? `${seriesDetails.episode_run_time[0]} min` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailCard}>
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>🌍</Text>
                  </View>
                  <Text style={styles.detailLabel}>Language</Text>
                  <Text style={styles.detailValue}>
                    {seriesDetails.original_language?.toUpperCase() || 'N/A'}
                  </Text>
                </View>
              </View>
              {seriesDetails.production_companies?.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Production Studios</Text>
                  <View style={styles.productionSection}>
                    {seriesDetails.production_companies.slice(0, 4).map((company, index) => (
                      <View key={company.id} style={styles.productionCompanyContainer}>
                        {company.logo_path ? (
                          <Image 
                            source={{ uri: getImageUrl(company.logo_path, 'w185') }}
                            style={styles.productionLogo}
                          />
                        ) : (
                          <View style={styles.productionPlaceholder}>
                            <Text style={styles.productionInitial}>
                              {company.name.charAt(0)}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.productionCompanyName} numberOfLines={2}>
                          {company.name}
                        </Text>
                        <Text style={styles.productionCountry}>
                          {company.origin_country || 'International'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </View>
        {seriesDetails?.seasons && seriesDetails.seasons.length > 0 && (
          <View style={styles.seasonsSection}>
            <View style={styles.episodesSectionHeader}>
              <Text style={styles.sectionTitle}>Seasons & Episodes</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={seriesDetails.seasons.filter(season => season.season_number > 0)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.seasonButton,
                    selectedSeason === item.season_number && styles.selectedSeasonButton
                  ]}
                  onPress={() => setSelectedSeason(item.season_number)}
                >
                  <Text style={[
                    styles.seasonButtonText,
                    selectedSeason === item.season_number && styles.selectedSeasonButtonText
                  ]}>
                    Season {item.season_number}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonsList}
            />
            {seasonEpisodesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#e50914" />
                <Text style={styles.loadingText}>Loading episodes...</Text>
              </View>
            ) : seasonEpisodesError ? (
              <Text style={styles.errorText}>{seasonEpisodesError}</Text>
            ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
              <FlatList
                data={seasonEpisodes.slice(0, 5)}
                renderItem={({ item }) => (
                  <View style={styles.episodeItem}>
                    <TouchableOpacity 
                      style={styles.episodeImageContainer}
                      onPress={() => handleEpisodePress(item)}
                    >
                      <Image 
                        source={{ uri: getImageUrl(item.still_path, 'w300') }} 
                        style={styles.episodeImage}
                        defaultSource={{ uri: 'https://via.placeholder.com/300x180/0d1117/ffffff?text=Episode+Image' }}
                      />
                      <View style={styles.playOverlay}>
                        <View style={styles.playButton}>
                          <Text style={styles.playIcon}>▶</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.episodeInfo}>
                      <TouchableOpacity 
                        onPress={() => handleEpisodePress(item)}
                        style={styles.episodeInfoTouchable}
                      >
                        <View style={styles.episodeHeader}>
                          <Text style={styles.episodeNumber}>Episode {item.episode_number}</Text>
                          {item.vote_average && item.vote_average > 0 && (
                            <View style={styles.episodeRatingContainer}>
                              <Text style={styles.episodeRatingIcon}>⭐</Text>
                              <Text style={styles.episodeRating}>
                                {typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : 'N/A'}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.episodeTitle} numberOfLines={2}>
                          {item.name || `Episode ${item.episode_number}`}
                        </Text>
                        <Text style={styles.episodeOverview} numberOfLines={2}>
                          {item.overview || 'No description available for this episode.'}
                        </Text>
                        <View style={styles.episodeMeta}>
                          <Text style={styles.episodeRuntime}>
                            {item.runtime ? `${item.runtime} min` : '~ 45 min'}
                          </Text>
                          {item.air_date && (
                            <Text style={styles.episodeAirDate}>
                              {new Date(item.air_date).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noDataText}>No episodes available</Text>
            )}
          </View>
        )}
        {seriesCredits?.cast && seriesCredits.cast.length > 0 && (
          <View style={styles.castSection}>
            <Text style={styles.sectionTitle}>Cast</Text>
            {seriesCreditsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#e50914" />
                <Text style={styles.loadingText}>Loading cast...</Text>
              </View>
            ) : seriesCreditsError ? (
              <Text style={styles.errorText}>{seriesCreditsError}</Text>
            ) : (
              <FlatList
                data={seriesCredits.cast.slice(0, 10)}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.castItem}>
                    <Image 
                      source={{ uri: getImageUrl(item.profile_path, 'w185') }} 
                      style={styles.castImage} 
                    />
                    <Text style={styles.castName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.castCharacter} numberOfLines={2}>{item.character}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castList}
              />
            )}
          </View>
        )}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {seriesReviewsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e50914" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : seriesReviewsError ? (
            <Text style={styles.errorText}>{seriesReviewsError}</Text>
          ) : seriesReviews && seriesReviews.length > 0 ? (
            <FlatList
              data={seriesReviews.slice(0, 3)}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{item.author}</Text>
                    <Text style={styles.reviewRating}>
                      ⭐ {item.author_details?.rating || 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.reviewContent} numberOfLines={4}>
                    {item.content}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noDataText}>No reviews available</Text>
          )}
        </View>
        <View style={styles.similarSection}>
          <Text style={styles.sectionTitle}>More Like This</Text>
          {similarSeriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e50914" />
              <Text style={styles.loadingText}>Loading similar series...</Text>
            </View>
          ) : similarSeriesError ? (
            <Text style={styles.errorText}>{similarSeriesError}</Text>
          ) : similarSeries && similarSeries.length > 0 ? (
            <FlatList
              data={similarSeries.slice(0, 10)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.similarSeriesItem}
                  onPress={() => handleSimilarSeriesPress(item)}
                >
                  <Image 
                    source={{ uri: getImageUrl(item.poster_path, 'w300') }} 
                    style={styles.similarSeriesImage} 
                  />
                  <Text style={styles.similarSeriesTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.similarSeriesRating}>
                    ⭐ {item.vote_average && typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : 'NR'}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
            />
          ) : (
            <Text style={styles.noDataText}>No similar series found</Text>
          )}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8b949e',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#0d1117',
  },
  backButtonHeader: {
    padding: 8,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 44,
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
    background: 'linear-gradient(transparent, rgba(13, 17, 23, 0.8), #0d1117)',
    padding: 20,
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
  playIcon: {
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
  playButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 15,
    flex: 1,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  infoButton: {
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
  infoButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  overview: {
    color: '#8b949e',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 2,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIconText: {
    fontSize: 18,
  },
  detailLabel: {
    color: '#8b949e',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  productionSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productionCompanyContainer: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    width: (width - 60) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  productionLogo: {
    width: 60,
    height: 30,
    resizeMode: 'contain',
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 4,
  },
  productionPlaceholder: {
    width: 60,
    height: 30,
    backgroundColor: '#e50914',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productionInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productionCompanyName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  productionCountry: {
    color: '#8b949e',
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
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
  viewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  viewAllText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '500',
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
  episodeInfo: {
    flex: 1,
    padding: 0,
    justifyContent: 'flex-start',
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
    flex: 1,
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
