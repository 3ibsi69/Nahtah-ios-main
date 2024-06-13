import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [TotalUsersInCurrentPage, setTotalUsersInCurrentPage] = useState(0);
  const navigation = useNavigation();
  const [isBanned, setIsBanned] = useState(false);
  const [ShowPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loader, setLoader] = useState(false);
  const handlePhoneChange = (text) => {
    setPhone(text);
    setPhoneErr(false);
  };
  const handleSearchPhone = async () => {
    if (phone.length === 0) {
      setPhoneErr(true);
      return;
    } else {
      setLoader(true);
      try {
        const response = await axios.post(
          `https://api.nahtah.com/auth/user/getByPhone`,
          {
            phone: phone,
          }
        );
        if (response.data.msg === "not found") {
          setNotFound(true);
          setTimeout(() => {
            setNotFound(false);
          }, 3000);
          setLoader(false);
        } else {
          setUsers(response.data.Users); // Update this line
          setTotalPages(1);
          setTotalUsersInCurrentPage(response.data.Users.length); // Update this line
          setShowPhone(false);
          setIsBanned(undefined);
          setLoader(false);
          setPhone("");
        }
      } catch (error) {
        console.error("Error searching by phone:", error);
        setLoader(false);
      }
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (isBanned === true || isBanned === false) {
        const response = await axios.post(
          `https://api.nahtah.com/auth/user/filterBanned?page=${currentPage}`,
          {
            banned: isBanned,
          }
        );
        setUsers(response.data.Users);
        setTotalPages(response.data.totalPages);
        setTotalUsersInCurrentPage(response.data.TotalUsersInCurrentPage);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsBanned(false);
      fetchUsers();
      setCurrentPage(1);
    }, [])
  );
  useEffect(() => {
    fetchUsers();
    setCurrentPage(1);
  }, [isBanned]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleBan = async (userId, banStatus) => {
    try {
      await axios.put(`https://api.nahtah.com/auth/user/${userId}`, {
        banned: banStatus,
      });
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, banned: banStatus } : user
        )
      );
      setTotalUsersInCurrentPage((prevTotal) =>
        banStatus ? prevTotal - 1 : prevTotal + 1
      );
      if (TotalUsersInCurrentPage === 1 && currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
      }
      fetchUsers();
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setIsBanned(false)}
          style={[
            styles.filterButton,
            isBanned === false && styles.activeFilterButton,
            styles.NotBannedButton,
          ]}
        >
          <Text style={styles.filterText}> الغير محظورين </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsBanned(true)}
          style={[
            styles.filterButton,
            isBanned === true && styles.activeFilterButton,
            styles.BannedButton,
          ]}
        >
          <Text style={styles.filterText}> المحظورين </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowPhone(true)}
          style={[
            styles.filterButton,
            isBanned === undefined && styles.activeFilterButton,
            styles.SearPhoneButton,
          ]}
        >
          <Text style={styles.filterText}>البحث بالهاتف</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      ) : users.length === 0 ? (
        <View style={styles.scrollView}>
          <Text style={styles.noUsersText}>لا يوجد مستخدمين</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scrollView]}>
          {users.map((user) => (
            <View key={user._id} style={styles.card}>
              <Text style={styles.title}>معلومات المستخدم</Text>
              <View style={[styles.labelContainer]}>
                <Text style={styles.label}>اسم المستخدم:</Text>
                <Text style={styles.text}>{user.username}</Text>
              </View>
              <View style={[styles.labelContainer]}>
                <Text style={styles.label}>بريد إلكتروني:</Text>
                <Text style={styles.text}>{user.email}</Text>
              </View>
              <View style={[styles.labelContainer]}>
                <Text style={styles.label}>رقم الهاتف</Text>
                {user.phone ? (
                  user.phone.length === 0 ? (
                    <Text style={styles.text}>لا يوجد رقم الهاتف</Text>
                  ) : (
                    <Text style={styles.text}>{user.phone}</Text>
                  )
                ) : (
                  <Text style={styles.text}>غير متوفر </Text>
                )}
              </View>
              <View style={styles.buttonContainer}>
                {user.banned ? (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#285F8F" }]}
                    onPress={() => handleBan(user._id, false)}
                  >
                    <Text style={styles.buttonText}>رفع الحظر</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#D9534F" }]}
                    onPress={() => handleBan(user._id, true)}
                  >
                    <Text style={styles.buttonText}>الحظر</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.pagination}>
        <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 1}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentPage === 1 ? "gray" : "black"}
          />
        </TouchableOpacity>
        <Text>
          {currentPage}/{totalPages}
        </Text>
        <TouchableOpacity
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={currentPage === totalPages ? "gray" : "black"}
          />
        </TouchableOpacity>
      </View>
      <Modal visible={ShowPhone} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ width: "100%" }}>
              <TouchableOpacity onPress={() => setShowPhone(false)}>
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.inputs,
                  phoneErr && { borderColor: "red", borderWidth: 1 },
                ]}
                keyboardType="phone-pad"
                placeholder="رقم الهاتف"
                value={phone}
                onChangeText={handlePhoneChange}
              />
              {notFound && (
                <Text style={{ color: "red", textAlign: "center" }}>
                  لم يتم العثور على المستخدم
                </Text>
              )}
              <TouchableOpacity
                style={styles.sendBtn2}
                onPress={handleSearchPhone}
              >
                {loader ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>بحث</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 40,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  activeFilterButton: {
    borderColor: "#003366",
    borderWidth: 1.6,
    opacity: 0.8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  labelContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginRight: 5,
    marginLeft: 5,
  },
  text: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "80%",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  noUsersText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "white",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignSelf: "center",
    justifyContent: "space-between",
    width: windowWidth * 0.8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: "center",
    maxWidth: 150,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  NotBannedButton: {
    backgroundColor: "#4CAF50",
  },
  BannedButton: {
    backgroundColor: "#D9534F",
  },
  SearPhoneButton: {
    backgroundColor: "#003366",
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
  inputs: {
    textAlign: "right",
    borderWidth: 1,
    borderColor: "black",
    width: "80%",
    padding: 10,
    height: 45,
    margin: 10,
    alignSelf: "center",
  },
  sendBtn2: {
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
  cancelText: {
    textAlign: "right",
    fontSize: 18,
    color: "red",
    marginBottom: 10,
  },
});
