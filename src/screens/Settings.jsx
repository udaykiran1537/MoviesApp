import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Switch,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearStoredAuth } from '../redux/slices/authSlice';
import { resetMoviesState } from '../redux/slices/movieSlice';
import { resetSeriesState } from '../redux/slices/seriesSlice';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

const Settings = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector(state => state.theme);

  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState('HD');
  const [dataUsage, setDataUsage] = useState('Auto');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [editName, setEditName] = useState(
    user?.displayName || user?.username || 'User',
  );

  const getUserDisplayName = () => {
    return (
      user?.displayName ||
      user?.username ||
      user?.email?.split('@')[0] ||
      'User'
    );
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  useEffect(() => {
    setEditName(getUserDisplayName());
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              dispatch(clearStoredAuth());
              dispatch(resetMoviesState());
              dispatch(resetSeriesState());
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
              });
            } catch (error) {
              Alert.alert(
                'Error',
                'An error occurred during logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch(resetMoviesState());
            dispatch(resetSeriesState());
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion',
              'Please contact support to delete your account.',
            );
          },
        },
      ],
    );
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    showArrow = true,
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        !isDarkMode && styles.lightSettingItem,
      ]}
      onPress={onPress}
      disabled={!onPress && !showArrow}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text
            style={[
              styles.settingTitle,
              !isDarkMode && styles.lightSettingTitle,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                !isDarkMode && styles.lightSettingSubtitle,
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Text style={styles.arrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text
      style={[
        styles.sectionHeader,
        !isDarkMode && styles.lightSectionHeader,
      ]}
    >
      {title}
    </Text>
  );

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              !isDarkMode && styles.lightTitle,
            ]}
          >
            Settings
          </Text>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={[
              styles.profileContainer,
              !isDarkMode && styles.lightProfileContainer,
            ]}
            onPress={() => setShowProfileModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {getUserDisplayName().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  !isDarkMode && styles.lightProfileName,
                ]}
              >
                {getUserDisplayName()}
              </Text>
              <Text
                style={[
                  styles.profileEmail,
                  !isDarkMode && styles.lightProfileEmail,
                ]}
              >
                {getUserEmail()}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View
          style={[
            styles.section,
            !isDarkMode && styles.lightSection,
          ]}
        >
          <SettingItem
            icon="👤"
            title="Manage Profile"
            subtitle="Edit your personal information"
            onPress={() => setShowProfileModal(true)}
          />
          <SettingItem
            icon="🔒"
            title="Privacy & Security"
            subtitle="Password, security settings"
            onPress={() =>
              Alert.alert(
                'Privacy',
                'Privacy settings coming soon!',
              )
            }
          />
          <SettingItem
            icon="💳"
            title="Subscription & Billing"
            subtitle="Manage your subscription"
            onPress={() =>
              Alert.alert(
                'Billing',
                'Billing management coming soon!',
              )
            }
          />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View
          style={[
            styles.section,
            !isDarkMode && styles.lightSection,
          ]}
        >
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: '#30363d',
                  true: '#e50914',
                }}
                thumbColor={notifications ? '#ffffff' : '#8b949e'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="▶️"
            title="Auto-Play"
            subtitle="Auto-play next episode"
            rightComponent={
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{
                  false: '#30363d',
                  true: '#e50914',
                }}
                thumbColor={autoPlay ? '#ffffff' : '#8b949e'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="📱"
            title="Download Quality"
            subtitle={downloadQuality}
            onPress={() => {
              Alert.alert('Download Quality', 'Choose quality', [
                {
                  text: 'Standard',
                  onPress: () => setDownloadQuality('Standard'),
                },
                {
                  text: 'HD',
                  onPress: () => setDownloadQuality('HD'),
                },
                {
                  text: 'Ultra HD',
                  onPress: () =>
                    setDownloadQuality('Ultra HD'),
                },
              ]);
            }}
          />
          <SettingItem
            icon="📊"
            title="Data Usage"
            subtitle={`${dataUsage} - Save data when streaming`}
            onPress={() => {
              Alert.alert('Data Usage', 'Choose data usage', [
                {
                  text: 'Auto',
                  onPress: () => setDataUsage('Auto'),
                },
                {
                  text: 'Low',
                  onPress: () => setDataUsage('Low'),
                },
                {
                  text: 'High',
                  onPress: () => setDataUsage('High'),
                },
              ]);
            }}
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="App Settings" />
        <View
          style={[
            styles.section,
            !isDarkMode && styles.lightSection,
          ]}
        >
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle={
              isDarkMode
                ? 'Dark theme enabled'
                : 'Light theme enabled'
            }
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={() => dispatch(toggleDarkMode())}
                trackColor={{
                  false: '#30363d',
                  true: '#e50914',
                }}
                thumbColor={isDarkMode ? '#ffffff' : '#8b949e'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="🗂️"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
          <SettingItem
            icon="📱"
            title="App Version"
            subtitle="1.0.0 (Latest)"
            onPress={() =>
              Alert.alert(
                'App Info',
                'CineFlix v1.0.0\nBuilt with React Native',
              )
            }
          />
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View
          style={[
            styles.section,
            !isDarkMode && styles.lightSection,
          ]}
        >
          <SettingItem
            icon="❓"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() =>
              Alert.alert('Help', 'Help center coming soon!')
            }
          />
          <SettingItem
            icon="💬"
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() =>
              Alert.alert(
                'Contact',
                'Contact support coming soon!',
              )
            }
          />
          <SettingItem
            icon="ℹ️"
            title="About CineFlix"
            subtitle="App info and credits"
            onPress={() => setShowAboutModal(true)}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View
          style={[
            styles.section,
            !isDarkMode && styles.lightSection,
          ]}
        >
          <SettingItem
            icon="🚪"
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
          <SettingItem
            icon="🗑️"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              !isDarkMode && styles.lightModalContainer,
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                !isDarkMode && styles.lightModalTitle,
              ]}
            >
              Edit Profile
            </Text>
            <View style={styles.modalAvatarContainer}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {editName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  !isDarkMode && styles.lightTextInput,
                ]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={
                  isDarkMode ? '#8b949e' : '#9ca3af'
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.disabledInput,
                  !isDarkMode && styles.lightTextInput,
                ]}
                value={getUserEmail()}
                editable={false}
                placeholderTextColor={
                  isDarkMode ? '#8b949e' : '#9ca3af'
                }
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  Alert.alert(
                    'Success',
                    'Profile updated successfully!',
                  );
                  setShowProfileModal(false);
                }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aboutModalContainer,
              !isDarkMode && styles.lightAboutModalContainer,
            ]}
          >
            <Text style={styles.aboutTitle}>CineFlix</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text
              style={[
                styles.aboutDescription,
                !isDarkMode && styles.lightAboutDescription,
              ]}
            >
              Your ultimate streaming companion for movies and TV
              series. Built with React Native and powered by TMDB
              API.
            </Text>
            <View style={styles.aboutFeatures}>
              <Text style={styles.featureTitle}>Features:</Text>
              <Text style={styles.featureItem}>
                • Browse trending movies and TV series
              </Text>
              <Text style={styles.featureItem}>
                • Detailed information and ratings
              </Text>
              <Text style={styles.featureItem}>
                • Personal watchlist management
              </Text>
              <Text style={styles.featureItem}>
                • Dark mode interface
              </Text>
              <Text style={styles.featureItem}>
                • Seamless navigation
              </Text>
            </View>
            <TouchableOpacity
              style={styles.aboutCloseBtn}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.aboutCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },

  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  lightTitle: {
    color: '#111827',
  },

  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262d',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  lightProfileContainer: {
    backgroundColor: '#ffffff',
  },

  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lightProfileName: {
    color: '#111827',
  },

  profileEmail: {
    color: '#8b949e',
    fontSize: 14,
  },
  lightProfileEmail: {
    color: '#6b7280',
  },

  sectionHeader: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  lightSectionHeader: {
    color: '#6b7280',
  },

  section: {
    marginHorizontal: 20,
    backgroundColor: '#21262d',
    borderRadius: 12,
    overflow: 'hidden',
  },
  lightSection: {
    backgroundColor: '#ffffff',
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  lightSettingItem: {
    borderBottomColor: '#e5e7eb',
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },

  settingTextContainer: {
    flex: 1,
  },

  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  lightSettingTitle: {
    color: '#111827',
  },

  settingSubtitle: {
    color: '#8b949e',
    fontSize: 13,
    marginTop: 2,
  },
  lightSettingSubtitle: {
    color: '#6b7280',
  },

  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  arrow: {
    color: '#8b949e',
    fontSize: 20,
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: '#21262d',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  lightModalContainer: {
    backgroundColor: '#ffffff',
  },

  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  lightModalTitle: {
    color: '#111827',
  },

  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalAvatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  changePhotoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  changePhotoText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '600',
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  textInput: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lightTextInput: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#111827',
  },

  disabledInput: {
    opacity: 0.6,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    marginRight: 12,
  },

  cancelBtnText: {
    color: '#8b949e',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#e50914',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  aboutModalContainer: {
    backgroundColor: '#21262d',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  lightAboutModalContainer: {
    backgroundColor: '#ffffff',
  },

  aboutTitle: {
    color: '#e50914',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  aboutVersion: {
    color: '#8b949e',
    fontSize: 16,
    marginBottom: 20,
  },

  aboutDescription: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  lightAboutDescription: {
    color: '#111827',
  },

  aboutFeatures: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },

  featureTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  featureItem: {
    color: '#8b949e',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },

  aboutCloseBtn: {
    backgroundColor: '#e50914',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },

  aboutCloseBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 40,
  },
});

export default Settings;
