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
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

export default function ChangePassword() {
  const route = useRoute();
  const { email } = route.params;
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handlePasswordChange = (password) => {
    setPassword(password);
    setPasswordError("");
  };
  const handleConfirmPasswordChange = (confirmPassword) => {
    setConfirmPassword(confirmPassword);
    setConfirmPasswordError("");
  };
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleUpdatePassword = async () => {
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
    if (confirmPassword === "") {
      setConfirmPasswordError("يرجى ملء حقل تأكيد كلمة المرور");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmation(true);
      setTimeout(() => {
        setConfirmation(false);
      }, 3000);
      return;
    }
    try {
      setLoader(true);
      await axios
        .post("https://api.nahtah.com/auth/user/resetPassword", {
          email: email,
          password: password,
        })
        .then((result) => {
          if (result.data.message === "Password updated successfully") {
            setSuccess(true);
            setLoader(false);
            setTimeout(() => {
              setSuccess(false);
              navigation.navigate("Home");
            }, 3000);
          }
        });
    } catch (error) {
      console.error("Error updating password:", error);
      setError(true);
      setLoader(false);
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.Maincontainer}>
        <View style={styles.arrowBack}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-forward-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.imgContainer}>
          <Image source={require("../../assets/Logo.png")} style={styles.img} />
        </View>
        <View style={styles.inputsContainer}>
          <TextInput
            placeholder="كلمة المرور"
            style={[styles.inputs, passwordError && styles.errorInput]}
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={handlePasswordChange}
          />
          {passwordError && passwordErrorMsg ? (
            <Text style={styles.errorText}>{passwordErrorMsg}</Text>
          ) : null}
          <TextInput
            placeholder="تأكيد كلمة المرور"
            style={[styles.inputs, confirmPasswordError && styles.errorInput]}
            value={confirmPassword}
            secureTextEntry={!showPassword}
            onChangeText={handleConfirmPasswordChange}
          />
          {confirmation ? (
            <Text style={{ color: "red" }}>كلمة المرور غير متطابقة</Text>
          ) : null}
          {success ? (
            <Text style={{ color: "green" }}>تم تغيير كلمة المرور بنجاح</Text>
          ) : null}
          <TouchableOpacity
            onPress={toggleShowPassword}
            style={styles.IconSeePassword}
          >
            <Text style={styles.showPassword}>إضغط هنا لإظهار كلمة المرور</Text>
            <FontAwesome
              name={showPassword ? "eye" : "eye-slash"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleUpdatePassword}
          >
            {loader ? (
              <ActivityIndicator animating={true} size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>إرسال</Text>
            )}
          </TouchableOpacity>
        </View>
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
  arrowBack: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 5,
    textAlign: "center",
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

  errorInput: {
    borderColor: "red",
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
  IconSeePassword: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  showPassword: {
    color: "black",
    fontSize: 14,
    marginRight: 5,
  },
});
