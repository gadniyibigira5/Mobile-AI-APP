import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { sendChatMessage } from '../api';
import { useTheme } from '../ThemeContext.tsx';

export default function ChatScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: 'Hello! I am your Milk Check AI Assistant. How can I assist your operations today?',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    const timeNow = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessages = [
      ...messages,
      { sender: 'user' as const, text: userText, time: timeNow },
    ];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(userText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Network connection issue. Please check your backend connection.',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.bg, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View
            style={[
              styles.sparkleBadge,
              { backgroundColor: theme.accentSoft },
            ]}
          >
            <Text style={styles.sparkleIcon}>✨</Text>
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Milk Check Assistant
          </Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userRow : styles.aiRow,
              ]}
            >
              {msg.sender === 'ai' && (
                <View
                  style={[
                    styles.aiAvatar,
                    { backgroundColor: theme.primarySoft },
                  ]}
                >
                  <Text style={styles.aiAvatarText}>✨</Text>
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'user'
                    ? { backgroundColor: theme.primary }
                    : {
                        backgroundColor: theme.cardAlt,
                        borderColor: theme.border,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'user'
                      ? { color: theme.textInverse }
                      : { color: theme.text },
                  ]}
                >
                  {msg.text}
                </Text>

                <Text
                  style={[
                    styles.timeText,
                    msg.sender === 'user'
                      ? { color: 'rgba(255,255,255,0.7)' }
                      : { color: theme.textMuted },
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View
                style={[
                  styles.aiAvatar,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <Text style={styles.aiAvatarText}>✨</Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  styles.loadingBubble,
                  {
                    backgroundColor: theme.cardAlt,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ActivityIndicator size="small" color={theme.primary} />
                <Text
                  style={[styles.loadingBubbleText, { color: theme.textMuted }]}
                >
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View
          style={[
            styles.inputContainerWrapper,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View
            style={[
              styles.inputPill,
              {
                backgroundColor: theme.bg,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.plusButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.plusIcon, { color: theme.accent }]}>+</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder="Ask about milk quality, temperatures..."
              placeholderTextColor={theme.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputMessage.trim() || loading}
              activeOpacity={0.8}
              style={styles.sendButtonWrapper}
            >
              <LinearGradient
                colors={
                  !inputMessage.trim() || loading
                    ? [theme.border, theme.border]
                    : theme.gradientPrimary
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButton}
              >
                <Text
                  style={[
                    styles.sendArrow,
                    {
                      color:
                        !inputMessage.trim() || loading
                          ? theme.textMuted
                          : theme.textInverse,
                    },
                  ]}
                >
                  ↑
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>
            AI-generated insights for collection centers. Verify critical
            values.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/*
 * ═════════════════════════════════════════════
 * STYLES
 * ═════════════════════════════════════════════
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 22,
    fontWeight: '600',
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sparkleBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  sparkleIcon: {
    fontSize: 13,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  headerRightSpacer: {
    width: 36,
  },

  keyboardContainer: {
    flex: 1,
  },

  chatScroll: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  aiRow: {
    justifyContent: 'flex-start',
  },

  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },

  aiAvatarText: {
    fontSize: 14,
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  loadingBubbleText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  timeText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },

  inputContainerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },

  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  plusIcon: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 6 : 4,
  },

  sendButtonWrapper: {
    width: 38,
    height: 38,
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendArrow: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },

  disclaimerText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});