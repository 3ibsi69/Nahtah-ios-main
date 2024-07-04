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
import TESTNOTIF from "./TESTNOTIF";
import GoogleIos from "./googleUpIos";
import { FontAwesome } from "@expo/vector-icons";

export default function Welcome({ navigation }) {
  const { isLoggedIn, setIsLoggedIn } = useContext(SharedStateContext);
  const { isAdmin, setIsAdmin } = useContext(SharedStateContext);
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
  const handleEmailSignIn = () => {
    navigation.navigate("Home");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.Maincontainer}>
        <View style={styles.imgContainer}>
          <Image source={require("../../assets/Logo.png")} style={styles.img} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>تسجيل الدخول</Text>
        <View style={styles.inputsContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleEmailSignIn}
          >
            {loader ? (
              <ActivityIndicator animating={true} size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                بالبريد الإلكتروني وكلمة المرور
              </Text>
            )}
          </TouchableOpacity>
          <View style={{ width: "80%" }}>
            <GoogleIos />
          </View>
          <View style={styles.hr} />
        </View>
      </View>
      {isLoggedIn && <TESTNOTIF onTokenReceived={handleTokenReceived} />}
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
});
