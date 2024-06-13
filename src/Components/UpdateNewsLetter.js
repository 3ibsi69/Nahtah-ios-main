import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function UpdateNewsLetter({ route, navigation }) {
  const { newsletterId, title, text } = route.params;
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setNewTitle(title);
    setNewText(text);
  }, [title, text]);

  const handleUpdate = () => {
    axios
      .put(`https://api.nahtah.com/newsletter/${newsletterId}`, {
        title: newTitle,
        text: newText,
      })
      .then((response) => {
        navigation.navigate("العروض");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // You can adjust the behavior based on your preference
    >
      <View style={styles.container}>
        <Text style={styles.header}>تحديث الرسالة</Text>
        <Text style={styles.label}> العنوان:</Text>
        <TextInput
          style={styles.input}
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <Text style={styles.label}> النص:</Text>
        <TextInput
          style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]}
          multiline
          value={newText}
          onChangeText={setNewText}
        />
        <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
          <Text style={styles.btnText}>تحديث</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "white",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333", // Dark gray text color
  },
  label: {
    fontSize: 15,
    marginBottom: 10,
    color: "#333",
    textAlign: "right",
  },
  input: {
    textAlign: "right",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color: "#333", // Dark gray text color
    minHeight: 35,
  },
  btn: {
    backgroundColor: "#003366",
    width: "100%",
    height: 40,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  successMessage: {
    textAlign: "center",
    marginTop: 10,
    color: "green",
  },
});
