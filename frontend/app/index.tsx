import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Tab components
const HomeTab = ({ mapLocations }: { mapLocations: any[] }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVGiB7ZpNaBNBFMd/s7vZJE2TNrGJH1hbW6utYhsQFQ9ePHjw4MWbJ0/ePHny5M2bFw9ePHjx4sGbFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWL' }}
          style={styles.governmentLogo}
        />
        <View style={styles.headerText}>
          <Text style={styles.appTitle}>Jal Drishti</Text>
          <Text style={styles.appSubtitle}>Volunteer App</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="call-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations, reports, or alerts..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          style={styles.map}
          source={{
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                    body { margin: 0; padding: 0; }
                    #map { height: 100vh; width: 100vw; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    const map = L.map('map').setView([${location?.coords.latitude || 25.4670}, ${location?.coords.longitude || 91.3662}], 10);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                    
                    // Add sample markers for North East India water monitoring
                    const locations = [
                        {lat: 25.4670, lng: 91.3662, title: "Mawsynram", status: "processed"},
                        {lat: 25.5788, lng: 91.8933, title: "Mawjymbuin Caves", status: "under_review"},
                        {lat: 25.4500, lng: 91.4000, title: "Hardware House", status: "submitted"},
                        {lat: 25.5000, lng: 91.5000, title: "Emily And Sankrita Homes", status: "high_priority"},
                        {lat: 25.3500, lng: 91.6000, title: "Nan Bah Meston", status: "processed"}
                    ];
                    
                    locations.forEach(loc => {
                        const color = loc.status === 'high_priority' ? 'red' : 
                                    loc.status === 'under_review' ? 'orange' : 
                                    loc.status === 'processed' ? 'green' : 'blue';
                        
                        L.circleMarker([loc.lat, loc.lng], {
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.7,
                            radius: 8
                        }).addTo(map)
                        .bindPopup(\`<b>\${loc.title}</b><br>Status: \${loc.status}\`);
                    });
                </script>
            </body>
            </html>
            `
          }}
        />
        
        {/* Location Info Card */}
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>Mawsynram</Text>
          <Text style={styles.locationSubtitle}>Meghalaya 793113</Text>
          <TouchableOpacity>
            <Text style={styles.viewLargerMap}>View larger map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ReportsTab = ({ reportStats, recentActivity }: { reportStats: any, recentActivity: any[] }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.reportsHeader}>
        <Image 
          source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVGiB7ZpNaBNBFMd/s7vZJE2TNrGJH1hbW6utYhsQFQ9ePHjw4MWbJ0/ePHny5M2bFw9ePHjx4sGbFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWL' }}
          style={styles.governmentLogoSmall}
        />
        <View>
          <Text style={styles.reportsTitle}>Report Management</Text>
          <Text style={styles.reportsSubtitle}>Submit and manage water quality reports</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.submitButton} onPress={() => router.push('/select-report')}>
          <View style={styles.submitButtonContent}>
            <View style={styles.submitButtonIcon}>
              <Ionicons name="add" size={24} color="white" />
            </View>
            <View style={styles.submitButtonText}>
              <Text style={styles.submitButtonTitle}>Submit New Report</Text>
              <Text style={styles.submitButtonSubtitle}>Submit water testing data and quality assessments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Report Overview */}
      <View style={styles.reportOverview}>
        <Text style={styles.sectionTitle}>Report Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reportStats?.total_submitted || 12}</Text>
            <Text style={styles.statLabel}>Reports Submitted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{reportStats?.total_processed || 8}</Text>
            <Text style={styles.statLabel}>Reports Processed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{reportStats?.under_review || 3}</Text>
            <Text style={styles.statLabel}>Under Review</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{reportStats?.high_priority || 1}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: activity.type === 'water_report' ? '#4CAF50' : '#2196F3' }]}>
              <Ionicons 
                name={activity.type === 'water_report' ? 'water' : 'medical'} 
                size={16} 
                color="white" 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityLocation}>{activity.location} - 2 hours ago</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const EducationTab = () => {
  const educationVideos = [
    {
      title: "Water Quality Testing at Home",
      description: "Learn simple methods to test water quality at home using basic tools and visual inspection techniques.",
      target: "General Public",
      category: "Testing",
      level: "Beginner",
      duration: "8:45"
    },
    {
      title: "Waterborne Disease Prevention",
      description: "Essential practices for preventing waterborne diseases in rural communities.",
      target: "Health Workers",
      category: "Prevention", 
      level: "Intermediate",
      duration: "12:30"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.educationHeader}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.educationTitle}>Education Modules</Text>
      </View>

      {/* Video Section */}
      <View style={styles.videoSection}>
        <View style={styles.videoSectionHeader}>
          <Ionicons name="play-circle" size={24} color="#2196F3" />
          <Text style={styles.videoSectionTitle}>Video Tutorials & Learning Resources</Text>
        </View>
        
        {educationVideos.map((video, index) => (
          <View key={index} style={styles.videoCard}>
            <View style={styles.videoThumbnail}>
              <View style={styles.videoThumbnailBg}>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#2196F3" />
                </TouchableOpacity>
              </View>
              <View style={styles.videoDuration}>
                <Text style={styles.videoDurationText}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.videoTags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{video.category}</Text>
                </View>
                <View style={[styles.tag, styles.levelTag]}>
                  <Text style={styles.tagText}>{video.level}</Text>
                </View>
              </View>
              <Text style={styles.videoDescription}>{video.description}</Text>
              <View style={styles.videoTarget}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={styles.videoTargetText}>Target: {video.target}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const QueryTab = ({ faqs }: { faqs: any[] }) => {
  const [activeTab, setActiveTab] = useState('FAQ');
  const [searchText, setSearchText] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.queryHeader}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.queryTitle}>Query</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'FAQ' && styles.activeTab]}
          onPress={() => setActiveTab('FAQ')}
        >
          <Ionicons name="help-circle" size={20} color={activeTab === 'FAQ' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'FAQ' && styles.activeTabText]}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Submit' && styles.activeTab]}
          onPress={() => setActiveTab('Submit')}
        >
          <Ionicons name="chatbubble" size={20} color={activeTab === 'Submit' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'Submit' && styles.activeTabText]}>Submit Query</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'FAQ' && (
        <View style={styles.faqContainer}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search frequently asked questions..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>

          {/* FAQ List */}
          <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>
          <ScrollView style={styles.faqList}>
            {filteredFaqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <TouchableOpacity style={styles.faqToggle}>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {activeTab === 'Submit' && (
        <View style={styles.submitQueryContainer}>
          <Text style={styles.submitQueryTitle}>Submit Your Query</Text>
          <Text style={styles.submitQueryDescription}>
            Have a question about water quality or health concerns? Submit your query and our experts will respond.
          </Text>
          {/* Add submit query form here */}
        </View>
      )}
    </View>
  );
};

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [reportStats, setReportStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch report stats
      const statsResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/report-stats`);
      const statsData = await statsResponse.json();
      setReportStats(statsData);

      // Fetch recent activity
      const activityResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/recent-activity`);
      const activityData = await activityResponse.json();
      setRecentActivity(activityData);

      // Fetch map locations
      const locationsResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/map-locations`);
      const locationsData = await locationsResponse.json();
      setMapLocations(locationsData);

      // Fetch FAQs
      const faqsResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/faqs`);
      const faqsData = await faqsResponse.json();
      setFaqs(faqsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeTab mapLocations={mapLocations} />;
      case 'Reports':
        return <ReportsTab reportStats={reportStats} recentActivity={recentActivity} />;
      case 'Education':
        return <EducationTab />;
      case 'Query':
        return <QueryTab faqs={faqs} />;
      default:
        return <HomeTab mapLocations={mapLocations} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {renderActiveTab()}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]}
          onPress={() => setActiveTab('Home')}
        >
          <Ionicons 
            name={activeTab === 'Home' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'Home' ? '#2196F3' : '#666'} 
          />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Reports' && styles.activeNavItem]}
          onPress={() => setActiveTab('Reports')}
        >
          <Ionicons 
            name={activeTab === 'Reports' ? 'document-text' : 'document-text-outline'} 
            size={24} 
            color={activeTab === 'Reports' ? '#2196F3' : '#666'} 
          />
          <Text style={[styles.navText, activeTab === 'Reports' && styles.activeNavText]}>Reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Education' && styles.activeNavItem]}
          onPress={() => setActiveTab('Education')}
        >
          <Ionicons 
            name={activeTab === 'Education' ? 'school' : 'school-outline'} 
            size={24} 
            color={activeTab === 'Education' ? '#2196F3' : '#666'} 
          />
          <Text style={[styles.navText, activeTab === 'Education' && styles.activeNavText]}>Education</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Query' && styles.activeNavItem]}
          onPress={() => setActiveTab('Query')}
        >
          <Ionicons 
            name={activeTab === 'Query' ? 'chatbubbles' : 'chatbubbles-outline'} 
            size={24} 
            color={activeTab === 'Query' ? '#2196F3' : '#666'} 
          />
          <Text style={[styles.navText, activeTab === 'Query' && styles.activeNavText]}>Query</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  governmentLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#FFA500',
    borderRadius: 8,
  },
  governmentLogoSmall: {
    width: 32,
    height: 32,
    backgroundColor: '#FFA500',
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  
  // Map Styles
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locationCard: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  viewLargerMap: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
  
  // Reports Styles
  reportsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  reportsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  submitButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submitButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  
  // Stats Styles
  reportOverview: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Activity Styles
  recentActivity: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Education Styles
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  educationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  videoSection: {
    padding: 16,
  },
  videoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnail: {
    height: 180,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoThumbnailBg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 12,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  videoTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelTag: {
    backgroundColor: '#e8f5e8',
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  videoTarget: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTargetText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  
  // Query Styles
  queryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  queryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  faqContainer: {
    flex: 1,
    padding: 16,
  },
  faqSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  faqList: {
    flex: 1,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  faqToggle: {
    marginLeft: 12,
  },
  submitQueryContainer: {
    padding: 16,
  },
  submitQueryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  submitQueryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Bottom Navigation Styles
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Add any active styles here
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});