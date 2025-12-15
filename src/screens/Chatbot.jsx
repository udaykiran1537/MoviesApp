import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  sendChatMessage,
  createSystemMessage,
} from '../services/ChatService';

const Chatbot = () => {
  const { isDarkMode } = useSelector(state => state.theme);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);



  // 🔹 Messages used for UI
  const [uiMessages, setUiMessages] = useState([
    {
      id: '1',
      text: 'Hi 👋 I am CineBot. Ask me about movies!',
      sender: 'bot',
    },
  ]);

  // 🔹 Messages used for API (OpenRouter format)
  const [apiMessages, setApiMessages] = useState([
    createSystemMessage(
      'You are CineBot, a movie expert assistant.'
    ),
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userUiMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    const userApiMessage = {
      role: 'user',
      content: input,
    };

    setUiMessages(prev => [...prev, userUiMessage]);
    setApiMessages(prev => [...prev, userApiMessage]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(
        [...apiMessages, userApiMessage],
        "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", // 🔐 move to env or backend later
        'gpt-4o'
      );

      const botUiMessage = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'bot',
      };

      const botApiMessage = {
        role: 'assistant',
        content: reply,
      };

      setUiMessages(prev => [...prev, botUiMessage]);
      setApiMessages(prev => [...prev, botApiMessage]);
    } catch (error) {
      setUiMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: '⚠️ Something went wrong. Please try again.',
          sender: 'bot',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={isDarkMode ? styles.container : styles.lightContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CineBot 🎥</Text>
      </View>

      {/* CHAT LIST */}
      <FlatList
        data={uiMessages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      {/* TYPING INDICATOR */}
      {loading && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" color="#e50914" />
          <Text style={styles.typingText}>CineBot is typing...</Text>
        </View>
      )}

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={isDarkMode ? styles.input : styles.lightInput}
          placeholder="Ask about movies, actors, genres..."
          placeholderTextColor="#8b949e"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chatbot;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  lightContainer: {
    flex: 1,
    backgroundColor: '#fbfcfe',
  },

  header: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e50914',
    letterSpacing: 1,
  },

  chatList: {
    padding: 16,
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },

  userBubble: {
    backgroundColor: '#e50914',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },

  botBubble: {
    backgroundColor: '#21262d',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  userText: {
    color: '#ffffff',
    fontWeight: '500',
  },

  botText: {
    color: '#e6edf3',
  },

  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  typingText: {
    color: '#8b949e',
    marginLeft: 8,
    fontSize: 12,
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    backgroundColor: '#21262d',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },

  lightInput: {
    flex: 1,
    backgroundColor: '#e1e4e8',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#050505',
    fontSize: 14,
  },

  sendButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginLeft: 10,
  },

  sendText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
