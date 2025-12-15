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
import { toggleDarkMode } from '../redux/slices/themeSlice';
import { 
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
 
} from '../redux/slices/movieSlice';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { 
  toggleMovieInWishlist, 
  saveWishlistToStorage 
} from '../redux/slices/wishlistSlice';

const { height } = Dimensions.get('window');

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const {isDarkMode} = useSelector((state) => state.theme);
  
  const {
    featuredMovie,
    nowPlayingMovies,
    nowPlayingLoading,
    nowPlayingError,
    popularMovies,
    popularLoading,
    popularError,
    topRatedMovies,
    topRatedLoading,
    topRatedError,
    upcomingMovies,
    upcomingLoading,
    upcomingError,
  } = useSelector((state) => state.movies);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const handleMovieWishlistToggle = (movie, event) => {
    event.stopPropagation();
    let posterPath = movie.poster_path;
    if (!posterPath && movie.image && movie.image.includes('image.tmdb.org')) {
      const urlParts = movie.image.split('/');
      const filename = urlParts[urlParts.length - 1];
      posterPath = '/' + filename;
    }
    const movieData = {
      id: movie.id,
      title: movie.title,
      image: movie.image,
      poster_path: posterPath,
      overview: movie.overview,
      release_date: movie.releaseDate,
      vote_average: parseFloat(movie.rating) || 0,
      type: 'movie'
    };
    dispatch(toggleMovieInWishlist(movieData));
    dispatch(saveWishlistToStorage(user?.uid));
  };

  const handleFeaturedMoviePlay = async () => {
    try {
      const movieVideos = await tmdbService.getMovieVideos(featuredMovie.id);
      if (movieVideos && movieVideos.results && movieVideos.results.length > 0) {
        const trailers = movieVideos.results.filter(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailers.length > 0) {
          const trailer = trailers[0];
          const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          Linking.openURL(youtubeUrl).catch(() => {
            Alert.alert('Error', 'Could not open YouTube');
          });
        } else {
          const searchQuery = `${featuredMovie.title} official trailer`;
          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
          Linking.openURL(searchUrl).catch(() => {
            Alert.alert('Error', 'Could not open YouTube search');
          });
        }
      } else {
        const searchQuery = `${featuredMovie.title} official trailer`;
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        Linking.openURL(searchUrl).catch(() => {
          Alert.alert('Error', 'Could not open YouTube search');
        });
      }
    } catch {
      const searchQuery = `${featuredMovie.title} official trailer`;
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      Linking.openURL(searchUrl).catch(() => {
        Alert.alert('Error', 'Could not open YouTube');
      });
    }
  };

  const fetchNowPlayingMovies = async () => {
    try {
      dispatch(setNowPlayingLoading(true));
      dispatch(clearNowPlayingError());
      const data = await tmdbService.getNowPlaying();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const movies = data.results.slice(0, 20).map(movie => ({
        id: movie.id,
        title: movie.title,
        image: getImageUrl(movie.poster_path),
        rating: movie.vote_average?.toFixed(1),
        overview: movie.overview,
        releaseDate: movie.release_date,
      }));
      dispatch(setNowPlayingMovies(movies));
    } catch (error) {
      dispatch(setNowPlayingError(`Failed to load movies: ${error.message}`));
      Alert.alert(
        'API Error', 
        `Failed to load movies: ${error.message}`,
        [
          { text: 'Retry', onPress: fetchNowPlayingMovies },
          { text: 'OK' }
        ]
      );
    }
  };

  const fetchPopularMovies = async () => {
    try {
      dispatch(setPopularLoading(true));
      dispatch(clearPopularError());
      const data = await tmdbService.getPopular();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const movies = data.results.slice(0, 20).map(movie => ({
        id: movie.id,
        title: movie.title,
        image: getImageUrl(movie.poster_path),
        rating: movie.vote_average?.toFixed(1),
        overview: movie.overview,
        releaseDate: movie.release_date,
      }));
      dispatch(setPopularMovies(movies));
    } catch (error) {
      dispatch(setPopularError(`Failed to load popular movies: ${error.message}`));
    }
  };

  const fetchTopRatedMovies = async () => {
    try {
      dispatch(setTopRatedLoading(true));
      dispatch(clearTopRatedError());
      const data = await tmdbService.getTopRated();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const movies = data.results.slice(0, 20).map(movie => ({
        id: movie.id,
        title: movie.title,
        image: getImageUrl(movie.poster_path),
        rating: movie.vote_average?.toFixed(1),
        overview: movie.overview,
        releaseDate: movie.release_date,
      }));
      dispatch(setTopRatedMovies(movies));
    } catch (error) {
      dispatch(setTopRatedError(`Failed to load top rated movies: ${error.message}`));
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      dispatch(setUpcomingLoading(true));
      dispatch(clearUpcomingError());
      const data = await tmdbService.getUpcoming();
      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }
      const movies = data.results.slice(0, 20).map(movie => ({
        id: movie.id,
        title: movie.title,
        image: getImageUrl(movie.poster_path),
        rating: movie.vote_average?.toFixed(1),
        overview: movie.overview,
        releaseDate: movie.release_date,
      }));
      dispatch(setUpcomingMovies(movies));
    } catch (error) {
      dispatch(setUpcomingError(`Failed to load upcoming movies: ${error.message}`));
    }
  };

  useEffect(() => {
    fetchNowPlayingMovies();
    fetchPopularMovies();
    fetchTopRatedMovies();
    fetchUpcomingMovies();
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


  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { 
      movie: {
        id: movie.id,
        title: movie.title || movie.name,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date,
        
      }
    });
  };

  const { wishlistMovies } = useSelector((state) => state.wishlist);
  
  const isMovieInWishlist = (movieId) => {
    return wishlistMovies.some(movie => movie.id === movieId);
  };

  const renderMovieItem = ({ item }) => {
    const isInWishlist = isMovieInWishlist(item.id);
    return (
      <TouchableOpacity 
        style={styles.movieItem}
        onPress={() => handleMoviePress(item)}
      >
        <View style={styles.movieImageContainer}>
          <Image source={{ uri: item.image }} style={styles.movieImage} />
          <TouchableOpacity 
            style={styles.movieWishlistButton}
            onPress={(event) => handleMovieWishlistToggle(item, event)}
          >
            <Text style={styles.movieWishlistIcon}>
              {isInWishlist ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={isDarkMode ? styles.movieTitle : styles.lightmovieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.movieRating}>⭐ {item.rating}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={isDarkMode ? styles.container : styles.lightcontainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#000" />
      <Animated.View style={[isDarkMode ? styles.navbar : styles.lightnavbar, { opacity: fadeAnim }]}>
        <View style={styles.navContent}>
          <Text style={styles.logo}>CINEFLIX</Text>
          <View style={{flexDirection:'row', alignItems:'center'}}>
          
           
          
          <TouchableOpacity onPress={() => dispatch(toggleDarkMode())}>
            <Text style={{color: '#fff', fontSize: 20}}>{isDarkMode ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Chatbot')}>
          <Image source={require('../assets/chatbot.png')} style={styles.profileImage} />
          </TouchableOpacity>
          </View>
          
          
        </View>
      </Animated.View>
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
          <Image source={{ uri: featuredMovie.image }} style={styles.featuredImage} />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredMovie.title}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.playButton} onPress={handleFeaturedMoviePlay}>
                  <Text style={styles.playButtonText}>▶ Play</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
        {renderSection('Now Playing', nowPlayingMovies, nowPlayingLoading, nowPlayingError, fetchNowPlayingMovies, renderMovieItem)}
        {renderSection('Popular Movies', popularMovies, popularLoading, popularError, fetchPopularMovies, renderMovieItem)}
        {renderSection('Top Rated Movies', topRatedMovies, topRatedLoading, topRatedError, fetchTopRatedMovies, renderMovieItem)}
        {renderSection('Upcoming Movies', upcomingMovies, upcomingLoading, upcomingError, fetchUpcomingMovies, renderMovieItem)}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );

  function renderSection(title, movies, loading, error, retryFn, renderItem) {
    return (
      <Animated.View style={styles.nowPlayingSection}>
        <Text style={isDarkMode ? styles.sectionTitle : styles.lightsectionTitle}>{title}</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e50914" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryFn}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={movies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moviesList}
          />
        )}
      </Animated.View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808ff',
  },
  lightcontainer: {
    flex: 1,
    backgroundColor: '#fcfbfbff',
  },
  navbar: {
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    marginTop:10,
    backgroundColor: 'rgba(9, 9, 9, 0.9)',
    zIndex: 1000,
  },
   lightnavbar: {
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    marginTop:10,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    zIndex: 1000,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e50914',
    letterSpacing: 3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  featuredSection: {
    height: height * 0.6,
    position: 'relative',
    padding: 30,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  featuredContent: {
    marginBottom: 50,
  },
  featuredTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  nowPlayingSection: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fefdfdff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  lightsectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
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
  moviesList: {
    paddingLeft: 20,
  },
  movieItem: {
    marginRight: 15,
    width: 120,
  },
  movieImageContainer: {
    position: 'relative',
  },
  movieImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#21262d',
  },
  movieWishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  movieWishlistIcon: {
    fontSize: 16,
  },
  movieTitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
   lightmovieTitle: {
    fontSize: 12,
    color: '#000000ff',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  movieRating: {
    fontSize: 11,
    color: '#8b949e',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 10,
  },
  profileImage: {
    width: 30,
    height:  40,
    borderRadius:  20,
    marginLeft: 25,
    
  },
});

export default HomeScreen;
