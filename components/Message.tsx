import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Clipboard, Share } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { TResult } from "@/type/messageType";
import BlinkingText from "./BlinkingText";

const Message = ({ message }: { message: TResult }) => {
  // Copies the original text to the clipboard
  const handleCopyOriginal = () => {
    Clipboard.setString(message?.originalText || "");
  };

  // Copies the response text to the clipboard (if available)
  const handleCopyResponse = () => {
    if (message.text) {
      Clipboard.setString(message.text);
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
          <MaterialIcons name="content-copy" size={18} color="#4a90e2" />
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
        <View style={styles.responseIcons}>
          <TouchableOpacity onPress={handleCopyResponse} style={styles.responseIcon}>
            <MaterialIcons name="content-copy" size={18} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareResponse} style={styles.responseIcon}>
            <MaterialIcons name="share" size={18} color="#4a90e2" />
          </TouchableOpacity>
        </View>
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
  // Row container for the original message: icon on the left, bubble on the right
  originalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  // The copy icon placed outside the original message bubble
  copyIconOutside: {
    padding: 6,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  // Blue bubble for the original message with a "tail" effect (bottom-right sharper)
  originalBubble: {
    backgroundColor: "#4a90e2",
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
    color: "#fff",
    fontSize: 15,
  },
  // Container for the corrected message bubble and its icons;
  // no fixed width ensures it only occupies as much space as its content
  responseRow: {
    alignSelf: "flex-start",
  },
  // White bubble for the corrected message with a "tail" effect (bottom-left sharper)
  responseBubble: {
    backgroundColor: "#fff",
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
    color: "#333",
    fontSize: 15,
  },
  blinkingText: {
    fontSize: 15,
    color: "#aaa",
    fontStyle: "italic",
  },
  // Container for copy and share icons in the corrected message bubble
  responseIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  responseIcon: {
    marginRight: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: "#4a90e2",
    borderRadius: 50,
  },
});
