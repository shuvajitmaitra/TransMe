import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Share, TextInput, Text, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import { debounce } from "lodash";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [text, setText] = useState("");
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

  const handleSend = useCallback(() => {
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

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <View style={styles.messageContainer}>
        <Text>Messages</Text>
      </View>
      <View style={styles.FooterContainer}>
        <TextInput
          multiline={true}
          style={styles.input}
          placeholder="Type your message..."
          onChangeText={(t) => {
            setText(t);
          }}
          value={text}
        />
        <View style={styles.sendButtonContainer}>
          <TouchableOpacity style={styles.sendContainer} onPress={handleSend}>
            <MaterialIcons name="send" size={30} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  sendContainer: {
    padding: 10,
    // backgroundColor: "red",
  },
  sendButtonContainer: {
    justifyContent: "flex-end",
    // backgroundColor: "blue",
  },
  FooterContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    margin: 5,
  },
  messageContainer: {
    flex: 1,
  },
  input: {
    width: "88%",
    minHeight: 40,
    maxHeight: 300,
    paddingLeft: 10,
    paddingVertical: 8,
  },
  container: {
    flex: 1,
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
    paddingHorizontal: 16,
    backgroundColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: "blue",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    maxHeight: 800,
    padding: 8,
  },

  attachButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
  },
});

export default GrammarCorrector;
