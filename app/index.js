import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Share, TouchableOpacity, Text } from "react-native";
import { GiftedChat, Bubble, InputToolbar, Send } from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/MaterialIcons";
import { debounce } from "lodash";

export const generateContent = async (prompt) => {
  const apiKey = "AIzaSyCrrE-cAFlFARVRvUpUl_13uSSqgENgnbE"; // Replace with your actual API key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    return data;
  } catch (error) {
    console.error("Failed to generate content:", error);
    throw error;
  }
};

const GrammarCorrector = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const processText = async (text) => {
    const prompt = `Correct this English text: "${text}". 
      Return only the corrected version without explanations or markdown. 
      Maintain original meaning. If already correct, return "No errors found".`;

    try {
      const response = await generateContent(prompt);
      return response.candidates[0].content.parts[0].text;
    } catch (err) {
      throw new Error("Failed to correct text");
    }
  };

  const debouncedProcessText = useMemo(
    () =>
      debounce(async (text) => {
        try {
          const correction = await processText(text);
          console.log("text", JSON.stringify(text, null, 2));
          addCorrectionMessage(text, correction);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsTyping(false);
        }
      }, 1500),
    []
  );

  const addCorrectionMessage = (original, correction) => {
    const newMessages = [
      {
        _id: Math.round(Math.random() * 1000000),
        text: original,
        createdAt: new Date(),
        user: { _id: 1 },
      },
      {
        _id: Math.round(Math.random() * 1000000),
        text: correction,
        createdAt: new Date(),
        system: true,
        originalText: original,
        user: { _id: 2, name: "Grammar Bot" },
      },
    ];
    setMessages((previousMessages) => GiftedChat.prepend(newMessages, previousMessages));
  };

  const handleSend = useCallback((messages = []) => {
    const text = messages[0].text.trim();
    if (text.length === 0) return;

    setIsTyping(true);
    setError(null);
    debouncedProcessText(text);
  }, []);

  const copyToClipboard = async (text) => {
    await Clipboard.setString(text);
    // Add toast notification here if needed
  };

  const handleShare = async (text) => {
    try {
      await Share.share({
        message: `Corrected text: ${text}`,
        title: "Corrected English Text",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: "#DCF8C6" },
        left: { backgroundColor: "#FFFFFF" },
      }}
      textStyle={{
        right: { color: "#000" },
        left: { color: "#000" },
      }}
    />
  );

  const renderInputToolbar = (props) => (
    <InputToolbar {...props} containerStyle={styles.inputContainer} primaryStyle={styles.inputPrimary} />
  );

  const renderSend = (props) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <Icon name="send" size={24} color="#0084ff" style={styles.sendButton} />
    </Send>
  );

  const renderActions = () => (
    <TouchableOpacity style={styles.attachButton}>
      <Icon name="spellcheck" size={24} color="#0084ff" />
    </TouchableOpacity>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {isTyping && <ActivityIndicator size="small" color="#666" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderMessageOptions = (message) => (
    <View style={styles.messageOptions}>
      <TouchableOpacity onPress={() => copyToClipboard(message.text)}>
        <Icon name="content-copy" size={20} color="#666" style={styles.optionIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleShare(message.text)}>
        <Icon name="share" size={20} color="#666" style={styles.optionIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderSystemMessage = (props) => (
    <View style={styles.systemBubble}>
      <Text style={styles.correctionHeader}>Corrected Version:</Text>
      <Text style={styles.correctedText}>{props.currentMessage.text}</Text>
      {renderMessageOptions(props.currentMessage)}
      <Text style={styles.originalText}>Original: "{props.currentMessage.originalText}"</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderActions={renderActions}
        renderFooter={renderFooter}
        renderSystemMessage={renderSystemMessage}
        placeholder="Type a sentence to check grammar..."
        alwaysShowSend
        textInputProps={{ autoCapitalize: "sentences" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  systemBubble: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  correctionHeader: {
    color: "#666",
    fontSize: 12,
    marginBottom: 8,
  },
  correctedText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  originalText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  messageOptions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  optionIcon: {
    padding: 4,
  },
  footer: {
    height: 24,
    paddingHorizontal: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    padding: 8,
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  attachButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
  },
});

export default GrammarCorrector;
