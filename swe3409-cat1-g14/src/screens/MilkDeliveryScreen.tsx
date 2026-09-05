import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import CustomHeader from '../components/CustomHeader';
import { sendMilkDeliveryAssessment } from '../api';
import { useTheme } from '../ThemeContext.tsx';

export default function MilkDeliveryScreen({
  navigation,
}: {
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [farmerId, setFarmerId] = useState('');
  const [litres, setLitres] = useState('');
  const [temperature, setTemperature] = useState('');
  const [minutes, setMinutes] = useState('');

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    farmer_id: string;
    litres: number;
    risk_probability: number | null;
    label: 'Low' | 'Medium' | 'High' | 'Not checked';
    recommendation: string;
  } | null>(null);

  const validateAndSubmit = async () => {
    if (!farmerId.trim()) {
      Alert.alert(
        'Farmer ID Required',
        'Please enter a valid Farmer ID, for example FRM-0012.',
      );
      return;
    }

    const numLitres = parseFloat(litres);

    if (isNaN(numLitres) || numLitres <= 0) {
      Alert.alert(
        'Invalid Milk Quantity',
        'Milk quantity must be greater than 0 litres.',
      );
      return;
    }

    const numTemp = parseFloat(temperature);

    if (isNaN(numTemp)) {
      Alert.alert(
        'Temperature Required',
        'Please enter a valid milk temperature.',
      );
      return;
    }

    if (numTemp < 0) {
      Alert.alert(
        'Invalid Temperature',
        'Milk temperature cannot be negative. Please check the thermometer reading.',
      );
      return;
    }

    if (numTemp > 45) {
      Alert.alert(
        'Invalid Temperature',
        'Milk temperature cannot exceed 45°C under normal collection conditions.',
      );
      return;
    }

    const numMinutes = parseFloat(minutes);

    if (isNaN(numMinutes) || numMinutes < 0) {
      Alert.alert(
        'Invalid Time',
        'Please enter a valid number of minutes since milking.',
      );
      return;
    }

    const hoursSinceMilking = numMinutes / 60;

    setLoading(true);
    setResult(null);

    try {
      const apiResponse = await sendMilkDeliveryAssessment({
        farmer_id: farmerId.trim(),
        litres: numLitres,
        temperature: numTemp,
        hours_since_milking: hoursSinceMilking,
      });

      setResult(apiResponse);
    } catch (error) {
      Alert.alert(
        'Connection Notice',
        'The AI service could not be reached. The delivery has been kept using the available offline fallback.',
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = () => {
    if (!result) return theme.success;
    if (result.label === 'High') return theme.danger;
    if (result.label === 'Medium') return theme.warning;
    if (result.label === 'Low') return theme.success;
    return theme.neutral;
  };

  const getRiskBackground = () => {
    if (!result) return theme.successBg;
    if (result.label === 'High') return theme.dangerBg;
    if (result.label === 'Medium') return theme.warningBg;
    if (result.label === 'Low') return theme.successBg;
    return theme.neutralBg;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bg, paddingTop: insets.top },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <CustomHeader
          title="New Milk Delivery"
          subtitle="Rwanda Collection Centre"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introContainer}>
            <View
              style={[styles.introIcon, { backgroundColor: theme.primarySoft }]}
            >
              <Text style={styles.introIconText}>🥛</Text>
            </View>

            <View style={styles.introTextContainer}>
              <Text style={[styles.pageTitle, { color: theme.text }]}>
                Record Milk Delivery
              </Text>
              <Text style={[styles.pageDescription, { color: theme.textMuted }]}>
                Enter the delivery information below to check its rejection
                risk.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <View style={styles.cardHeading}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Delivery Information
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                All fields are required
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                FARMER ID
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[styles.inputWithIcon, { color: theme.text }]}
                  placeholder="e.g. FRM-0012"
                  placeholderTextColor={theme.textMuted}
                  value={farmerId}
                  onChangeText={setFarmerId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                Enter the identification number of the farmer.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                MILK VOLUME
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>🥛</Text>
                <TextInput
                  style={[styles.inputWithIcon, { color: theme.text }]}
                  placeholder="e.g. 25"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="decimal-pad"
                  value={litres}
                  onChangeText={setLitres}
                />
                <Text style={[styles.inputUnit, { color: theme.textMuted }]}>
                  L
                </Text>
              </View>
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                Enter the amount of milk received.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                MILK TEMPERATURE
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>🌡️</Text>
                <TextInput
                  style={[styles.inputWithIcon, { color: theme.text }]}
                  placeholder="e.g. 18.5"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="decimal-pad"
                  value={temperature}
                  onChangeText={setTemperature}
                />
                <Text style={[styles.inputUnit, { color: theme.textMuted }]}>
                  °C
                </Text>
              </View>
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                Enter the temperature shown on the thermometer.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                TIME SINCE MILKING
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>⏱️</Text>
                <TextInput
                  style={[styles.inputWithIcon, { color: theme.text }]}
                  placeholder="e.g. 90"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                  value={minutes}
                  onChangeText={setMinutes}
                />
                <Text style={[styles.inputUnit, { color: theme.textMuted }]}>
                  min
                </Text>
              </View>
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                Enter the number of minutes since the milk was collected.
              </Text>
            </View>

            <TouchableOpacity
              onPress={validateAndSubmit}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.submitWrapper}
            >
              <LinearGradient
                colors={theme.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.submitButton,
                  loading && styles.disabledButton,
                ]}
              >
                {loading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator color={theme.textInverse} size="small" />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: theme.textInverse },
                      ]}
                    >
                      Checking milk risk...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text
                      style={[
                        styles.submitButtonText,
                        { color: theme.textInverse },
                      ]}
                    >
                      Check Milk Risk
                    </Text>
                    <Text
                      style={[
                        styles.buttonArrow,
                        { color: theme.textInverse },
                      ]}
                    >
                      →
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {result && (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                },
                result.label === 'High'
                  ? { borderColor: theme.danger }
                  : result.label === 'Medium'
                  ? { borderColor: theme.warning }
                  : result.label === 'Low'
                  ? { borderColor: theme.success }
                  : { borderColor: theme.border },
              ]}
            >
              <View style={styles.resultTopRow}>
                <View>
                  <Text
                    style={[styles.resultEyebrow, { color: theme.textMuted }]}
                  >
                    ASSESSMENT COMPLETE
                  </Text>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>
                    Milk Risk Assessment
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getRiskColor() },
                  ]}
                />
              </View>

              <View
                style={[
                  styles.riskHero,
                  { backgroundColor: getRiskBackground() },
                ]}
              >
                <Text style={[styles.riskCaption, { color: theme.textMuted }]}>
                  REJECTION RISK
                </Text>
                <Text
                  style={[styles.riskLabel, { color: getRiskColor() }]}
                >
                  {result.label.toUpperCase()}
                </Text>
                <Text
                  style={[styles.riskPercentage, { color: theme.textMuted }]}
                >
                  {result.risk_probability === null
                    ? '—'
                    : `${(result.risk_probability * 100).toFixed(1)}%`}
                </Text>
                <Text
                  style={[styles.riskExplanation, { color: theme.textMuted }]}
                >
                  {result.risk_probability === null
                    ? 'Risk could not be checked'
                    : 'Estimated probability of rejection'}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={[styles.detailsTitle, { color: theme.text }]}>
                  Delivery Details
                </Text>
                <View
                  style={[
                    styles.resultRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Text
                    style={[styles.resultLabel, { color: theme.textMuted }]}
                  >
                    Farmer ID
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.text }]}>
                    {result.farmer_id}
                  </Text>
                </View>
                <View
                  style={[
                    styles.resultRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Text
                    style={[styles.resultLabel, { color: theme.textMuted }]}
                  >
                    Milk Volume
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.text }]}>
                    {result.litres} L
                  </Text>
                </View>
                <View
                  style={[
                    styles.resultRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Text
                    style={[styles.resultLabel, { color: theme.textMuted }]}
                  >
                    Risk Category
                  </Text>
                  <Text
                    style={[styles.resultValueBold, { color: getRiskColor() }]}
                  >
                    {result.label} Risk
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.recommendationBox,
                  {
                    backgroundColor: theme.cardAlt,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.recommendationHeader}>
                  <Text
                    style={[
                      styles.recommendationIcon,
                      {
                        backgroundColor: theme.primarySoft,
                        color: theme.primary,
                      },
                    ]}
                  >
                    ✓
                  </Text>
                  <Text
                    style={[
                      styles.recommendationTitle,
                      { color: theme.textMuted },
                    ]}
                  >
                    SYSTEM RECOMMENDATION
                  </Text>
                </View>
                <Text
                  style={[styles.recommendationText, { color: theme.text }]}
                >
                  {result.recommendation}
                </Text>
              </View>

              <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
                This is a decision-support estimate. It does not replace
                official laboratory testing.
              </Text>
            </View>
          )}

          {!result && (
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: theme.cardAlt,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor: theme.primarySoft,
                    color: theme.primary,
                  },
                ]}
              >
                ℹ
              </Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>
                  How the assessment works
                </Text>
                <Text style={[styles.infoText, { color: theme.textMuted }]}>
                  The system uses the milk temperature and time since milking
                  to estimate the likelihood of rejection.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  formScroll: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 42,
  },
  introContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  introIconText: {
    fontSize: 25,
  },
  introTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 3,
  },
  pageDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeading: {
    marginBottom: 23,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 19,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
  },
  inputIcon: {
    fontSize: 18,
    width: 30,
    textAlign: 'center',
    marginRight: 7,
  },
  inputWithIcon: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  submitWrapper: {
    marginTop: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#218A57',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  buttonArrow: {
    fontSize: 22,
    fontWeight: '500',
    marginLeft: 10,
    marginTop: -2,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 9,
  },
  resultCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  resultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  resultEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
  },
  riskHero: {
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  riskCaption: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  riskLabel: {
    fontSize: 29,
    fontWeight: '900',
    marginBottom: 1,
  },
  riskPercentage: {
    fontSize: 19,
    fontWeight: '800',
  },
  riskExplanation: {
    fontSize: 11,
    marginTop: 3,
  },
  detailsSection: {
    marginBottom: 3,
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  resultRow: {
    minHeight: 39,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  resultLabel: {
    fontSize: 13,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultValueBold: {
    fontSize: 14,
    fontWeight: '800',
  },
  recommendationBox: {
    borderRadius: 14,
    padding: 15,
    marginTop: 17,
    borderWidth: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  recommendationIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 21,
    marginRight: 7,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 15,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 17,
  },
});