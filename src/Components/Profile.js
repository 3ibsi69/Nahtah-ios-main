import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

export default function Profile({ navigation }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [numberError, setNumberError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [validEmailError, setValidEmailError] = useState("");
  const [editable, setEditable] = useState(false);
  const [editableEmail, setEditableEmail] = useState(false);
  const [editableUsername, setEditableUsername] = useState(false);
  const [editableNumber, setEditableNumber] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useFocusEffect(
    React.useCallback(() => {
      setEditable(false);
    }, [])
  );
  const getUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);

        if (user && user.type === "User") {
          const getUserResponse = await axios.get(
            `https://api.nahtah.com/auth/user/${user._id}`
          );
          userData = getUserResponse.data;
        } else if (user && user.type === "Admin") {
          const getUserResponse = await axios.get(
            `https://api.nahtah.com/auth/admin/${user._id}`
          );
          userData = getUserResponse.data;
        }
        setEmail(userData.email);
        setUsername(userData.username);
        setNumber(userData.phone);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (e) {
      console.log(e);
    }
  };
  const checkIfBanned = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        navigation.navigate("Logout");
        return;
      }
      const user = JSON.parse(userString);
      if (!user || user.type !== "User" || user.type !== "Admin") return;
      const getUserResponse = await axios.get(
        `https://api.nahtah.com/auth/user/${user._id}`
      );
      const userData = getUserResponse.data;

      if (userData.banned === true) {
        await AsyncStorage.removeItem("user");
        navigation.navigate("Logout");
        Alert.alert("تم حظرك من قبل الإدارة");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      checkIfBanned();
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
      getUserData();
    }, [])
  );

  const handleUpdateProfile = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        return;
      }
      const user = JSON.parse(userString);

      if (!user || !user._id) {
        return;
      }

      let hasError = false;
      if (!validateEmail(email)) {
        setValidEmailError("البريد الالكتروني غير صالح");
        hasError = true;
      }
      if (!number) {
        Alert.alert("رقم الهاتف لا يمكن أن يكون فارغًا");
        getUserData();
        return;
      }
      if (number.length !== 10 || isNaN(number)) {
        Alert.alert("رقم الهاتف يجب ان يكون 10 ارقام");
        getUserData();
        hasError = true;
        return;
      } else {
        if (
          !hasError &&
          (email !== user.email ||
            username !== user.username ||
            number !== user.phone)
        ) {
          await axios
            .put(`https://api.nahtah.com/auth/user/${user._id}`, {
              email: email,
              username: username,
              phone: number,
            })
            .then(async (response) => {
              if (response.data.msg === "updated") {
                let userData;
                if (user.type === "User" || user.type === "Admin") {
                  const getUserResponse = await axios.get(
                    `https://api.nahtah.com/auth/user/${user._id}`
                  );
                  userData = getUserResponse.data;
                } else {
                  const getUserResponse = await axios.get(
                    `https://api.nahtah.com/auth/admin/${user._id}`
                  );
                  userData = getUserResponse.data;
                }
                await AsyncStorage.setItem("user", JSON.stringify(userData));
              } else {
                console.error("PUT request failed with status:", res.status);
              }
            })
            .catch((error) => {
              console.error("Error occurred:", error);
            });
        } else {
          Alert.alert("لا توجد تغييرات لتحديثها");
          getUserData();
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        return;
      }
      const user = JSON.parse(userString);

      if (!user || !user._id) {
        return;
      }

      await axios.delete(`https://api.nahtah.com/auth/user/${user._id}`);
      await AsyncStorage.removeItem("user");
      navigation.navigate("Logout");
      Alert.alert("تم حذف الحساب بنجاح");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد أنك تريد حذف حسابك؟",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "نعم",
          onPress: handleDeleteAccount,
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // You can adjust the behavior based on your preference
    >
      <View style={styles.Maincontainer}>
        <View style={styles.imgContainer}>
          <Image source={require("../../assets/Logo.png")} style={styles.img} />
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.row}>
            <AntDesign
              name="edit"
              style={styles.iconContainer}
              size={22}
              color="black"
              onPress={() => {
                setEditableEmail(true);
              }}
            />
            <TextInput
              placeholder="البريد الالكتروني"
              style={[
                styles.inputs,
                emailError && styles.errorInput,
                !editableEmail && styles.NonEditableInput,
              ]}
              value={email}
              onChangeText={setEmail}
              autoCompleteType="email"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={editableEmail}
            />
            {validEmailError ? (
              <Text style={styles.errorText}>{validEmailError}</Text>
            ) : null}
          </View>
          <View style={styles.row}>
            <AntDesign
              name="edit"
              style={styles.iconContainer}
              size={22}
              color="black"
              onPress={() => {
                setEditableUsername(true);
              }}
            />
            <TextInput
              placeholder="اسم المستخدم"
              style={[
                styles.inputs,
                usernameError && styles.errorInput,
                !editableUsername && styles.NonEditableInput,
              ]}
              value={username}
              onChangeText={setUsername}
              editable={editableUsername}
            />
          </View>
          <View style={styles.row}>
            <AntDesign
              name="edit"
              style={styles.iconContainer}
              size={22}
              color="black"
              onPress={() => {
                setEditableNumber(true);
              }}
            />
            <TextInput
              placeholder="رقم الهاتف"
              style={[
                styles.inputs,
                numberError && styles.errorInput,
                !editableNumber && styles.NonEditableInput,
              ]}
              value={number}
              onChangeText={setNumber}
              keyboardType="numeric"
              editable={editableNumber}
            />
          </View>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              handleUpdateProfile();
              setEditableEmail(false);
              setEditableUsername(false);
              setEditableNumber(false);
            }}
          >
            <Text style={styles.buttonText}>تحديث الملف الشخصي</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.deleteText}
          onPress={confirmDeleteAccount}
        >
          <Text style={{ color: "red" }}>لحذف هذا الحساب، انقر هنا.</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  Maincontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  imgContainer: {
    width: 150,
    height: 150,
    margin: 10,
    overflow: "hidden",
    marginBottom: 60,
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  inputsContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputs: {
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    height: 45,
    padding: 10,
    marginVertical: 10,
    textAlign: "right",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 5,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
    backgroundColor: "#003366",
    width: "80%",
    height: 45,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  NonEditableInput: {
    backgroundColor: "#f2f2f2",
    borderWidth: 0,
    color: "black",
    opacity: 0.4,
  },
  row: {
    width: "100%",
    alignItems: "center",
    position: "relative",
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
  iconContainer: {
    position: "absolute",
    right: 45,
    top: 20,
    transform: [{ scaleX: -1 }],
  },
  inputs: {
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    height: 45,
    padding: 10,
    marginVertical: 10,
    textAlign: "right",
  },
  deleteText: {
    position: "absolute",
    bottom: 8,
  },
});
