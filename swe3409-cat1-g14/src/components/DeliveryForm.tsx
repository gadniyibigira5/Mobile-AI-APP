/**
 * M2 · MEMBER 3 · The form where the collector records a can of milk
 *
 * Four inputs, one error message, one Save button. The form never saves bad
 * input: it asks checkDelivery() (Member 4, src/logic.ts) and shows the
 * message it returns. The parent screen provides onSave and decides what to
 * do with the delivery (send it, store it, show it).
 *
 * Done means: no "TODO M2" left, npm run typecheck has no errors, and on the
 * phone a bad farmer code shows "Enter a farmer code like FRM-0012".
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { checkDelivery } from '../logic.ts';
import type { NewDelivery } from '../logic.ts';
import { useTheme } from '../ThemeContext.tsx';

type Props = { onSave: (d: NewDelivery) => void };

export default function DeliveryForm({ onSave }: Props) {
  const { theme } = useTheme();

  const [farmerId, setFarmerId] = useState('');
  const [litres, setLitres] = useState('');
  const [tempC, setTempC] = useState('');
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');

  function save() {
    const problem = checkDelivery(farmerId, litres, tempC, hours);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');

    onSave({
      farmerId: farmerId.trim().toUpperCase(),
      litres: Number(litres),
      tempC: Number(tempC),
      hours: Number(hours),
    });

    // Empty the four inputs so the collector can enter the next can.
    setFarmerId('');
    setLitres('');
    setTempC('');
    setHours('');
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Record a delivery
      </Text>

      <Text style={[styles.label, { color: theme.textMuted }]}>Farmer ID</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={farmerId}
        onChangeText={setFarmerId}
        placeholder="FRM-0012"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Farmer ID"
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Text style={[styles.label, { color: theme.textMuted }]}>Litres</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={litres}
        onChangeText={setLitres}
        placeholder="e.g. 18.5"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Litres"
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: theme.textMuted }]}>
        Temperature (°C)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={tempC}
        onChangeText={setTempC}
        placeholder="e.g. 7"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Temperature in degrees Celsius"
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: theme.textMuted }]}>
        Hours since milking
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        value={hours}
        onChangeText={setHours}
        placeholder="e.g. 1.5"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Hours since milking"
        keyboardType="numeric"
      />

      {error !== '' && (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={save}
        accessibilityRole="button"
        accessibilityLabel="Save delivery"
      >
        <Text style={[styles.buttonText, { color: theme.textInverse }]}>
          Save delivery
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  button: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});