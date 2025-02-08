import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Share,
  TextInput,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Clipboard,
  FlatList,
} from "react-native";
import { debounce } from "lodash";
import { MaterialIcons } from "@expo/vector-icons";
import { API_KEY } from "@/constants/env";
import Message from "@/components/Message";
import { TResult } from "@/type/messageType";

export const generateContent = async (prompt: string) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
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
    return data;
  } catch (error) {
    console.error("Failed to generate content:", error);
    throw error;
  }
};

const GrammarCorrector = () => {
  // Ref for storing text content (not linked to input display)
  const textRef = useRef("");
  // New ref for the TextInput component
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<TResult[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  console.log("Re-rendered");

  // Update textRef on change
  const handleChangeText = useCallback((t: string) => {
    textRef.current = t;
  }, []);

  const processText = async (inputText: string) => {
    const prompt = `Correct this English text: "${inputText}". 
Return only the corrected version without explanations or markdown. 
Maintain original meaning. If already correct, return "No errors found".`;

    try {
      const response = await generateContent(prompt);
      return response.candidates[0].content.parts[0].text.slice(0, -1);
    } catch (err) {
      throw new Error("Failed to correct text");
    }
  };

  const debouncedProcessText = useMemo(
    () =>
      debounce(async (inputText) => {
        try {
          const correction = await processText(inputText);
          addCorrectionMessage(correction);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsTyping(false);
        }
      }, 1500),
    []
  );

  const addCorrectionMessage = (correction: string) => {
    setMessages((prevMessages: TResult[]) => {
      if (prevMessages.length === 0) {
        return [
          {
            _id: Math.round(Math.random() * 1000000),
            text: correction,
            createdAt: new Date().toISOString(),
            system: true,
            originalText: prevMessages.length > 0 ? prevMessages[prevMessages.length - 1].text : "",
            user: {
              _id: 2,
              name: "System",
            },
          },
        ];
      }
      return [
        ...prevMessages,
        {
          _id: Math.round(Math.random() * 1000000),
          text: correction,
          createdAt: new Date().toISOString(),
          system: true,
          originalText: prevMessages[prevMessages.length - 1].text,
          user: {
            _id: 2,
            name: "System",
          },
        },
      ];
    });
  };

  const handleSend = useCallback(() => {
    const currentText = textRef.current;
    if (!currentText || currentText.trim().length === 0) return;
    setIsTyping(true);
    setError(null);
    debouncedProcessText(currentText);
    // Clear the text stored in the ref
    const newMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: "",
      createdAt: new Date().toISOString(),
      system: true,
      originalText: currentText,
      user: { _id: Math.round(Math.random() * 999999), name: "Trans Me" },
    };
    console.log("newMessage", JSON.stringify(newMessage, null, 2));
    setMessages((prev) => [newMessage, ...prev]);

    textRef.current = "";
    // Also clear the visible text in the TextInput
    if (inputRef.current) {
      inputRef.current.clear();
    }
  }, [debouncedProcessText]);

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.headerText}>Messages</Text>
        <FlatList
          data={messages}
          keyExtractor={() => Math.random().toString()}
          renderItem={({ item }) => <Message message={item} />}
          inverted
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </View>
      <View style={styles.FooterContainer}>
        <TextInput
          ref={inputRef} // Attach the ref here
          style={styles.input}
          placeholder="Type your message..."
          defaultValue=""
          onChangeText={handleChangeText}
          multiline={true}
        />
        <TouchableOpacity style={styles.sendContainer} onPress={handleSend}>
          <MaterialIcons name="send" size={30} color="red" />
        </TouchableOpacity>
      </View>
      {isTyping && <ActivityIndicator style={styles.typingIndicator} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    padding: 10,
  },
  FooterContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    margin: 5,
    alignItems: "center",
  },
  input: {
    width: "88%",
    maxHeight: 300,
    paddingLeft: 10,
    paddingBottom: 8,
  },
  sendContainer: {
    padding: 10,
  },
  systemBubble: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  typingIndicator: {
    margin: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "center",
    margin: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GrammarCorrector;
