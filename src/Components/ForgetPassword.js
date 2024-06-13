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
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleEmailChange = (email) => {
    setEmail(email);
    setEmailError("");
  };
  const handleCodeChange = (code) => {
    setCode(code);
    setCodeError("");
  };

  const handleForgetPassword = async () => {
    if (email === "") {
      setEmailError("يرجى ملء حقل البريد الإلكتروني");
      setLoader(false);
      return;
    }
    try {
      setLoader(true);
      await axios
        .post("https://api.nahtah.com/auth/user/forgetPassword", {
          email: email,
        })
        .then((result) => {
          if (result.data.message === "User not found") {
            setEmailError("البريد الإلكتروني غير موجود");
            setLoader(false);
            setError(true);
            setTimeout(() => {
              setError(false);
            }, 3000);
            return;
          } else {
            setLoader(false);
            setSuccess(true);
            setModalVisible(true);
            setTimeout(() => {
              setSuccess(false);
            }, 3000);
          }
        })
        .catch((err) => {
          console.log(err.messa);
          setLoader(false);
        });
    } catch (error) {
      setLoader(false);
    }
  };
  const checkCodeValidation = async () => {
    if (code === "") {
      setCodeError("يرجى ملء حقل كود التحقق");
      setLoader(false);
      return;
    }
    try {
      setLoader(true);
      await axios
        .post("https://api.nahtah.com/auth/user/validateCode", {
          email: email,
          code: code,
        })
        .then((result) => {
          if (
            result.data.message === "User not found" ||
            result.data.valid === false
          ) {
            setCodeError("كود التحقق غير صحيح أو البريد الإلكتروني غير صحيح");
            setLoader(false);
            setError(true);
            setTimeout(() => {
              setError(false);
            }, 3000);
            return;
          } else if (result.data.valid === true) {
            setLoader(false);
            setEmail("");
            // setModalVisible(false);
            navigation.navigate("ChangePassword", { email: email });
          }
        })
        .catch((err) => {
          console.log(err);
          setLoader(false);
        });
    } catch (error) {
      setLoader(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.Maincontainer}>
        <View style={styles.arrowBack}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-forward-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
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
          {emailError ? (
            <Text style={{ color: "red" }}>{emailError}</Text>
          ) : null}
          {success ? (
            <Text style={{ color: "green" }}>تم إرسال كلمة المرور بنجاح</Text>
          ) : null}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleForgetPassword}
          >
            {loader ? (
              <ActivityIndicator animating={true} size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>إرسال</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.CodeHere}>هل لديك كود التحقق؟</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView style={{ width: "100%" }}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>إلغاء</Text>
                </TouchableOpacity>
                <Text style={styles.ModalText}>
                  أدخل كود التحقق المرسل على البريد الإلكتروني
                </Text>
                <TextInput
                  placeholder="البريد الإلكتروني"
                  style={[styles.inputs2, emailError && styles.errorInput]}
                  value={email}
                  keyboardType="email-address"
                  onChangeText={handleEmailChange}
                />
                <TextInput
                  placeholder="كود التحقق"
                  style={[styles.codeInput]}
                  value={code}
                  keyboardType="default"
                  onChangeText={handleCodeChange}
                />
                {error ? (
                  <Text style={{ color: "red", textAlign: "center" }}>
                    {codeError}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.buttonContainer2}
                  onPress={checkCodeValidation}
                >
                  {loader ? (
                    <ActivityIndicator
                      animating={true}
                      size="small"
                      color="#fff"
                    />
                  ) : (
                    <Text style={styles.buttonText2}>تسجيل الدخول</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  CodeHere: {
    color: "#003366",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "92%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    maxHeight: "95%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cancelText: {
    textAlign: "right",
    fontSize: 18,
    color: "red",
    marginBottom: 10,
  },
  ModalText: {
    textAlign: "right",
    fontSize: 18,
    marginBottom: 10,
  },
  codeInput: {
    textAlign: "right",
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    padding: 10,
    height: 45,
    margin: 10,
    alignSelf: "center",
  },
  buttonContainer2: {
    backgroundColor: "#003366",
    width: "80%",
    padding: 10,
    borderRadius: 5,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
  },

  inputs2: {
    textAlign: "right",
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    padding: 10,
    height: 45,
    margin: 10,
    alignSelf: "center",
  },
  buttonText2: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
