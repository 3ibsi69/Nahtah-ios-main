import { StatusBar } from "expo-status-bar";

import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState, useContext } from "react";
import * as Google from "expo-auth-session/providers/google";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
} from "react-native";
WebBrowser.maybeCompleteAuthSession();

import SharedStateContext from "../../SharedStateContext";
import { SocialIcon } from "react-native-elements";
import TESTNOTIF from "./TESTNOTIF";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";

export default function GoogleIos() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [loading, setLoading] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useContext(SharedStateContext);
  const { isAdmin, setIsAdmin } = useContext(SharedStateContext);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "1027183268875-to5puh2r0rftk6kfn3ksrsqqvmlm2gut.apps.googleusercontent.com",
  });

  useEffect(() => {
    handleSignInWithGoogle();
  }, [response]);
  const handleTokenReceived = (receivedToken) => {
    if (receivedToken) {
      AsyncStorage.setItem("expoPushToken", receivedToken);
      AsyncStorage.getItem("user").then((User) => {
        if (User) {
          console.log(receivedToken, JSON.parse(User)._id);
          SaveTokenAndUserId(receivedToken, JSON.parse(User)._id);
        }
      });
    }
  };

  const SaveTokenAndUserId = (token, userId) => {
    console.log(token, userId);
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
  async function handleSignInWithGoogle() {
    const user = await AsyncStorage.getItem("user");
    if (!user) {
      if (response?.type === "success") {
        await getUserInfo(response.authentication?.accessToken);
      }
    } else {
      setUser(JSON.parse(user));
    }
  }
  const onAuthStateChanged = async (user) => {
    if (user) {
      setLoading(true); // Set loading to true when user is available#

      axios
        .post("https://api.nahtah.com/auth/user/signup", {
          email: user.email,
          username: user.name,
          password: "s" + user.email,
          number: user.phoneNumber,
        })
        .then((res) => {
          if (res.data.msg === "email already exist") {
            axios
              .post("https://api.nahtah.com/auth/user/signin", {
                email: user.email,
                password: "s" + user.email,
              })
              .then(async (res) => {
                if (res.data.msg === "wrong password") {
                  Alert.alert(
                    "تم استخدام هذا البريد الإلكتروني مسبقًا مع كلمة مرور أخرى",
                    "يرجى المحاولة مرة أخرى",
                    [{ text: "OK" }]
                  );
                  await AsyncStorage.removeItem("user");
                  await AsyncStorage.removeItem("token");
                } else {
                  AsyncStorage.setItem("token", JSON.stringify(res.data.token));
                  AsyncStorage.setItem("user", JSON.stringify(res.data.user));
                  setIsLoggedIn(true);
                  setIsAdmin(res.data.user.type === "Admin" ? "Admin" : "User");
                }
              });
          } else {
            AsyncStorage.setItem("token", JSON.stringify(res.data.token));
            AsyncStorage.setItem("user", JSON.stringify(res.data.user));
            setIsLoggedIn(true);

            setIsAdmin(res.data.user.type === "Admin" ? "Admin" : "User");
          }
          setLoading(false);
        });
    }
    if (initializing) setInitializing(false);
  };

  const getUserInfo = async (accessToken) => {
    if (!accessToken) return;
    try {
      const response = await fetch(
        `https://www.googleapis.com/userinfo/v2/me`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const userInfoResponse = await response.json();
      onAuthStateChanged(userInfoResponse);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <View>
      <TouchableOpacity
        style={[styles.buttonContainer, { backgroundColor: "#DB4437" }]}
        disabled={loading}
        onPress={() => promptAsync()}
      >
        <View style={{ flexDirection: "row" }}>
          <FontAwesome name="google" size={24} color="white" />
          <Text style={styles.buttonText}> Google</Text>
        </View>
        {loading && (
          <ActivityIndicator size="large" color="black" style={styles.loader} />
        )}
      </TouchableOpacity>

      <TESTNOTIF handleTokenReceived={handleTokenReceived} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 20,
    backgroundColor: "#003366",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    marginHorizontal: 10,
    alignSelf: "center",
    textAlign: "center",
  },
});
