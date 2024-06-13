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
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import SharedStateContext from "../../SharedStateContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import TESTNOTIF from "./TESTNOTIF";
import GoogleUp from "./GoogleUp";
import GoogleIos from "./googleUpIos"
// import FacebookUp from "./FacebookUp";
import { FontAwesome } from "@expo/vector-icons";
export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useContext(SharedStateContext);
  const { isAdmin, setIsAdmin } = useContext(SharedStateContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
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

  const handleLogin = () => {
    let hasError = false;

    if (email === "") {
      setEmailError("يرجى ملء حقل البريد الإلكتروني");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (password === "") {
      setPasswordError("يرجى ملء حقل كلمة المرور");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (!hasError) {
      setLoader(true);
      axios
        .post("https://api.nahtah.com/auth/user/signin", {
          email: email.toLowerCase(),
          password: password,
        })
        .then((response) => {
          if (response.data.token) {
            setLoader(false);
            AsyncStorage.setItem("token", response.data.token);
            AsyncStorage.setItem("user", JSON.stringify(response.data.user));
            setIsLoggedIn(true);
            if (response.data.user.banned === true) {
              Alert.alert("تم حظرك", "تم حظرك من قبل الإدارة");
              setIsLoggedIn(false);
              return;
            } else if (response.data.user.type === "Admin") {
              setIsAdmin("Admin");
            } else {
              setIsAdmin("User");
            }
          } else {
            setLoader(false);
            setIsLoggedIn(false);
            setPasswordError("اسم المستخدم أو كلمة المرور غير صحيحة");
            setEmailError("اسم المستخدم أو كلمة المرور غير صحيحة");
          }
        })
        .catch((error) => {
          console.error("Error logging in:", error);
        });
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
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
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
          <TextInput
            placeholder="البريد الإلكتروني"
            style={[styles.inputs, emailError && styles.errorInput]}
            value={email}
            keyboardType="email-address"
            onChangeText={handleEmailChange}
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

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleLogin}
          >
            {loader ? (
              <ActivityIndicator animating={true} size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgetPassword")}
          >
            <Text style={styles.forgetText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signinText}>ليس لديك حساب؟ سجل الآن</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <View style={styles.container}>
              <View style={styles.buttonContainers}>
                <TouchableOpacity style={styles.buttons}>
                  {/* <GoogleUp /> */}
                  <GoogleIos/>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.buttons}>
                  <FacebookUp />
                </TouchableOpacity> */}
              </View>
              <View style={styles.hr} />
            </View>
          </View>
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
    padding: 10,
    height: 45,
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
    padding: 10,
    borderRadius: 5,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  signinText: {
    marginTop: 13,
    color: "black",
    textDecorationLine: "underline",
  },
  forgetText: {
    marginTop: 22,
    color: "black",
    textDecorationLine: "underline",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainers: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttons: {
    marginRight: 10,
    marginLeft: 10,
  },
  hr: {
    position: "absolute",
    top: "50%",
    width: "80%",
    height: 1,
    backgroundColor: "black",
    zIndex: -1,
  },
});
