import React, { useEffect } from 'react';
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
  toggleMovieInWishlist, 
  saveWishlistToStorage, 
  selectIsMovieInWishlist 
} from '../redux/slices/wishlistSlice';

// import your theme slice selector (adjust path/name if different)


import {
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
} from '../redux/slices/movieDetailSlice';

const { width, height } = Dimensions.get('window');

const getGenreColor = (genreName) => {
  const genreColors = {
    Action: '#ff4757',
    Adventure: '#ffa502',
    Animation: '#3742fa',
    Comedy: '#2ed573',
    Crime: '#5f27cd',
    Documentary: '#00d2d3',
    Drama: '#ff6b81',
    Family: '#70a1ff',
    Fantasy: '#5352ed',
    History: '#a4b0be',
    Horror: '#2f3542',
    Music: '#ff9ff3',
    Mystery: '#747d8c',
    Romance: '#ff3838',
    'Science Fiction': '#1e90ff',
    'TV Movie': '#ff6348',
    Thriller: '#2c2c54',
    War: '#40407a',
    Western: '#cd853f',
  };

  return genreColors[genreName] || '#21262d';
};

const MovieDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { movie } = route.params;
  const {isDarkMode} = useSelector(state => state.theme);

  const {
    movieDetails,
    movieDetailsLoading,
    movieDetailsError,
    movieCredits,
    movieCreditsLoading,
    movieCreditsError,
    movieReviews,
    movieReviewsLoading,
    movieReviewsError,
    similarMovies,
    similarMoviesLoading,
    similarMoviesError,
    movieVideos,
    movieVideosLoading,
  } = useSelector((state) => state.movieDetail);

 
  const isInWishlist = useSelector((state) =>
    selectIsMovieInWishlist(state, movie.id),
  );

  const handlePlayMovie = () => {
    if (movieVideos && movieVideos.length > 0) {
      const trailer = movieVideos[0];
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

      Linking.openURL(youtubeUrl).catch(() => {
        Alert.alert('Error', 'Could not open YouTube');
      });
    } else {
      Alert.alert('No Trailer', 'No trailer available for this movie');
    }
  };

  const handleSimilarMoviePress = (similarMovie) => {
    navigation.push('MovieDetail', {
      movie: {
        id: similarMovie.id,
        title: similarMovie.title,
        overview: similarMovie.overview,
        poster_path: similarMovie.poster_path,
        backdrop_path: similarMovie.backdrop_path,
        vote_average: similarMovie.vote_average,
        release_date: similarMovie.release_date,
      },
    });
  };

  const handleWishlistToggle = () => {
    const movieData = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      type: 'movie',
      image: movie.image,
    };

    dispatch(toggleMovieInWishlist(movieData));
    dispatch(saveWishlistToStorage());
  };

  useEffect(() => {
    dispatch(setCurrentMovieId(movie.id));
    fetchMovieDetails();
    fetchMovieCredits();
    fetchMovieReviews();
    fetchSimilarMovies();
    fetchMovieVideos();

    return () => {
      dispatch(resetMovieDetail());
    };
  }, [movie.id]);

  const fetchMovieDetails = async () => {
    try {
      dispatch(setMovieDetailsLoading(true));
      dispatch(clearMovieDetailsError());

      const data = await tmdbService.getMovieDetails(movie.id);
      dispatch(setMovieDetails(data));
    } catch (error) {
      dispatch(
        setMovieDetailsError(`Failed to load movie details: ${error.message}`),
      );
    }
  };

  const fetchMovieCredits = async () => {
    try {
      dispatch(setMovieCreditsLoading(true));
      dispatch(clearMovieCreditsError());

      const data = await tmdbService.getMovieCredits(movie.id);
      dispatch(setMovieCredits(data));
    } catch (error) {
      dispatch(
        setMovieCreditsError(`Failed to load movie credits: ${error.message}`),
      );
    }
  };

  const fetchMovieReviews = async () => {
    try {
      dispatch(setMovieReviewsLoading(true));
      dispatch(clearMovieReviewsError());

      const data = await tmdbService.getMovieReviews(movie.id);
      dispatch(setMovieReviews(data.results || []));
    } catch (error) {
      dispatch(
        setMovieReviewsError(`Failed to load movie reviews: ${error.message}`),
      );
    }
  };

  const fetchSimilarMovies = async () => {
    try {
      dispatch(setSimilarMoviesLoading(true));
      dispatch(clearSimilarMoviesError());

      const data = await tmdbService.getSimilarMovies(movie.id);
      dispatch(setSimilarMovies(data.results || []));
    } catch (error) {
      dispatch(
        setSimilarMoviesError(`Failed to load similar movies: ${error.message}`),
      );
    }
  };

  const fetchMovieVideos = async () => {
    try {
      dispatch(setMovieVideosLoading(true));
      dispatch(clearMovieVideosError());

      const data = await tmdbService.getMovieVideos(movie.id);

      const trailers =
        data.results?.filter(
          (video) => video.type === 'Trailer' && video.site === 'YouTube',
        ) || [];

      dispatch(setMovieVideos(trailers));
    } catch (error) {
      dispatch(
        setMovieVideosError(`Failed to load movie videos: ${error.message}`),
      );
    }
  };

  const handleRetry = () => {
    fetchMovieDetails();
    fetchMovieCredits();
    fetchMovieReviews();
    fetchSimilarMovies();
    fetchMovieVideos();
  };

  if (movieDetailsLoading) {
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
        <Text style={styles.loadingText}>Loading movie details...</Text>
      </View>
    );
  }

  if (movieDetailsError) {
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
        <Text style={styles.errorText}>{movieDetailsError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text
            style={[
              styles.retryButtonText,
              !isDarkMode && styles.lightRetryButtonText,
            ]}
          >
            Retry
          </Text>
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

      <View
        style={[
          styles.header,
          !isDarkMode && styles.lightHeader,
        ]}
      >
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={[
              styles.backIcon,
              !isDarkMode && styles.lightBackIcon,
            ]}
          >
            ‹
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            !isDarkMode && styles.lightHeaderTitle,
          ]}
          numberOfLines={1}
        >
          {movie.title || movie.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: getImageUrl(
                movieDetails?.backdrop_path ||
                  movie.backdrop_path ||
                  movie.poster_path,
                'w780',
              ),
            }}
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
                source={{
                  uri:
                    movie.image ||
                    getImageUrl(
                      movieDetails?.poster_path || movie.poster_path,
                      'w500',
                    ),
                }}
                style={[
                  styles.posterImage,
                  !isDarkMode && styles.lightPosterImage,
                ]}
              />
              <View style={styles.movieInfo}>
                <Text
                  style={[
                    styles.movieTitle,
                    !isDarkMode && styles.lightMovieTitle,
                  ]}
                >
                  {movie.title || movie.name}
                </Text>
                <View style={styles.movieMeta}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.rating}>
                      {(() => {
                        const rating =
                          movieDetails?.vote_average || movie.vote_average;
                        if (rating && rating > 0) {
                          return rating.toFixed(1);
                        }
                        return 'NR';
                      })()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.metaDivider,
                      !isDarkMode && styles.lightMetaDivider,
                    ]}
                  />
                  <Text
                    style={[
                      styles.year,
                      !isDarkMode && styles.lightYear,
                    ]}
                  >
                    {new Date(
                      movie.release_date || movie.first_air_date,
                    ).getFullYear()}
                  </Text>
                  {movieDetails?.runtime && (
                    <>
                      <View
                        style={[
                          styles.metaDivider,
                          !isDarkMode && styles.lightMetaDivider,
                        ]}
                      />
                      <Text
                        style={[
                          styles.runtime,
                          !isDarkMode && styles.lightRuntime,
                        ]}
                      >
                        {movieDetails.runtime} min
                      </Text>
                    </>
                  )}
                  {movieDetails?.vote_count && (
                    <>
                      <View
                        style={[
                          styles.metaDivider,
                          !isDarkMode && styles.lightMetaDivider,
                        ]}
                      />
                      <Text
                        style={[
                          styles.voteCount,
                          !isDarkMode && styles.lightVoteCount,
                        ]}
                      >
                        {movieDetails.vote_count.toLocaleString()} votes
                      </Text>
                    </>
                  )}
                  {movieDetails?.status && (
                    <>
                      <View
                        style={[
                          styles.metaDivider,
                          !isDarkMode && styles.lightMetaDivider,
                        ]}
                      />
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              movieDetails.status === 'Released'
                                ? '#2ed573'
                                : '#ffa502',
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {movieDetails.status}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                <View style={styles.genres}>
                  {movieDetails?.genres?.slice(0, 3).map((genre) => (
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
                onPress={handlePlayMovie}
              >
                <View style={styles.playButtonContent}>
                  <Text style={styles.playIcon}>▶</Text>
                  <Text style={styles.mainPlayButtonText}>
                    {movieVideosLoading ? 'Loading...' : 'Play Trailer'}
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
          <Text
            style={[
              styles.sectionTitle,
              !isDarkMode && styles.lightSectionTitle,
            ]}
          >
            Synopsis
          </Text>
          <Text
            style={[
              styles.overview,
              !isDarkMode && styles.lightOverview,
            ]}
          >
            {movie.overview ||
              movieDetails?.overview ||
              'No overview available.'}
          </Text>

          {movieDetails && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  !isDarkMode && styles.lightSectionTitle,
                ]}
              >
                Movie Information
              </Text>
              <View style={styles.detailsGrid}>
                <View
                  style={[
                    styles.detailCard,
                    !isDarkMode && styles.lightDetailCard,
                  ]}
                >
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>💰</Text>
                  </View>
                  <Text
                    style={[
                      styles.detailLabel,
                      !isDarkMode && styles.lightDetailLabel,
                    ]}
                  >
                    Budget
                  </Text>
                  <Text style={styles.detailValue}>
                    {movieDetails.budget
                      ? `$${(movieDetails.budget / 1000000).toFixed(1)}M`
                      : 'N/A'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailCard,
                    !isDarkMode && styles.lightDetailCard,
                  ]}
                >
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>📈</Text>
                  </View>
                  <Text
                    style={[
                      styles.detailLabel,
                      !isDarkMode && styles.lightDetailLabel,
                    ]}
                  >
                    Revenue
                  </Text>
                  <Text style={styles.detailValue}>
                    {movieDetails.revenue
                      ? `$${(movieDetails.revenue / 1000000).toFixed(1)}M`
                      : 'N/A'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailCard,
                    !isDarkMode && styles.lightDetailCard,
                  ]}
                >
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>🌍</Text>
                  </View>
                  <Text
                    style={[
                      styles.detailLabel,
                      !isDarkMode && styles.lightDetailLabel,
                    ]}
                  >
                    Language
                  </Text>
                  <Text style={styles.detailValue}>
                    {movieDetails.original_language?.toUpperCase() || 'N/A'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailCard,
                    !isDarkMode && styles.lightDetailCard,
                  ]}
                >
                  <View style={styles.detailIcon}>
                    <Text style={styles.detailIconText}>⏱️</Text>
                  </View>
                  <Text
                    style={[
                      styles.detailLabel,
                      !isDarkMode && styles.lightDetailLabel,
                    ]}
                  >
                    Runtime
                  </Text>
                  <Text style={styles.detailValue}>
                    {movieDetails.runtime
                      ? `${movieDetails.runtime} min`
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {movieDetails.production_companies?.length > 0 && (
                <>
                  <Text
                    style={[
                      styles.sectionTitle,
                      !isDarkMode && styles.lightSectionTitle,
                    ]}
                  >
                    Production Studios
                  </Text>
                  <View style={styles.productionSection}>
                    {movieDetails.production_companies
                      .slice(0, 4)
                      .map((company) => (
                        <View
                          key={company.id}
                          style={[
                            styles.productionCompanyContainer,
                            !isDarkMode &&
                              styles.lightProductionCompanyContainer,
                          ]}
                        >
                          {company.logo_path ? (
                            <Image
                              source={{
                                uri: getImageUrl(company.logo_path, 'w185'),
                              }}
                              style={styles.productionLogo}
                            />
                          ) : (
                            <View style={styles.productionPlaceholder}>
                              <Text style={styles.productionInitial}>
                                {company.name.charAt(0)}
                              </Text>
                            </View>
                          )}
                          <Text
                            style={[
                              styles.productionCompanyName,
                              !isDarkMode &&
                                styles.lightProductionCompanyName,
                            ]}
                            numberOfLines={2}
                          >
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

        {movieCredits?.cast && movieCredits.cast.length > 0 && (
          <View style={styles.castSection}>
            <Text
              style={[
                styles.sectionTitle,
                !isDarkMode && styles.lightSectionTitle,
              ]}
            >
              Cast
            </Text>
            {movieCreditsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#e50914" />
                <Text style={styles.loadingText}>Loading cast...</Text>
              </View>
            ) : movieCreditsError ? (
              <Text style={styles.errorText}>{movieCreditsError}</Text>
            ) : (
              <FlatList
                data={movieCredits.cast.slice(0, 10)}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.castItem}>
                    <Image
                      source={{
                        uri: getImageUrl(item.profile_path, 'w185'),
                      }}
                      style={styles.castImage}
                    />
                    <Text style={styles.castName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.castCharacter} numberOfLines={2}>
                      {item.character}
                    </Text>
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
          <Text
            style={[
              styles.sectionTitle,
              !isDarkMode && styles.lightSectionTitle,
            ]}
          >
            Reviews
          </Text>
          {movieReviewsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e50914" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : movieReviewsError ? (
            <Text style={styles.errorText}>{movieReviewsError}</Text>
          ) : movieReviews && movieReviews.length > 0 ? (
            <FlatList
              data={movieReviews.slice(0, 3)}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.reviewItem,
                    !isDarkMode && styles.lightReviewItem,
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <Text
                      style={[
                        styles.reviewAuthor,
                        !isDarkMode && styles.lightReviewAuthor,
                      ]}
                    >
                      {item.author}
                    </Text>
                    <Text
                      style={[
                        styles.reviewRating,
                        !isDarkMode && styles.lightReviewRating,
                      ]}
                    >
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
          <Text
            style={[
              styles.sectionTitle,
              !isDarkMode && styles.lightSectionTitle,
            ]}
          >
            More Like This
          </Text>
          {similarMoviesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e50914" />
              <Text style={styles.loadingText}>
                Loading similar movies...
              </Text>
            </View>
          ) : similarMoviesError ? (
            <Text style={styles.errorText}>{similarMoviesError}</Text>
          ) : similarMovies && similarMovies.length > 0 ? (
            <FlatList
              data={similarMovies.slice(0, 10)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.similarMovieItem}
                  onPress={() => handleSimilarMoviePress(item)}
                >
                  <Image
                    source={{
                      uri: getImageUrl(item.poster_path, 'w300'),
                    }}
                    style={styles.similarMovieImage}
                  />
                  <Text
                    style={[
                      styles.similarMovieTitle,
                      !isDarkMode && styles.lightSimilarMovieTitle,
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.similarMovieRating}>
                    ⭐ {item.vote_average?.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
            />
          ) : (
            <Text style={styles.noDataText}>No similar movies found</Text>
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
    backgroundColor: '#f5f6f7ff',
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
  lightErrorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fbff',
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
  lightRetryButtonText: {
    color: '#040404ff',
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
    color: '#ffffff',
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
  lightHeader: {
    backgroundColor: '#fdfdfdff',
  },

  backButtonHeader: {
    padding: 8,
  },

  backIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  lightBackIcon: {
    color: '#040404ff',
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  lightHeaderTitle: {
    color: '#090909ff',
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
    height: '70%',
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    justifyContent: 'flex-end',
    padding: 20,
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
    marginRight: 20,
    backgroundColor: '#21262d',
  },
  lightPosterImage: {
    backgroundColor: '#dde8f7ff',
  },

  movieInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  movieTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 28,
  },
  lightMovieTitle: {
    color: '#070707ff',
  },

  movieMeta: {
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
  lightMetaDivider: {
    backgroundColor: '#fcfdfdff',
  },

  year: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },
  lightYear: {
    color: '#f9fbfdff',
  },

  runtime: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },
  lightRuntime: {
    color: '#f7f8f9ff',
  },

  voteCount: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '400',
  },
  lightVoteCount: {
    color: '#f9fafbff',
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lightDetailCard: {
    backgroundColor: '#d1dbe9ff',
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
  lightDetailLabel: {
    color: '#070707ff',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lightProductionCompanyContainer: {
    backgroundColor: '#c7d5e8ff',
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
  lightProductionCompanyName: {
    color: '#0c0c0cff',
  },

  productionCountry: {
    color: '#8b949e',
    fontSize: 10,
    textAlign: 'center',
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
  lightReviewItem: {
    backgroundColor: '#a9bad1ff',
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
  lightReviewAuthor: {
    color: '#0b0b0bff',
  },

  reviewRating: {
    color: '#8b949e',
    fontSize: 12,
  },
  lightReviewRating: {
    color: '#292c2fff',
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

  similarMovieItem: {
    marginRight: 15,
    width: 120,
  },

  similarMovieImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#21262d',
    marginBottom: 8,
  },

  similarMovieTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  lightSimilarMovieTitle: {
    color: '#090909ff',
  },

  similarMovieRating: {
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

export default MovieDetail;
