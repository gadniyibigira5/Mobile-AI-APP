// src/screens/AssignmentDemoScreen.tsx
//
// Shows the four assignment components together on one screen:
//   StatusBanner  (M5)
//   DeliveryForm  (M2)
//   DeliveryList  (M3)
// and wires them through api.ts (M4) and logic.ts (M1).
//
// This screen exists so the marked components are visible and functional on
// the phone during the demo.

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomHeader from '../components/CustomHeader';
import StatusBanner from '../components/StatusBanner';
import DeliveryForm from '../components/DeliveryForm';
import DeliveryList from '../components/DeliveryList';

import { API_URL } from '../config.ts';
import { getRisk, sendDelivery } from '../api.ts';
import type { Delivery, NewDelivery } from '../logic.ts';
import { useTheme } from '../ThemeContext.tsx';

export default function AssignmentDemoScreen({
  navigation,
}: {
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  async function handleSave(d: NewDelivery) {
    // 1. Ask the API for the risk (M4).
    const riskResult = await getRisk(API_URL, d.tempC, d.hours);

    // 2. Send the delivery to the API (M4).
    const sent = await sendDelivery(API_URL, d);

    // 3. Build the Delivery object the list expects (M1 type).
    const stored: Delivery = {
      ...d,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      risk: riskResult ? riskResult.risk : null,
      sent,
    };

    // 4. Prepend so the newest can is at the top.
    setDeliveries((prev) => [stored, ...prev]);
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bg, paddingTop: insets.top },
      ]}
    >
      <CustomHeader
        title="Assignment demo"
        subtitle="StatusBanner · DeliveryForm · DeliveryList"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <StatusBanner apiUrl={API_URL} />

        <DeliveryForm onSave={handleSave} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Today's deliveries
        </Text>

        <DeliveryList deliveries={deliveries} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 18,
  },
});