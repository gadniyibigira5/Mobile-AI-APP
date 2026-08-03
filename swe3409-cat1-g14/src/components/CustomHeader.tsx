import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { useTheme } from '../ThemeContext.tsx';

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function CustomHeader({
  title,
  subtitle,
  showBack,
  onBackPress,
}: CustomHeaderProps) {
  const { theme, mode, toggle } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.card, borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={[styles.backText, { color: theme.accent }]}>
                ← Back
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={toggle}
          style={[styles.toggleButton, { borderColor: theme.border }]}
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
          }
        >
          <Text style={styles.toggleIcon}>
            {mode === 'light' ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* NatGeo-inspired yellow rule */}
      <View style={[styles.accentRule, { backgroundColor: theme.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    paddingRight: 12,
  },
  backButton: {
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  toggleIcon: {
    fontSize: 18,
  },
  accentRule: {
    height: 3,
    marginTop: 12,
    marginHorizontal: -20, // pull the rule to the full width of the header
    marginBottom: 0,
  },
});