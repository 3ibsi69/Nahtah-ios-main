import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";
import TESTNOTIF from "./TESTNOTIF";
import SharedStateContext from "../../SharedStateContext";
import { FontAwesome } from "@expo/vector-icons";

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [numberError, setNumberError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [validEmailError, setValidEmailError] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useContext(SharedStateContext);
  const { isAdmin, setIsAdmin } = useContext(SharedStateContext);
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTokenReceived = (receivedToken) => {
    if (receivedToken) {
      AsyncStorage.setItem("expoPushToken", receivedToken);
      AsyncStorage.getItem("user").then((user) => {
        if (user) {
          SaveTokenAndUserId(receivedToken, JSON.parse(user)._id);
        }
      });
    }
  };
  const SaveTokenAndUserId = (token, userId) => {
    try {
      axios
        .post("https://api.nahtah.com/registerPushToken", {
          token: token,
          userId: userId,
        })

        .catch((error) => {
          console.error("Error saving token:", error);
        });
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
  };

  const handleLogin = () => {
    let hasError = false;

    if (email === "") {
      setEmailError("يرجى ملء حقل البريد الإلكتروني");
      hasError = true;
    } else if (!validateEmail(email)) {
      setValidEmailError("البريد الإلكتروني غير صالح");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (username === "") {
      setUsernameError("يرجى ملء حقل اسم المستخدم");
      hasError = true;
    } else {
      setUsernameError("");
    }
    if (number === "") {
      setNumberError("يرجى ملء حقل رقم الهاتف");
      hasError = true;
    } else {
      setNumberError("");
    }

    if (password === "") {
      setPasswordError("يرجى ملء حقل كلمة المرور");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل");
      setPasswordErrorMsg("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل");
      setTimeout(() => {
        setPasswordError("");
        setPasswordErrorMsg("");
      }, 3000);
      hasError = true;
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setPasswordError("يجب أن تحتوي كلمة المرور على أحرف وأرقام");
      setPasswordErrorMsg("كلمة المرور يجب أن تحتوي على أحرف وأرقام");
      setTimeout(() => {
        setPasswordError("");
        setPasswordErrorMsg("");
      }, 3000);
      hasError = true;
    } else {
      setPasswordError("");
    }
    if (!hasError) {
      setLoader(true);
      axios
        .post("https://api.nahtah.com/auth/user/signup", {
          email: email.toLowerCase(),
          username: username,
          phone: number,
          password: password,
        })
        .then((res) => {
          if (res.data.token) {
            AsyncStorage.setItem("token", res.data.token);
            AsyncStorage.setItem("user", JSON.stringify(res.data.user));
            setIsAdmin("User");
            setIsLoggedIn(true);
            setLoader(false);
          } else if (res.data.msg === "email already exist") {
            setLoader(false);
            setEmailError("البريد الإلكتروني مستخدم من قبل");
          } else {
            setIsLoggedIn(false);
            setLoader(false);
          }
        });
    }
  };
  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (usernameError) {
      setUsernameError("");
    }
  };
  const handleNumberChange = (text) => {
    setNumber(text);
    if (numberError) {
      setNumberError("");
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError("");
    }
  };
  const SeeIfLoggedInbefore = async () => {
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    const user = JSON.parse(userString);
    if (token && user) {
      setIsLoggedIn(true);
      if (user.banned === true) {
        Alert.alert("تم حظرك", "تم حظرك من قبل الإدارة");
        setIsLoggedIn(false);
        return;
      } else if (user.type === "Admin") {
        setIsAdmin("Admin");
      } else {
        setIsAdmin("User");
      }
    }
  };
  useEffect(() => {
    SeeIfLoggedInbefore();
  }, []);

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
          <TextInput
            placeholder="البريد الالكتروني"
            style={[styles.inputs, emailError && styles.errorInput]}
            value={email}
            onChangeText={handleEmailChange}
            autoCompleteType="email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {validEmailError ? (
            <Text style={styles.errorText}>{validEmailError}</Text>
          ) : null}
          <TextInput
            placeholder="اسم المستخدم"
            style={[styles.inputs, usernameError && styles.errorInput]}
            value={username}
            onChangeText={handleUsernameChange}
          />
          <TextInput
            placeholder="رقم الهاتف"
            style={[styles.inputs, numberError && styles.errorInput]}
            value={number}
            onChangeText={handleNumberChange}
            keyboardType="numeric"
            locale="en-US"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            }}
          >
            <TextInput
              placeholder="كلمة المرور"
              style={[styles.inputs, passwordError && styles.errorInput]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />

            <TouchableOpacity
              onPress={toggleShowPassword}
              style={styles.IconSeePassword}
            >
              <FontAwesome
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>
          {passwordError && passwordErrorMsg ? (
            <Text style={styles.errorText}>{passwordErrorMsg}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => handleLogin()}
          >
            {loader ? (
              <ActivityIndicator animating={true} size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.signUpText}>لديك حساب؟ سجل الدخول</Text>
          </TouchableOpacity>
        </View>
        {isLoggedIn && <TESTNOTIF onTokenReceived={handleTokenReceived} />}
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
    textAlign: "right",
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    height: 45,
    padding: 10,
    margin: 10,
  },
  IconSeePassword: {
    position: "absolute",
    left: 15,
    top: "32%",
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
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  signUpText: {
    marginTop: 22,
    color: "black",
    textDecorationLine: "underline",
  },
});
