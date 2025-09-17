import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SelectReport() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Report Type</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Choose the type of report you want to submit</Text>

          {/* Water Quality Report Option */}
          <TouchableOpacity 
            style={styles.reportOption}
            onPress={() => router.push('/water-report')}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.optionIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="water" size={32} color="white" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Water Quality Report</Text>
                <Text style={styles.optionSubtitle}>Submit water testing data and quality assessments</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            
            <View style={styles.optionDetails}>
              <Text style={styles.optionDescription}>
                Report water quality testing results, contamination issues, or water source problems in your area.
              </Text>
              
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Location & water source details</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Sample collection information</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Testing parameters (pH, turbidity, etc.)</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Patient Report Option */}
          <TouchableOpacity 
            style={styles.reportOption}
            onPress={() => router.push('/patient-report')}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.optionIcon, { backgroundColor: '#F44336' }]}>
                <Ionicons name="medical" size={32} color="white" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Patient Report</Text>
                <Text style={styles.optionSubtitle}>Report waterborne disease cases and health issues</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            
            <View style={styles.optionDetails}>
              <Text style={styles.optionDescription}>
                Report suspected waterborne disease cases, symptoms, and health emergencies related to contaminated water.
              </Text>
              
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Patient information & symptoms</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Disease identification & water source</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>Emergency health alert system</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Emergency Note */}
          <View style={styles.emergencyNote}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="warning" size={20} color="#FF9800" />
              <Text style={styles.emergencyTitle}>Emergency Situations</Text>
            </View>
            <Text style={styles.emergencyText}>
              For immediate health emergencies, please contact your local health center or emergency services first, then submit a report for documentation.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  reportOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureList: {
    // marginLeft: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  emergencyNote: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginTop: 8,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
});