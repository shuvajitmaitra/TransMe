import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, TextInput, Text, TouchableOpacity, FlatList, Platform, StatusBar, Keyboard } from "react-native";
import { debounce } from "lodash";
import { MaterialIcons } from "@expo/vector-icons";
import { API_KEY } from "@/constants/env";
import Message from "@/components/Message";
import { TResult } from "@/type/messageType";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import ReactNativeModal from "react-native-modal";

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
  const textRef = useRef("");
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<TResult[]>([]);
  // const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const handleChangeText = useCallback((t: string) => {
    textRef.current = t;
  }, []);

  const processText = async (inputText: string) => {
    const prompt = `Correct this English text: "${inputText}". 
Return only the corrected version without explanations or markdown.
correct spelling mistakes. 
Maintain original meaning. If already correct, return "No correction needed...".
If user send follow up question give the answer of it`;

    try {
      const response = await generateContent(prompt);
      return response.candidates[0].content.parts[0].text.slice(0, -1);
    } catch (err) {
      throw new Error("Failed to correct text");
    }
  };

  const debouncedProcessText = useMemo(
    () =>
      debounce(async (inputText: string) => {
        try {
          const correction = await processText(inputText);
          addCorrectionMessage(correction);
        } catch (err: any) {
          setError(err.message);
        } finally {
          // setIsTyping(false);
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
            createdAt: new Date(),
            system: true,
            user: { _id: Math.round(Math.random() * 999999), name: "Trans Me" },
          },
        ];
      }
      const updatedMessages = [...prevMessages];
      updatedMessages[0] = { ...updatedMessages[0], text: correction };

      return updatedMessages;
    });
  };

  const handleSend = useCallback(() => {
    const currentText = textRef.current;
    if (!currentText || currentText.trim().length === 0) return;
    // setIsTyping(true);
    setError(null);
    debouncedProcessText(currentText);
    // Add the new message with the original text
    const newMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: "",
      createdAt: new Date(),
      system: true,
      originalText: currentText,
      user: { _id: Math.round(Math.random() * 999999), name: "Trans Me" },
    };
    setMessages((prev) => [newMessage, ...prev]);

    textRef.current = "";
    // Clear the visible text in the TextInput
    Keyboard.dismiss();
    if (inputRef.current) {
      inputRef.current.clear();
    }
  }, [debouncedProcessText]);
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <ReactNativeModal animationIn={"fadeIn"} isVisible={true} avoidKeyboard={true} style={[styles.container]}>
        <StatusBar backgroundColor={Colors.primary} />
        <View style={styles.messageContainer}>
          <View style={[styles.header, { paddingTop: Platform.OS === "ios" ? top / 1.2 : top / 2 }]}>
            <Text style={styles.headerText}>ReviseMe</Text>
            <Text style={styles.headerDescriptionText}>Make it work, make it right, make it fast.</Text>
          </View>
          <FlatList
            data={messages}
            keyExtractor={() => Math.random().toString()}
            renderItem={({ item }) => <Message message={item} />}
            inverted
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </View>
        <View style={[styles.FooterContainer, Platform.OS === "ios" && { marginBottom: bottom / 1.5 }]}>
          <TextInput
            ref={inputRef} // Attach the ref here
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={Colors.placeholder}
            defaultValue=""
            onChangeText={handleChangeText}
            multiline={true}
          />
          <TouchableOpacity style={styles.sendContainer} onPress={handleSend}>
            <MaterialIcons name="send" size={30} color={Colors.text} />
          </TouchableOpacity>
        </View>
        {/* {isTyping && <ActivityIndicator style={styles.typingIndicator} color={Colors.primary} />} */}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ReactNativeModal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
  },
  headerText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerDescriptionText: {
    color: Colors.text,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    margin: 0,
  },
  messageContainer: {
    flex: 1,
  },
  FooterContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 50,
    marginVertical: 5,
    marginHorizontal: 10,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  input: {
    width: "88%",
    maxHeight: 300,
    paddingLeft: 10,
    paddingBottom: 8,
    color: Colors.text,
    // backgroundColor: Colors.background,
  },
  sendContainer: {
    padding: 10,
  },
  typingIndicator: {
    margin: 10,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    textAlign: "center",
    margin: 5,
  },
});

export default GrammarCorrector;
