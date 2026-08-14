/**
 * M5 · MEMBER 5 · Banner: "Server OK" or "Offline"  (with src/health.ts)
 *
 * A small strip shown at the top of a screen. It tells the collector whether
 * the Python API can be reached right now. When it says offline, deliveries
 * stay on the phone until the network comes back.
 *
 * The status is shown in words, not colour alone (some people cannot tell
 * colours apart).
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { checkHealth } from '../health.ts';
import { useTheme } from '../ThemeContext.tsx';

type Props = { apiUrl: string };

export default function StatusBanner({ apiUrl }: Props) {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'checking' | 'ok' | 'offline'>(
    'checking',
  );

  async function check() {
    setStatus('checking');
    const result = await checkHealth(apiUrl);
    setStatus(result);
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each status has a background and a foreground colour.
  const bg =
    status === 'ok'
      ? theme.successBg
      : status === 'offline'
      ? theme.dangerBg
      : theme.neutralBg;

  const fg =
    status === 'ok'
      ? theme.success
      : status === 'offline'
      ? theme.danger
      : theme.neutral;

  const message =
    status === 'checking'
      ? 'Checking server...'
      : status === 'ok'
      ? 'Server OK'
      : 'Offline: deliveries stay on this phone';

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: bg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.text, { color: fg }]} accessibilityRole="text">
        {message}
      </Text>

      <TouchableOpacity
        onPress={check}
        style={[styles.button, { borderColor: theme.border }]}
        accessibilityRole="button"
        accessibilityLabel="Check server again"
      >
        <Text style={[styles.buttonText, { color: fg }]}>Check again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    paddingRight: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '800',
  },
});