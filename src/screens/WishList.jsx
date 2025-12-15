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
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../services/tmdbService';
import {
  loadWishlistFromStorage,
  saveWishlistToStorage,
  removeMovieFromWishlist,
  removeSeriesFromWishlist,
  clearWishlist,
  clearMoviesWishlist,
  clearSeriesWishlist,
  sortWishlist,
  selectTotalWishlistCount,
  selectWishlistMoviesCount,
  selectWishlistSeriesCount,
} from '../redux/slices/wishlistSlice';


const { width, height } = Dimensions.get('window');

const WishList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {
    wishlistMovies,
    wishlistSeries,
    isLoading,
    wishlistError,
  } = useSelector((state) => state.wishlist);
  const totalCount = useSelector(selectTotalWishlistCount);
  const moviesCount = useSelector(selectWishlistMoviesCount);
  const seriesCount = useSelector(selectWishlistSeriesCount);
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector(state => state.theme);

  useEffect(() => {
    if (user?.uid) {
      dispatch(loadWishlistFromStorage(user.uid));
    }
  }, [user?.uid, dispatch]);

  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('addedAt');
  const [refreshing, setRefreshing] = useState(false);

  const handleRemoveFromWishlist = (item) => {
    Alert.alert(
      'Remove from My List',
      `Remove "${item.title || item.name}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (item.type === 'movie' || item.title) {
              dispatch(removeMovieFromWishlist(item.id));
            } else {
              dispatch(removeSeriesFromWishlist(item.id));
            }
            dispatch(saveWishlistToStorage(user?.uid));
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (totalCount === 0) return;
    Alert.alert(
      'Clear My List',
      `Remove all ${totalCount} items from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            dispatch(clearWishlist());
            dispatch(saveWishlistToStorage(user?.uid));
          },
        },
      ],
    );
  };

  const handleClearByType = (type) => {
    const count = type === 'movies' ? moviesCount : seriesCount;
    if (count === 0) return;
    Alert.alert(
      `Clear ${type === 'movies' ? 'Movies' : 'TV Shows'}`,
      `Remove all ${count} ${
        type === 'movies' ? 'movies' : 'TV shows'
      } from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            if (type === 'movies') {
              dispatch(clearMoviesWishlist());
            } else {
              dispatch(clearSeriesWishlist());
            }
            dispatch(saveWishlistToStorage(user?.uid));
          },
        },
      ],
    );
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    if (activeTab === 'movies' || activeTab === 'all') {
      dispatch(sortWishlist({ type: 'movies', sortBy: newSortBy }));
    }
    if (activeTab === 'series' || activeTab === 'all') {
      dispatch(sortWishlist({ type: 'series', sortBy: newSortBy }));
    }
    dispatch(saveWishlistToStorage(user?.uid));
  };

  const handleItemPress = (item) => {
    if (item.type === 'movie' || item.title) {
      navigation.navigate('MovieDetail', {
        movie: {
          id: item.id,
          title: item.title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          overview: item.overview,
          release_date: item.release_date,
          vote_average: item.vote_average,
        },
      });
    } else {
      navigation.navigate('SeriesDetail', {
        series: {
          id: item.id,
          name: item.name,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          overview: item.overview,
          first_air_date: item.first_air_date,
          vote_average: item.vote_average,
        },
      });
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'movies':
        return wishlistMovies;
      case 'series':
        return wishlistSeries;
      default:
        return [...wishlistMovies, ...wishlistSeries].sort((a, b) => {
          switch (sortBy) {
            case 'title': {
              const titleA = (a.title || a.name || '').toLowerCase();
              const titleB = (b.title || b.name || '').toLowerCase();
              return titleA.localeCompare(titleB);
            }
            case 'rating':
              return (b.vote_average || 0) - (a.vote_average || 0);
            default:
              return new Date(b.addedAt) - new Date(a.addedAt);
          }
        });
    }
  };

  const renderWishlistItem = ({ item }) => {
    const title = item.title || item.name;
    const subtitle =
      item.type === 'movie' || item.title
        ? item.release_date?.split('-')[0]
        : item.first_air_date?.split('-')[0];

    const getWishlistImageUrl = () => {
      if (item.image && item.image.includes('image.tmdb.org')) {
        return item.image;
      }
      if (item.poster_path) {
        return getImageUrl(item.poster_path, 'w500');
      }
      if (item.image && item.image.startsWith('/')) {
        return `https://image.tmdb.org/t/p/w500${item.image}`;
      }
      return null;
    };

    const imageUrl = getWishlistImageUrl();

    return (
      <TouchableOpacity
        style={[
          styles.wishlistItem,
          !isDarkMode && styles.lightWishlistItem,
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.itemImage}
          />
        ) : (
          <View
            style={[styles.itemImage, styles.placeholderImage]}
          >
            <Text style={styles.placeholderText}>
              {item.type === 'movie' || item.title ? '🎬' : '📺'}
            </Text>
            <Text
              style={styles.placeholderTitle}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text
            style={[
              styles.itemTitle,
              !isDarkMode && styles.lightItemTitle,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.itemSubtitle,
                !isDarkMode && styles.lightItemSubtitle,
              ]}
            >
              {subtitle}
            </Text>
          )}
          {item.vote_average > 0 && (
            <Text style={styles.itemRating}>
              ⭐ {item.vote_average.toFixed(1)}
            </Text>
          )}
          {item.overview && (
            <Text
              style={[
                styles.itemOverview,
                !isDarkMode && styles.lightItemOverview,
              ]}
              numberOfLines={3}
            >
              {item.overview}
            </Text>
          )}
          <View style={styles.itemMeta}>
            <Text style={styles.mediaType}>
              {item.type === 'movie' || item.title ? 'Movie' : 'TV Show'}
            </Text>
            <Text style={styles.addedDate}>
              Added {new Date(item.addedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderTabs = () => {
    const tabs = [
      { key: 'all', label: `All (${totalCount})` },
      { key: 'movies', label: `Movies (${moviesCount})` },
      { key: 'series', label: `TV Shows (${seriesCount})` },
    ];
    return (
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
                !isDarkMode && styles.lightTab,
                !isDarkMode &&
                  activeTab === tab.key &&
                  styles.lightActiveTab,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                  !isDarkMode && styles.lightTabText,
                  !isDarkMode &&
                    activeTab === tab.key &&
                    styles.lightActiveTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSortOptions = () => {
    const sortOptions = [
      { key: 'addedAt', label: 'Recently Added' },
      { key: 'title', label: 'Title A-Z' },
      { key: 'rating', label: 'Rating' },
    ];
    return (
      <View style={styles.sortContainer}>
        <Text
          style={[
            styles.sortLabel,
            !isDarkMode && styles.lightSortLabel,
          ]}
        >
          Sort by:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.activeSortOption,
                !isDarkMode && styles.lightSortOption,
                !isDarkMode &&
                  sortBy === option.key &&
                  styles.lightActiveSortOption,
              ]}
              onPress={() => handleSortChange(option.key)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.key &&
                    styles.activeSortOptionText,
                  !isDarkMode && styles.lightSortOptionText,
                  !isDarkMode &&
                    sortBy === option.key &&
                    styles.lightActiveSortOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text
        style={[
          styles.emptyTitle,
          !isDarkMode && styles.lightEmptyTitle,
        ]}
      >
        Your list is empty
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          !isDarkMode && styles.lightEmptySubtitle,
        ]}
      >
        {activeTab === 'all'
          ? 'Add movies and TV shows to your list to watch later'
          : activeTab === 'movies'
          ? 'No movies in your list yet'
          : 'No TV shows in your list yet'}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('home')}
      >
        <Text style={styles.browseButtonText}>Browse Content</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          !isDarkMode && styles.lightContainer,
        ]}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#0d1117' : '#fcfbfbff'}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>
            Loading your list...
          </Text>
        </View>
      </View>
    );
  }

  const filteredData = getFilteredData();

  return (
    <View
      style={[
        styles.container,
        !isDarkMode && styles.lightContainer,
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0d1117' : '#fcfbfbff'}
      />
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            !isDarkMode && styles.lightHeaderTitle,
          ]}
        >
          My List
        </Text>
        {totalCount > 0 && (
          <TouchableOpacity
            style={[
              styles.clearAllButton,
              !isDarkMode && styles.lightClearAllButton,
            ]}
            onPress={handleClearAll}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      {totalCount > 0 && (
        <>
          {renderTabs()}
          {renderSortOptions()}
          {activeTab !== 'all' && (
            <View style={styles.clearTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.clearTypeButton,
                  !isDarkMode && styles.lightClearTypeButton,
                ]}
                onPress={() => handleClearByType(activeTab)}
              >
                <Text style={styles.clearTypeText}>
                  Clear{' '}
                  {activeTab === 'movies' ? 'Movies' : 'TV Shows'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      {filteredData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderWishlistItem}
          keyExtractor={(item, index) =>
            `${item.id}-${item.type}-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#e50914"
              colors={['#e50914']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // base dark
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#8b949e',
    marginTop: 16,
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0f6fc',
  },
  lightHeaderTitle: {
    color: '#111827',
  },

  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  lightClearAllButton: {
    backgroundColor: '#fee2e2',
  },

  clearAllText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '500',
  },

  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#21262d',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lightTab: {
    backgroundColor: '#e5e7eb',
    borderColor: '#e5e7eb',
  },

  activeTab: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  lightActiveTab: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },

  tabText: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },
  lightTabText: {
    color: '#4b5563',
  },

  activeTabText: {
    color: '#ffffff',
  },
  lightActiveTabText: {
    color: '#ffffff',
  },

  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  sortLabel: {
    color: '#8b949e',
    fontSize: 14,
    marginRight: 12,
  },
  lightSortLabel: {
    color: '#6b7280',
  },

  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#30363d',
    marginRight: 8,
  },
  lightSortOption: {
    backgroundColor: '#e5e7eb',
  },

  activeSortOption: {
    backgroundColor: '#e50914',
  },
  lightActiveSortOption: {
    backgroundColor: '#e50914',
  },

  sortOptionText: {
    color: '#8b949e',
    fontSize: 12,
  },
  lightSortOptionText: {
    color: '#4b5563',
  },

  activeSortOptionText: {
    color: '#ffffff',
  },
  lightActiveSortOptionText: {
    color: '#ffffff',
  },

  clearTypeContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  clearTypeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  lightClearTypeButton: {
    backgroundColor: '#fee2e2',
  },

  clearTypeText: {
    color: '#e50914',
    fontSize: 12,
    fontWeight: '500',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  wishlistItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    position: 'relative',
  },
  lightWishlistItem: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },

  itemImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#30363d',
  },

  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#30363d',
  },

  placeholderText: {
    fontSize: 24,
    color: '#8b949e',
    marginBottom: 4,
  },

  placeholderTitle: {
    fontSize: 10,
    color: '#6e7681',
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'flex-start',
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f0f6fc',
    marginBottom: 4,
  },
  lightItemTitle: {
    color: '#111827',
  },

  itemSubtitle: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 4,
  },
  lightItemSubtitle: {
    color: '#6b7280',
  },

  itemRating: {
    fontSize: 14,
    color: '#ffd700',
    marginBottom: 6,
  },

  itemOverview: {
    fontSize: 13,
    color: '#8b949e',
    lineHeight: 18,
    marginBottom: 8,
  },
  lightItemOverview: {
    color: '#4b5563',
  },

  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  mediaType: {
    fontSize: 12,
    color: '#e50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  addedDate: {
    fontSize: 11,
    color: '#6e7681',
  },

  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0f6fc',
    marginBottom: 8,
    textAlign: 'center',
  },
  lightEmptyTitle: {
    color: '#111827',
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#8b949e',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  lightEmptySubtitle: {
    color: '#6b7280',
  },

  browseButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WishList;
