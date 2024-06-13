import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function Notifications({
  notifications,
  loading,
  setLoading, // Add setLoading function to update loading state
  setUncheckedCount,
  totalPages,
  setPage,
  page,
}) {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const updateNotifCheck = async () => {
    try {
      notifications.forEach(async (notification) => {
        if (currentPage === page) {
          // Check visibility
          await axios.put(
            `https://api.nahtah.com/notifications/${notification._id}`,
            {
              vue: true,
            }
          );
        }
      });
    } catch (err) {
      console.log(err, "notifcations page ");
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
  const handleNotificationClick = async (notification) => {
    if (notification.redirection === null) {
      return;
    } else {
      navigation.navigate(notification.redirection, {
        id: notification._id,
      });
    }
  };
  useEffect(() => {
    setUncheckedCount(0);
  }, [notifications]);
  useEffect(() => {
    updateNotifCheck();
  }, [currentPage]);

  useFocusEffect(
    React.useCallback(() => {
      setPage(1);
      setCurrentPage(1);
    }, [])
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setLoading(true); // Set loading state to true
      setPage(currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setLoading(true); // Set loading state to true
      setPage(currentPage + 1);
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="blue" />
        ) : notifications.length === 0 ? (
          <Text style={styles.noNotificationsText}>لا يوجد إشعارات جديدة</Text>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              onPress={() => handleNotificationClick(notification)}
            >
              <View style={styles.card}>
                <Text style={styles.time}>{notification.title}</Text>
                <Text style={styles.notificationContent}>
                  {notification.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    backgroundColor: "white",
    paddingTop: 50,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  loader: {
    marginTop: 50,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  time: {
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  notificationContent: {
    fontSize: 16,
    color: "#555",
    textAlign: "right",
  },
  noNotificationsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
  },
});
