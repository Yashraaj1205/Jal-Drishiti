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

const SYMPTOMS = [
  'Diarrhea', 'Vomiting', 'Fever', 'Stomach cramps', 'Nausea',
  'Headache', 'Dehydration', 'Blood in stool', 'Persistent vomiting',
  'High fever', 'Abdominal pain', 'Loss of appetite'
];

const DISEASES = [
  'Cholera', 'Typhoid', 'Hepatitis A', 'Gastroenteritis', 'Dysentery',
  'Rotavirus infection', 'E. coli infection', 'Giardiasis', 'Cryptosporidiosis',
  'Other waterborne disease'
];

export default function PatientReport() {
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: '',
    location_name: '',
    district: '',
    symptoms: [],
    suspected_disease: '',
    water_source_used: '',
    reporter_name: '',
    reporter_phone: '',
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

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['patient_name', 'age', 'gender', 'location_name', 'district', 'suspected_disease', 'water_source_used', 'reporter_name', 'reporter_phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (formData.symptoms.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        age: parseInt(formData.age)
      };

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/patient-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Patient report submitted successfully', [
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
            <Ionicons name="medical" size={24} color="#F44336" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Patient Report</Text>
              <Text style={styles.headerSubtitle}>Report waterborne disease case</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Patient Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color="#333" />
              <Text style={styles.sectionTitle}>Patient Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Full name of the patient"
                value={formData.patient_name}
                onChangeText={(text) => setFormData({...formData, patient_name: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Age in years"
                  value={formData.age}
                  onChangeText={(text) => setFormData({...formData, age: text})}
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(value) => setFormData({...formData, gender: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

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
                placeholder="Patient's current location or residence"
                value={formData.location_name}
                onChangeText={(text) => setFormData({...formData, location_name: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
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
          </View>

          {/* Health Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={20} color="#333" />
              <Text style={styles.sectionTitle}>Health Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Symptoms *</Text>
              <Text style={styles.inputDescription}>Select all symptoms present:</Text>
              <View style={styles.symptomsContainer}>
                {SYMPTOMS.map((symptom, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.symptomChip,
                      formData.symptoms.includes(symptom) && styles.symptomChipSelected
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text style={[
                      styles.symptomChipText,
                      formData.symptoms.includes(symptom) && styles.symptomChipTextSelected
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Suspected Disease *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.suspected_disease}
                  onValueChange={(value) => setFormData({...formData, suspected_disease: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select suspected disease" value="" />
                  {DISEASES.map((disease, index) => (
                    <Picker.Item key={index} label={disease} value={disease} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Water Source Used *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.water_source_used}
                  onValueChange={(value) => setFormData({...formData, water_source_used: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select water source" value="" />
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

          {/* Reporter Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle" size={20} color="#333" />
              <Text style={styles.sectionTitle}>Reporter Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reporter Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Name of person reporting this case"
                value={formData.reporter_name}
                onChangeText={(text) => setFormData({...formData, reporter_name: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reporter Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contact number for follow-up"
                value={formData.reporter_phone}
                onChangeText={(text) => setFormData({...formData, reporter_phone: text})}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
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
                {loading ? 'Submitting...' : 'Submit Patient Report'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.submitNote}>
              * Required fields. This report will be immediately forwarded to health authorities for urgent action.
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
  inputDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
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
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  symptomChipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  symptomChipText: {
    fontSize: 14,
    color: '#333',
  },
  symptomChipTextSelected: {
    color: '#fff',
  },
  submitSection: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#F44336',
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