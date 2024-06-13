import React, { useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NewsPaperClient() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigation = useNavigation();
  const checkIfBanned = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        navigation.navigate("Logout");
        return;
      }
      const user = JSON.parse(userString);
      if (!user || user.type !== "User") return;
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
  const getNewsLetters = async () => {
    try {
      const response = await axios.get(
        `https://api.nahtah.com/newsletter?page=${currentPage}`
      );
      if (response.data) {
        setNewsletters(response.data.newsletters);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getNewsLetters();
      setCurrentPage(1);
    }, [])
  );
  useEffect(() => {
    getNewsLetters();
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
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : newsletters.length === 0 ? (
        <Text style={{ textAlign: "center" }}>لا توجد رسائل</Text>
      ) : (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>النشرات الإخبارية</Text>
        </View>
      )}
      <ScrollView>
        {newsletters.map((newsletter, index) => (
          <TouchableOpacity
            key={newsletter._id}
            style={styles.newsletterContainer}
          >
            <View>
              <Text style={styles.title}>{newsletter.title}</Text>
              <Text style={styles.text}>{newsletter.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  newsletterContainer: {
    borderWidth: 0,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    textAlign: "right",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
  },
});
