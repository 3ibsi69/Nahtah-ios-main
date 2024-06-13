import React, { useEffect, useState, useContext } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import "expo-dev-client";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import SharedStateContext from "../../SharedStateContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TESTNOTIF from "./TESTNOTIF";
import axios from "axios";
import { SocialIcon } from "react-native-elements";

export default function GoogleUp() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [idToken, setIdToken] = useState();
  const [loading, setLoading] = useState(false);

  const { isLoggedIn, setIsLoggedIn } = useContext(SharedStateContext);
  const { isAdmin, setIsAdmin } = useContext(SharedStateContext);

  const handleTokenReceived = (receivedToken) => {
    if (receivedToken) {
      AsyncStorage.setItem("expoPushToken", receivedToken);
      AsyncStorage.getItem("user").then((User) => {
        if (User) {
          SaveTokenAndUserId(receivedToken, JSON.parse(User)._id);
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

  GoogleSignin.configure({
    webClientId:
      "1027183268875-nc0ogp5rouh2kufebjojdklinu62sht0.apps.googleusercontent.com",
  });

  const onAuthStateChanged = (user) => {
    setUser(user);
    if (user) {
      setLoading(true); // Set loading to true when user is available
      user.getIdToken().then(setIdToken); // Set the ID token when user is available
      axios
        .post("https://api.nahtah.com/auth/user/signup", {
          email: user.email,
          username: user.displayName,
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
                  await GoogleSignin.revokeAccess();
                  await GoogleSignin.signOut();
                  await auth().signOut();
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

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber(); // Unsubscribe from the listener on unmount
  }, []);

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.log("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return null;

  if (!user) {
    return (
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={onGoogleButtonPress}
          disabled={loading}
        >
          <SocialIcon type="google" iconSize={25} />
          {loading && (
            <ActivityIndicator
              size="large"
              color="black"
              style={styles.loader}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={onGoogleButtonPress}
        disabled={loading}
      >
        <SocialIcon type="google" iconSize={25} />
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
});
