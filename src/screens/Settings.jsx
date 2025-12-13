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
  Image,
  Dimensions,
  Modal,
  TextInput
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

  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState('HD');
  const [dataUsage, setDataUsage] = useState('Auto');
  const [darkMode, setDarkMode] = useState(true);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || user?.username || 'User');

  const getUserDisplayName = () => {
    return user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
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
              Alert.alert('Error', 'An error occurred during logout. Please try again.');
            }
          },
        },
      ]
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
          }
        }
      ]
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
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Text style={styles.arrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileContainer}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {getUserDisplayName().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {getUserDisplayName()}
              </Text>
              <Text style={styles.profileEmail}>
                {getUserEmail()}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
        <SectionHeader title="Account" />
        <View style={styles.section}>
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
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
          />
          <SettingItem
            icon="💳"
            title="Subscription & Billing"
            subtitle="Manage your subscription"
            onPress={() => Alert.alert('Billing', 'Billing management coming soon!')}
          />
        </View>
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#30363d', true: '#e50914' }}
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
                trackColor={{ false: '#30363d', true: '#e50914' }}
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
                { text: 'Standard', onPress: () => setDownloadQuality('Standard') },
                { text: 'HD', onPress: () => setDownloadQuality('HD') },
                { text: 'Ultra HD', onPress: () => setDownloadQuality('Ultra HD') }
              ]);
            }}
          />
          <SettingItem
            icon="📊"
            title="Data Usage"
            subtitle={`${dataUsage} - Save data when streaming`}
            onPress={() => {
              Alert.alert('Data Usage', 'Choose data usage', [
                { text: 'Auto', onPress: () => setDataUsage('Auto') },
                { text: 'Low', onPress: () => setDataUsage('Low') },
                { text: 'High', onPress: () => setDataUsage('High') }
              ]);
            }}
          />
        </View>
        <SectionHeader title="App Settings" />
        <View style={styles.section}>
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Always enabled for better experience"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#30363d', true: '#e50914' }}
                thumbColor={darkMode ? '#ffffff' : '#8b949e'}
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
            onPress={() => Alert.alert('App Info', 'CineFlix v1.0.0\nBuilt with React Native')}
          />
        </View>
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            icon="❓"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => Alert.alert('Help', 'Help center coming soon!')}
          />
          <SettingItem
            icon="💬"
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() => Alert.alert('Contact', 'Contact support coming soon!')}
          />
          <SettingItem
            icon="ℹ️"
            title="About CineFlix"
            subtitle="App info and credits"
            onPress={() => setShowAboutModal(true)}
          />
        </View>
        <SectionHeader title="Danger Zone" />
        <View style={styles.section}>
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
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={styles.modalAvatarContainer}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {editName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#8b949e"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={getUserEmail()}
                editable={false}
                placeholderTextColor="#8b949e"
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
                  Alert.alert('Success', 'Profile updated successfully!');
                  setShowProfileModal(false);
                }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.aboutModalContainer}>
            <Text style={styles.aboutTitle}>CineFlix</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Your ultimate streaming companion for movies and TV series. 
              Built with React Native and powered by TMDB API.
            </Text>
            <View style={styles.aboutFeatures}>
              <Text style={styles.featureTitle}>Features:</Text>
              <Text style={styles.featureItem}>• Browse trending movies and TV series</Text>
              <Text style={styles.featureItem}>• Detailed information and ratings</Text>
              <Text style={styles.featureItem}>• Personal watchlist management</Text>
              <Text style={styles.featureItem}>• Dark mode interface</Text>
              <Text style={styles.featureItem}>• Seamless navigation</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
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
  profileEmail: {
    color: '#8b949e',
    fontSize: 14,
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
  section: {
    marginHorizontal: 20,
    backgroundColor: '#21262d',
    borderRadius: 12,
    overflow: 'hidden',
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
  settingSubtitle: {
    color: '#8b949e',
    fontSize: 13,
    marginTop: 2,
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
  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
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
