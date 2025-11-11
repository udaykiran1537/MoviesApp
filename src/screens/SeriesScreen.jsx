import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../redux/slices/authSlice';
import {
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
} from '../redux/slices/seriesSlice';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { 
  toggleSeriesInWishlist, 
  saveWishlistToStorage 
} from '../redux/slices/wishlistSlice';

const { width, height } = Dimensions.get('window');

const SeriesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);

  const {
    featuredSeries,
    airingTodayTvSeries,
    airingTodayLoading,
    airingTodayError,
    popularTvSeries,
    popularLoading,
    popularError,
    topRatedTvSeries,
    topRatedLoading,
    topRatedError,
    onTheAirTvSeries,
    onTheAirLoading,
    onTheAirError,
  } = useSelector((state) => state.series);
  const { wishlistSeries } = useSelector((state) => state.wishlist);

  const isSeriesInWishlist = (seriesId) => {
    return wishlistSeries.some(series => series.id === seriesId);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const handleSeriesWishlistToggle = (series, event) => {
    event.stopPropagation();
    let posterPath = series.poster_path;
    if (!posterPath && series.image && series.image.includes('image.tmdb.org')) {
      const urlParts = series.image.split('/');
      const filename = urlParts[urlParts.length - 1];
      posterPath = '/' + filename;
    }
    const seriesData = {
      id: series.id,
      name: series.title,
      title: series.title,
      image: series.image,
      poster_path: posterPath,
      overview: series.overview,
      first_air_date: series.firstAirDate,
      vote_average: parseFloat(series.rating) || 0,
      type: 'series'
    };
    dispatch(toggleSeriesInWishlist(seriesData));
    dispatch(saveWishlistToStorage());
  };

  const handleFeaturedSeriesPlay = async () => {
    try {
      const seriesVideos = await tmdbService.getSeriesVideos(featuredSeries.id);
      if (seriesVideos && seriesVideos.results && seriesVideos.results.length > 0) {
        const trailers = seriesVideos.results.filter(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailers.length > 0) {
          const trailer = trailers[0];
          const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          Linking.openURL(youtubeUrl).catch(err => {
            Alert.alert('Error', 'Could not open YouTube');
          });
        } else {
          const searchQuery = `${featuredSeries.title} official trailer`;
          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
          Linking.openURL(searchUrl).catch(err => {
            Alert.alert('Error', 'Could not open YouTube search');
          });
        }
      } else {
        const searchQuery = `${featuredSeries.title} official trailer`;
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        Linking.openURL(searchUrl).catch(err => {
          Alert.alert('Error', 'Could not open YouTube search');
        });
      }
    } catch (error) {
      const searchQuery = `${featuredSeries.title} official trailer`;
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      Linking.openURL(searchUrl).catch(err => {
        Alert.alert('Error', 'Could not open YouTube');
      });
    }
  };

  const fetchAiringTodayTvSeries = async () => {
    try {
      dispatch(setAiringTodayLoading(true));
      dispatch(clearAiringTodayError());
      const data = await tmdbService.getAiringTodayTv();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const series = data.results.slice(0, 20).map(show => ({
        id: show.id,
        title: show.name,
        image: getImageUrl(show.poster_path),
        rating: show.vote_average?.toFixed(1),
        overview: show.overview,
        firstAirDate: show.first_air_date,
      }));
      dispatch(setAiringTodayTvSeries(series));
    } catch (error) {
      dispatch(setAiringTodayError(`Failed to load series: ${error.message}`));
    }
  };

  const fetchPopularTvSeries = async () => {
    try {
      dispatch(setPopularLoading(true));
      dispatch(clearPopularError());
      const data = await tmdbService.getPopularTv();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const series = data.results.slice(0, 20).map(show => ({
        id: show.id,
        title: show.name,
        image: getImageUrl(show.poster_path),
        rating: show.vote_average?.toFixed(1),
        overview: show.overview,
        firstAirDate: show.first_air_date,
      }));
      dispatch(setPopularTvSeries(series));
    } catch (error) {
      dispatch(setPopularError(`Failed to load popular series: ${error.message}`));
    }
  };

  const fetchTopRatedTvSeries = async () => {
    try {
      dispatch(setTopRatedLoading(true));
      dispatch(clearTopRatedError());
      const data = await tmdbService.getTopRatedTv();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const series = data.results.slice(0, 20).map(show => ({
        id: show.id,
        title: show.name,
        image: getImageUrl(show.poster_path),
        rating: show.vote_average?.toFixed(1),
        overview: show.overview,
        firstAirDate: show.first_air_date,
      }));
      dispatch(setTopRatedTvSeries(series));
    } catch (error) {
      dispatch(setTopRatedError(`Failed to load top rated series: ${error.message}`));
    }
  };

  const fetchOnTheAirTvSeries = async () => {
    try {
      dispatch(setOnTheAirLoading(true));
      dispatch(clearOnTheAirError());
      const data = await tmdbService.getOnTheAirTv();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const series = data.results.slice(0, 20).map(show => ({
        id: show.id,
        title: show.name,
        image: getImageUrl(show.poster_path),
        rating: show.vote_average?.toFixed(1),
        overview: show.overview,
        firstAirDate: show.first_air_date,
      }));
      dispatch(setOnTheAirTvSeries(series));
    } catch (error) {
      dispatch(setOnTheAirError(`Failed to load on the air series: ${error.message}`));
    }
  };

  useEffect(() => {
    fetchAiringTodayTvSeries();
    fetchPopularTvSeries();
    fetchTopRatedTvSeries();
    fetchOnTheAirTvSeries();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

 

  const handleSeriesPress = (series) => {
    navigation.navigate('SeriesDetail', { 
      series: {
        id: series.id,
        name: series.title || series.name,
        overview: series.overview,
        poster_path: series.poster_path,
        backdrop_path: series.backdrop_path,
        vote_average: typeof series.vote_average === 'number' ? series.vote_average : 
                     (typeof series.rating === 'string' ? parseFloat(series.rating) : 0),
        first_air_date: series.first_air_date || series.firstAirDate,
        
      }
    });
  };

  const renderSeriesItem = ({ item }) => {
    const isInWishlist = isSeriesInWishlist(item.id);
    return (
      <TouchableOpacity 
        style={styles.seriesItem}
        onPress={() => handleSeriesPress(item)}
      >
        <View style={styles.seriesImageContainer}>
          <Image source={{ uri: item.image }} style={styles.seriesImage} />
          <TouchableOpacity 
            style={styles.seriesWishlistButton}
            onPress={(event) => handleSeriesWishlistToggle(item, event)}
          >
            <Text style={styles.seriesWishlistIcon}>
              {isInWishlist ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.seriesTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.seriesRating}>⭐ {item.rating}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.featuredSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image source={{ uri: featuredSeries.image }} style={styles.featuredImage} />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredSeries.title}</Text>
              <Text style={styles.featuredGenre}>{featuredSeries.genre}</Text>
              <Text style={styles.featuredRating}>⭐ {featuredSeries.rating}</Text>
              <Text style={styles.featuredDescription} numberOfLines={3}>
                {featuredSeries.description}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.playButton} onPress={handleFeaturedSeriesPlay}>
                  <Text style={styles.playButtonText}>▶ Play</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.seriesSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Airing Today</Text>
          {airingTodayLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingText}>Loading series...</Text>
            </View>
          ) : airingTodayError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{airingTodayError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchAiringTodayTvSeries}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={airingTodayTvSeries}
              renderItem={renderSeriesItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seriesList}
            />
          )}
        </Animated.View>

        <Animated.View style={styles.seriesSection}>
          <Text style={styles.sectionTitle}>Popular TV Series</Text>
          {popularLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingText}>Loading popular series...</Text>
            </View>
          ) : popularError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{popularError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchPopularTvSeries}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={popularTvSeries}
              renderItem={renderSeriesItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seriesList}
            />
          )}
        </Animated.View>

        <Animated.View style={styles.seriesSection}>
          <Text style={styles.sectionTitle}>Top Rated TV Series</Text>
          {topRatedLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingText}>Loading top rated series...</Text>
            </View>
          ) : topRatedError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{topRatedError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchTopRatedTvSeries}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={topRatedTvSeries}
              renderItem={renderSeriesItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seriesList}
            />
          )}
        </Animated.View>

        <Animated.View style={styles.seriesSection}>
          <Text style={styles.sectionTitle}>On The Air</Text>
          {onTheAirLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingText}>Loading on the air series...</Text>
            </View>
          ) : onTheAirError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{onTheAirError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchOnTheAirTvSeries}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={onTheAirTvSeries}
              renderItem={renderSeriesItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seriesList}
            />
          )}
        </Animated.View>

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
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(13, 17, 23, 0.9)',
    zIndex: 1000,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e50914',
    letterSpacing: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBtn: {
    padding: 8,
    marginRight: 15,
  },
  searchIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  profileBtn: {
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  featuredSection: {
    height: height * 0.6,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(13, 17, 23, 0.7)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  featuredGenre: {
    fontSize: 16,
    color: '#8b949e',
    marginBottom: 4,
  },
  featuredRating: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  featuredDescription: {
    fontSize: 16,
    color: '#8b949e',
    lineHeight: 22,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  playButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 15,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  seriesSection: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#8b949e',
    fontSize: 16,
    marginLeft: 10,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#8b949e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seriesList: {
    paddingLeft: 20,
  },
  seriesItem: {
    marginRight: 15,
    width: 120,
  },
  seriesImageContainer: {
    position: 'relative',
  },
  seriesImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#21262d',
  },
  seriesWishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  seriesWishlistIcon: {
    fontSize: 16,
  },
  seriesTitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  seriesRating: {
    fontSize: 11,
    color: '#8b949e',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SeriesScreen;