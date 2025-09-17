import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WaterReport() {
  const [formData, setFormData] = useState({
    location_name: '',
    district: '',
    water_source: '',
    collection_date: new Date().toISOString().split('T')[0],
    collection_time: new Date().toTimeString().split(' ')[0],
    collector_name: '',
    collector_id: '',
    phone_number: '',
    ph_level: '',
    turbidity: '',
    chlorine: '',
    e_coli: '',
    total_coliform: '',
    tds: '',
    latitude: null,
    longitude: null
  });

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDistricts();
    getCurrentLocation();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/districts`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }));
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['location_name', 'district', 'water_source', 'collector_name', 'phone_number'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        collection_date: new Date(formData.collection_date + 'T' + formData.collection_time).toISOString(),
        ph_level: formData.ph_level ? parseFloat(formData.ph_level) : null,
        turbidity: formData.turbidity ? parseFloat(formData.turbidity) : null,
        chlorine: formData.chlorine ? parseFloat(formData.chlorine) : null,
        e_coli: formData.e_coli ? parseInt(formData.e_coli) : null,
        total_coliform: formData.total_coliform ? parseInt(formData.total_coliform) : null,
        tds: formData.tds ? parseFloat(formData.tds) : null,
      };

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/water-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Water quality report submitted successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="water" size={24} color="#2196F3" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Water Quality Report</Text>
              <Text style={styles.headerSubtitle}>Submit water testing data</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Location Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#333" />
              <Text style={styles.sectionTitle}>Location Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location/Area Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Khadakwasla Dam Area, Village Well, Water Treatment Plant"
                value={formData.location_name}
                onChangeText={(text) => setFormData({...formData, location_name: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>District *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.district}
                    onValueChange={(value) => setFormData({...formData, district: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select District" value="" />
                    {districts.map((district, index) => (
                      <Picker.Item 
                        key={index} 
                        label={`${district.name}, ${district.state}`} 
                        value={district.name} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Water Source *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.water_source}
                    onValueChange={(value) => setFormData({...formData, water_source: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Source" value="" />
                    <Picker.Item label="Borewell" value="borewell" />
                    <Picker.Item label="River" value="river" />
                    <Picker.Item label="Lake" value="lake" />
                    <Picker.Item label="Pond" value="pond" />
                    <Picker.Item label="Well" value="well" />
                    <Picker.Item label="Tap Water" value="tap" />
                    <Picker.Item label="Spring" value="spring" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Sample Collection Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#333" />
              <Text style={styles.sectionTitle}>Sample Collection Details</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Collection Date *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.collection_date}
                  onChangeText={(text) => setFormData({...formData, collection_date: text})}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Collection Time</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.collection_time}
                  onChangeText={(text) => setFormData({...formData, collection_time: text})}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Collector Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Full name of the person collecting the sample"
                value={formData.collector_name}
                onChangeText={(text) => setFormData({...formData, collector_name: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Collector ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Employee/Official ID"
                  value={formData.collector_id}
                  onChangeText={(text) => setFormData({...formData, collector_id: text})}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact number"
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData({...formData, phone_number: text})}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Testing Parameters */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flask" size={20} color="#333" />
              <Text style={styles.sectionTitle}>Testing Parameters</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>pH Level</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 7.2"
                  value={formData.ph_level}
                  onChangeText={(text) => setFormData({...formData, ph_level: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Turbidity (NTU)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 2.5"
                  value={formData.turbidity}
                  onChangeText={(text) => setFormData({...formData, turbidity: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Chlorine (mg/L)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 0.5"
                  value={formData.chlorine}
                  onChangeText={(text) => setFormData({...formData, chlorine: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>E. Coli (CFU/100ml)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 0"
                  value={formData.e_coli}
                  onChangeText={(text) => setFormData({...formData, e_coli: text})}
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Total Coliform</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="CFU/100ml"
                  value={formData.total_coliform}
                  onChangeText={(text) => setFormData({...formData, total_coliform: text})}
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>TDS (mg/L)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Total Dissolved Solids"
                  value={formData.tds}
                  onChangeText={(text) => setFormData({...formData, tds: text})}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Water Quality Report'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.submitNote}>
              * Required fields. All data will be reviewed by health authorities.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroupHalf: {
    flex: 0.48,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  submitSection: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});