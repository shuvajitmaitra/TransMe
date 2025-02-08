import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TResult } from "@/type/messageType";
import BlinkingText from "./BlinkingText";

const Message = ({ message }: { message: TResult }) => {
  return (
    <View style={styles.container}>
      <View style={styles.preResult}>
        <View style={styles.preResultContainer}>
          <Text>{message.originalText}</Text>
        </View>
      </View>
      <View style={styles.result}>{message.text ? <Text>{message.text}</Text> : <BlinkingText> Thinking...</BlinkingText>}</View>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#9999",
  },
  preResult: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    // width: "100%",
    alignItems: "flex-end",
  },
  preResultContainer: {
    backgroundColor: "red",
  },
  result: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: "100%",
    alignItems: "flex-start",
  },
});
