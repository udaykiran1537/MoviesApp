import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import {
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
} from '../redux/slices/searchSlice';


const { width, height } = Dimensions.get('window');

const SearchScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {
    searchQuery,
    searchResults,
    searchLoading,
    searchError,
    searchType,
    currentPage,
    totalPages,
    totalResults,
    recentSearches,
    trendingSearches,
  } = useSelector((state) => state.search);

 const{isDarkMode} = useSelector(state => state.theme);

  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [defaultContent, setDefaultContent] = useState([]);
  const [defaultLoading, setDefaultLoading] = useState(false);

  const performSearch = useCallback(
    async (query, page = 1) => {
      if (!query.trim()) {
        dispatch(clearSearchResults());
        return;
      }

      try {
        dispatch(setSearchLoading(true));
        dispatch(clearSearchError());

        let searchData;

        switch (searchType) {
          case 'movie':
            searchData = await tmdbService.searchMovies(query, page);
            break;
          case 'tv':
            searchData = await tmdbService.searchTvShows(query, page);
            break;
          case 'person':
            searchData = await tmdbService.searchPeople(query, page);
            break;
          default:
            searchData = await tmdbService.searchMulti(query, page);
            break;
        }

        dispatch(
          setSearchResults({
            results: searchData.results,
            page: searchData.page,
            total_pages: searchData.total_pages,
            total_results: searchData.total_results,
          }),
        );

        if (page === 1) {
          dispatch(addRecentSearch(query));
        }
      } catch (error) {
        dispatch(setSearchError(`Search failed: ${error.message}`));
        Alert.alert('Search Error', 'Failed to search. Please try again.');
      }
    },
    [searchType, dispatch],
  );

  const loadDefaultContent = useCallback(async (type) => {
    try {
      setDefaultLoading(true);

      let data;

      switch (type) {
        case 'movie':
          data = await tmdbService.getPopular();
          break;
        case 'tv':
          data = await tmdbService.getPopularTv();
          break;
        case 'person':
          data = await tmdbService.searchPeople('popular actor', 1);
          break;
        default:
          try {
            const [moviesData, tvData] = await Promise.all([
              tmdbService.getPopular(),
              tmdbService.getPopularTv(),
            ]);
            const combinedResults = [
              ...moviesData.results
                .slice(0, 10)
                .map((item) => ({ ...item, media_type: 'movie' })),
              ...tvData.results
                .slice(0, 10)
                .map((item) => ({ ...item, media_type: 'tv' })),
            ];
            const shuffled = combinedResults.sort(
              () => Math.random() - 0.5,
            );
            data = { results: shuffled };
          } catch (error) {
            data = await tmdbService.getPopular();
          }
          break;
      }

      setDefaultContent(data.results || []);
    } catch (error) {
      setDefaultContent([]);
    } finally {
      setDefaultLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      loadDefaultContent(searchType);
    }
  }, [searchType, loadDefaultContent, searchQuery]);

  useEffect(() => {
    loadDefaultContent('all');
  }, [loadDefaultContent]);

  const handleSearchChange = (text) => {
    dispatch(setSearchQuery(text));
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      if (text.trim()) {
        performSearch(text);
      } else {
        dispatch(clearSearchResults());
        loadDefaultContent(searchType);
      }
    }, 500);
    setSearchTimeout(timeout);
  };

  const handleSearchTypeChange = (type) => {
    dispatch(setSearchType(type));
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1);
    } else {
      loadDefaultContent(type);
    }
  };

  const handleQuickSearch = (query) => {
    dispatch(setSearchQuery(query));
    performSearch(query);
  };

  const loadMoreResults = () => {
    if (currentPage < totalPages && !searchLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      dispatch(incrementPage());
      performSearch(searchQuery, currentPage + 1).finally(() => {
        setIsLoadingMore(false);
      });
    }
  };

  const handleResultPress = (item) => {
    if (item.media_type === 'movie' || (!item.media_type && item.title)) {
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
    } else if (item.media_type === 'tv' || (!item.media_type && item.name)) {
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
    } else if (item.media_type === 'person') {
      Alert.alert(
        item.name,
        `Known for: ${item.known_for_department}\nPopularity: ${item.popularity.toFixed(
          1,
        )}`,
        [
          {
            text: 'Search on Google',
            onPress: () => {
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                item.name + ' actor',
              )}`;
              Linking.openURL(searchUrl);
            },
          },
          { text: 'OK', style: 'cancel' },
        ],
      );
    }
  };

  const renderSearchResult = ({ item }) => {
    const isMovie =
      item.media_type === 'movie' ||
      (!item.media_type && item.title) ||
      (searchType === 'movie' && !item.media_type);
    const isTv =
      item.media_type === 'tv' ||
      (!item.media_type && item.name) ||
      (searchType === 'tv' && !item.media_type);
    const isPerson =
      item.media_type === 'person' ||
      (searchType === 'person' && !item.media_type);

    const title = item.title || item.name;
    const subtitle = isMovie
      ? item.release_date?.split('-')[0]
      : isTv
      ? item.first_air_date?.split('-')[0]
      : isPerson
      ? item.known_for_department
      : '';
    const imageUrl = isPerson
      ? getImageUrl(item.profile_path, 'w200')
      : getImageUrl(item.poster_path, 'w200');

    return (
      <TouchableOpacity
        style={[
          styles.resultItem,
          !isDarkMode && styles.lightResultItem,
        ]}
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.resultImage,
            isPerson && styles.personImage,
          ]}
        />
        <View style={styles.resultInfo}>
          <Text
            style={[
              styles.resultTitle,
              !isDarkMode && styles.lightResultTitle,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.resultSubtitle,
                !isDarkMode && styles.lightResultSubtitle,
              ]}
            >
              {subtitle}
            </Text>
          )}
          {item.vote_average > 0 && !isPerson && (
            <Text style={styles.resultRating}>
              ⭐ {item.vote_average.toFixed(1)}
            </Text>
          )}
          {item.overview && (
            <Text
              style={[
                styles.resultOverview,
                !isDarkMode && styles.lightResultOverview,
              ]}
              numberOfLines={3}
            >
              {item.overview}
            </Text>
          )}
          <View style={styles.resultMeta}>
            <Text style={styles.mediaType}>
              {isMovie ? 'Movie' : isTv ? 'TV Show' : 'Person'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchFilters = () => {
    const filters = [
      { key: 'all', label: 'All' },
      { key: 'movie', label: 'Movies' },
      { key: 'tv', label: 'TV Shows' },
      { key: 'person', label: 'People' },
    ];
    return (
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                searchType === filter.key &&
                  styles.activeFilterButton,
                !isDarkMode && styles.lightFilterButton,
                !isDarkMode &&
                  searchType === filter.key &&
                  styles.lightActiveFilterButton,
              ]}
              onPress={() => handleSearchTypeChange(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  searchType === filter.key &&
                    styles.activeFilterText,
                  !isDarkMode && styles.lightFilterText,
                  !isDarkMode &&
                    searchType === filter.key &&
                    styles.lightActiveFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecentSearches = () => {
    if (!recentSearches.length) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              !isDarkMode && styles.lightSectionTitle,
            ]}
          >
            Recent Searches
          </Text>
          <TouchableOpacity
            onPress={() => dispatch(clearRecentSearches())}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.searchChip,
                !isDarkMode && styles.lightSearchChip,
              ]}
              onPress={() => handleQuickSearch(search)}
            >
              <Text
                style={[
                  styles.searchChipText,
                  !isDarkMode && styles.lightSearchChipText,
                ]}
              >
                {search}
              </Text>
              <TouchableOpacity
                style={styles.removeChip}
                onPress={() =>
                  dispatch(removeRecentSearch(search))
                }
              >
                <Text style={styles.removeChipText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTrendingSearches = () => (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          !isDarkMode && styles.lightSectionTitle,
        ]}
      >
        Trending Searches
      </Text>
      <View style={styles.trendingContainer}>
        {trendingSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.trendingChip,
              !isDarkMode && styles.lightTrendingChip,
            ]}
            onPress={() => handleQuickSearch(search)}
          >
            <Text
              style={[
                styles.trendingChipText,
                !isDarkMode && styles.lightTrendingChipText,
              ]}
            >
              {search}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const clearSearch = () => {
    dispatch(clearSearchQuery());
    dispatch(clearSearchResults());
    loadDefaultContent(searchType);
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
        backgroundColor={isDarkMode ? '#0d1117' : '#fcfbfbff'}
      />
      <View
        style={[
          styles.searchHeader,
          !isDarkMode && styles.lightSearchHeader,
        ]}
      >
        <View
          style={[
            styles.searchInputContainer,
            !isDarkMode && styles.lightSearchInputContainer,
          ]}
        >
          <Text
            style={[
              styles.searchIcon,
              !isDarkMode && styles.lightSearchIcon,
            ]}
          >
            🔍
          </Text>
          <TextInput
            style={[
              styles.searchInput,
              !isDarkMode && styles.lightSearchInput,
            ]}
            placeholder="Search movies, TV shows, people..."
            placeholderTextColor={isDarkMode ? '#6e7681' : '#9ca3af'}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderSearchFilters()}

      <View style={styles.content}>
        {searchQuery.trim() === '' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderRecentSearches()}
            {renderTrendingSearches()}
            <View style={styles.sectionContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  !isDarkMode && styles.lightSectionTitle,
                ]}
              >
                {searchType === 'all'
                  ? 'Popular Content'
                  : searchType === 'movie'
                  ? 'Popular Movies'
                  : searchType === 'tv'
                  ? 'Popular TV Shows'
                  : 'Popular People'}
              </Text>
              {defaultLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#e50914" />
                  <Text style={styles.loadingText}>
                    Loading content...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={defaultContent.slice(0, 20)}
                  renderItem={renderSearchResult}
                  keyExtractor={(item, index) =>
                    `default-${item.id}-${index}`
                  }
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.resultsContainer}>
            {searchLoading && searchResults.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e50914" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{searchError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => performSearch(searchQuery)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    styles.emptyText,
                    !isDarkMode && styles.lightEmptyText,
                  ]}
                >
                  No results found for "{searchQuery}"
                </Text>
                <Text
                  style={[
                    styles.emptySubtext,
                    !isDarkMode && styles.lightEmptySubtext,
                  ]}
                >
                  Try different keywords or check spelling
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.resultsCount,
                    !isDarkMode && styles.lightResultsCount,
                  ]}
                >
                  {totalResults.toLocaleString()} results found
                </Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item, index) =>
                    `${item.id}-${index}`
                  }
                  showsVerticalScrollIndicator={false}
                  onEndReached={loadMoreResults}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={() => {
                    if (isLoadingMore) {
                      return (
                        <View style={styles.loadMoreContainer}>
                          <ActivityIndicator
                            size="small"
                            color="#e50914"
                          />
                          <Text style={styles.loadMoreText}>
                            Loading more...
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  }}
                />
              </>
            )}
          </View>
        )}
      </View>
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

  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#0d1117',
  },
  lightSearchHeader: {
    backgroundColor: '#ffffff',
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lightSearchInputContainer: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#8b949e',
  },
  lightSearchIcon: {
    color: '#6b7280',
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f0f6fc',
    paddingVertical: 12,
  },
  lightSearchInput: {
    color: '#111827',
  },

  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#6e7681',
    fontWeight: 'bold',
  },

  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#21262d',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lightFilterButton: {
    backgroundColor: '#e5e7eb',
    borderColor: '#e5e7eb',
  },

  activeFilterButton: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  lightActiveFilterButton: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },

  filterText: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '500',
  },
  lightFilterText: {
    color: '#4b5563',
  },

  activeFilterText: {
    color: '#ffffff',
  },
  lightActiveFilterText: {
    color: '#ffffff',
  },

  content: {
    flex: 1,
  },

  sectionContainer: {
    padding: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0f6fc',
  },
  lightSectionTitle: {
    color: '#111827',
  },

  clearAllText: {
    color: '#e50914',
    fontSize: 13,
    fontWeight: '500',
  },

  searchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262d',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lightSearchChip: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
  },

  searchChipText: {
    color: '#f0f6fc',
    fontSize: 14,
    marginRight: 4,
  },
  lightSearchChipText: {
    color: '#111827',
  },

  removeChip: {
    marginLeft: 4,
  },
  removeChipText: {
    color: '#6e7681',
    fontSize: 16,
    fontWeight: 'bold',
  },

  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  trendingChip: {
    backgroundColor: '#30363d',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  lightTrendingChip: {
    backgroundColor: '#e5e7eb',
  },

  trendingChipText: {
    color: '#8b949e',
    fontSize: 14,
  },
  lightTrendingChipText: {
    color: '#374151',
  },

  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  resultsCount: {
    color: '#8b949e',
    fontSize: 14,
    marginBottom: 16,
  },
  lightResultsCount: {
    color: '#4b5563',
  },

  resultItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lightResultItem: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },

  resultImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#30363d',
  },

  personImage: {
    height: 80,
    borderRadius: 40,
  },

  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'flex-start',
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f0f6fc',
    marginBottom: 4,
  },
  lightResultTitle: {
    color: '#111827',
  },

  resultSubtitle: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 4,
  },
  lightResultSubtitle: {
    color: '#6b7280',
  },

  resultRating: {
    fontSize: 14,
    color: '#ffd700',
    marginBottom: 6,
  },

  resultOverview: {
    fontSize: 13,
    color: '#8b949e',
    lineHeight: 18,
    marginBottom: 8,
  },
  lightResultOverview: {
    color: '#4b5563',
  },

  resultMeta: {
    flexDirection: 'row',
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  loadingText: {
    color: '#8b949e',
    marginTop: 16,
    fontSize: 16,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  errorText: {
    color: '#f85149',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  emptyText: {
    color: '#f0f6fc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lightEmptyText: {
    color: '#111827',
  },

  emptySubtext: {
    color: '#8b949e',
    fontSize: 14,
    textAlign: 'center',
  },
  lightEmptySubtext: {
    color: '#6b7280',
  },

  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadMoreText: {
    color: '#8b949e',
    marginLeft: 8,
  },
});

export default SearchScreen;
