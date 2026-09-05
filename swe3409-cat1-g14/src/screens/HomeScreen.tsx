// src/screens/HomeScreen.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomHeader from '../components/CustomHeader';
import { useTheme } from '../ThemeContext.tsx';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bg, paddingTop: insets.top },
      ]}
    >
      <CustomHeader
        title="Milk Check Dashboard"
        subtitle="Rwanda Collection Centre Operations"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <View style={styles.hero}>
          <Image
            source={require('../../assets/hero-milk.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>DECISION SUPPORT</Text>
            <Text style={styles.heroTitle}>Milk Check</Text>
            <Text style={styles.heroSubtitle}>
              Early rejection risk for every delivery
            </Text>
          </View>
        </View>

        {/* System Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={[styles.statusTitle, { color: theme.textMuted }]}>
            System Status
          </Text>
          <Text style={[styles.statusText, { color: theme.success }]}>
            ● AI Model & Python API Connected
          </Text>
          <Text style={[styles.subtext, { color: theme.textMuted }]}>
            Ready for delivery risk evaluation and offline caching.
          </Text>
        </View>

        {/* Operations Section */}
        <Text style={[styles.sectionHeader, { color: theme.text }]}>
          Collection Operations
        </Text>

        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
          onPress={() => navigation.navigate('MilkDelivery')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/icon-delivery.png')}
            style={[styles.cardIcon, { backgroundColor: theme.primarySoft }]}
          />
          <View style={styles.cardContent}>
            <Text style={[styles.actionTitle, { color: theme.primary }]}>
              New Milk Delivery Assessment
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
              Input Farmer ID, volume (litres), temperature, and hours since
              milking to check early rejection risk.
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.primary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
          onPress={() => navigation.navigate('Chat')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/icon-chat.png')}
            style={[styles.cardIcon, { backgroundColor: theme.primarySoft }]}
          />
          <View style={styles.cardContent}>
            <Text style={[styles.actionTitle, { color: theme.primary }]}>
              AI Assistant Terminal
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
              Communicate directly with the backend AI model layer for general
              queries and insights.
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.primary }]}>→</Text>
        </TouchableOpacity>

        {/* Coursework Components */}
        <Text style={[styles.sectionHeader, { color: theme.text }]}>
          Coursework Components
        </Text>

        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
          onPress={() => navigation.navigate('AssignmentDemo')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/icon-demo.png')}
            style={[styles.cardIcon, { backgroundColor: theme.primarySoft }]}
          />
          <View style={styles.cardContent}>
            <Text style={[styles.actionTitle, { color: theme.primary }]}>
              Assignment Demo
            </Text>
            <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
              Server status banner, validated delivery form, and today's list
              with totals (M1–M5 components working together).
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.primary }]}>→</Text>
        </TouchableOpacity>

        {/* Project Context Summary */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.cardAlt, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            About Milk Check System
          </Text>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            A decision-support system designed for milk collectors to estimate
            rejection probabilities (Low, Medium, High) early, reducing
            spoilage before laboratory testing.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },

  /* Hero banner — the image and overlay are identical in both themes */
  hero: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#173B2A',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 42, 30, 0.42)',
  },
  heroContent: {
    padding: 16,
  },
  heroEyebrow: {
    color: '#D5EDE0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 1,
  },
  heroSubtitle: {
    color: '#E3F3EA',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Status card */
  statusCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtext: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  /* Section headers */
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },

  /* Action cards */
  actionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    paddingRight: 8,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  chevron: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  /* Info card */
  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});