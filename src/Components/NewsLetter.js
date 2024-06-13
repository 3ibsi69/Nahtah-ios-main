import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function NewsLetter() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [clientIds, setClientIds] = useState([]);

  const getUsers = async () => {
    try {
      const response = await axios.get("https://api.nahtah.com/usersConnected");
      const keys = Object.keys(response.data);
      axios.get("https://api.nahtah.com/auth/user").then((res) => {
        const usersWithMatchingIds = res.data.filter((user) =>
          keys.includes(user._id)
        );
        setClientIds(usersWithMatchingIds.map((user) => user._id));
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleCreateLetter = async () => {
    try {
      const UserString = await AsyncStorage.getItem("user");
      if (UserString) {
        const user = JSON.parse(UserString);
        if (user) {
          axios
            .post("https://api.nahtah.com/newsletter", {
              title: title,
              text: text,
              admin: user._id,
            })
            .then((response) => {
              {
                clientIds.length > 0
                  ? clientIds.forEach((clientId) => {
                      axios.post("https://api.nahtah.com/notifications/", {
                        title: "النشرة الإخبارية",
                        text: "تم إرسال نشرة جديدة",
                        redirection: "النشرة الإخبارية",
                        client: clientId,
                      });
                      axios.post("https://api.nahtah.com/send", {
                        userId: clientId,
                        title: " النشرة الإخبارية",
                        body: "تم إرسال نشرة جديدة",
                        channelId: "إشعارات",
                      });
                    })
                  : null;
              }
              setText("");
              setTitle("");
              setSuccessMessage("تم إرسال النشرة بنجاح!");
              setTimeout(() => {
                setSuccessMessage("");
              }, 3000);
            });
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // You can adjust the behavior based on your preference
    >
      <View style={styles.container}>
        <Text style={styles.header}>اضافة خبر</Text>
        <Text style={styles.label}> العنوان:</Text>

        <TextInput
          style={styles.input}
          placeholder="العنوان"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={styles.label}> النص:</Text>

        <TextInput
          style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]}
          placeholder="النص"
          multiline={true} // Set multiline to true
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.btn} onPress={handleCreateLetter}>
          <Text style={styles.btnText}>ارسال</Text>
        </TouchableOpacity>
        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}
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
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: "right",
    color: "#333", // Dark gray text color
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
