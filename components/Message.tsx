import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Share } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { TResult } from "@/type/messageType";
import BlinkingText from "./BlinkingText";
import * as Clipboard from "expo-clipboard";
import Colors from "@/constants/Colors";

const Message = ({ message }: { message: TResult }) => {
  // Copies the original text to the clipboard
  const handleCopyOriginal = () => {
    Clipboard.setStringAsync(message?.originalText || "");
  };

  // Copies the response text to the clipboard (if available)
  const handleCopyResponse = () => {
    if (message.text) {
      Clipboard.setStringAsync(message.text);
    }
  };

  // Shares the response text using the native share dialog (if available)
  const handleShareResponse = async () => {
    if (message.text) {
      try {
        await Share.share({ message: message.text });
      } catch (error) {
        console.error("Error sharing message:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Original Message Row with the copy icon placed outside the bubble */}
      <View style={styles.originalRow}>
        <TouchableOpacity onPress={handleCopyOriginal} style={styles.copyIconOutside}>
          <MaterialIcons name="content-copy" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.originalBubble}>
          <Text style={styles.originalText}>{message.originalText}</Text>
        </View>
      </View>

      {/* Corrected Message Bubble with copy and share icons integrated below */}
      <View style={styles.responseRow}>
        <View style={styles.responseBubble}>
          {message.text ? (
            <Text style={styles.responseText}>{message.text}</Text>
          ) : (
            <BlinkingText style={styles.blinkingText}>Thinking...</BlinkingText>
          )}
        </View>
        {message.text && message.text !== "No correction needed..." && (
          <View style={styles.responseIcons}>
            <TouchableOpacity onPress={handleCopyResponse} style={styles.responseIcon}>
              <MaterialIcons name="content-copy" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareResponse} style={styles.responseIcon}>
              <MaterialIcons name="share" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 16,
  },
  originalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  copyIconOutside: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  originalBubble: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  originalText: {
    color: Colors.text,
    fontSize: 15,
  },
  responseRow: {
    alignSelf: "flex-start",
  },
  responseBubble: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
    maxWidth: "90%",
  },
  responseText: {
    color: Colors.text,
    fontSize: 15,
  },
  blinkingText: {
    fontSize: 15,
    color: Colors.placeholder,
    fontStyle: "italic",
  },
  responseIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  responseIcon: {
    marginRight: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
  },
});
