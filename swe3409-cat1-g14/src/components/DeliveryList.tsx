/**
 * M3 · MEMBER 1 · Today's deliveries, with totals
 *
 * The collector must see every can recorded today, its risk in words and
 * whether it reached the server, plus one line of totals at the top.
 * Reuses riskLabel() and totals() from src/logic.ts.
 *
 * Done means: no "TODO M3" left, npm run typecheck has no errors, and on the
 * phone saved deliveries appear with their risk word and "Sent"/"Saved on phone".
 */
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { riskLabel, totals } from '../logic.ts';
import type { Delivery } from '../logic.ts';
import { useTheme } from '../ThemeContext.tsx';

type Props = { deliveries: Delivery[] };

export default function DeliveryList({ deliveries }: Props) {
  const { theme } = useTheme();

  if (deliveries.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: theme.cardAlt, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No deliveries yet. Use the form above.
        </Text>
      </View>
    );
  }

  const t = totals(deliveries);

  return (
    <View style={styles.container}>
      <Text style={[styles.summary, { color: theme.text }]}>
        {t.count} deliveries · {t.litres} L · {t.highRisk} high risk
      </Text>

      <FlatList
        data={deliveries}
        keyExtractor={(d) => d.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const label = riskLabel(item.risk);
          const riskColour =
            label === 'High'
              ? theme.danger
              : label === 'Medium'
              ? theme.warning
              : label === 'Low'
              ? theme.success
              : theme.neutral;

          return (
            <View
              style={[
                styles.row,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  {item.farmerId} · {item.litres} L
                </Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>
                  {item.tempC} °C · {item.hours} h since milking
                </Text>
              </View>

              <View style={styles.rowRight}>
                <Text style={[styles.riskText, { color: riskColour }]}>
                  {label}
                </Text>
                <Text style={[styles.sentText, { color: theme.textMuted }]}>
                  {item.sent ? 'Sent' : 'Saved on phone'}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  empty: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  summary: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sentText: {
    fontSize: 11,
    marginTop: 2,
  },
});