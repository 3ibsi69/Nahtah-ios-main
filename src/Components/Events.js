import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigation = useNavigation();

  const fetchEvents = async () => {
    setLoading(true);
    const userString = await AsyncStorage.getItem("user");
    const user = JSON.parse(userString);
    if (user) {
      axios
        .get(
          `https://api.nahtah.com/events/client/${user._id}?page=${currentPage}`
        )
        .then((response) => {
          if (response.data.message === "No events found") {
            setEvents([]);
            setLoading(false);
          } else {
            setEvents(response.data.sortedEvents);
            setTotalPages(response.data.totalPages);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
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
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      setCurrentPage(1);
    }, [])
  );
  useEffect(() => {
    fetchEvents();
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
  const handleCardPress = (event) => {
    navigation.navigate("Details", {
      eventId: event._id,
      barberName: event.title,
      barberImg: event.barberImg,
      barberId: event.userId,
      time: extractTime(event.start),
      date: extractDate(event.start),
      hairstyles: event.description,
      status: getStatusText(event),
    });
  };

  const parseDate = (dateStr) => {
    const [year, month, day, hour, minute, period] = dateStr.split(/[- :]/);
    let adjustedHour = parseInt(hour);
    if (period === "PM" && adjustedHour !== 12) {
      adjustedHour += 12;
    }
    return new Date(year, month - 1, day, adjustedHour, minute);
  };

  const getStatusStyle = (event) => {
    const eventTimeEnd = parseDate(event.end);
    const currentTime = new Date();
    const adjustedTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const adjustedTimeEnd = new Date(eventTimeEnd.getTime() + 60 * 60 * 1000);
    const currentTimeUTC = new Date(adjustedTime.toISOString());
    if (event.status === null) {
      return styles.waiting; // Waiting
    } else if (event.status === true && currentTimeUTC < adjustedTimeEnd) {
      return styles.approved; // Approved
    } else if (event.status === true && currentTimeUTC >= adjustedTimeEnd) {
      return styles.done; // Done
    } else if (event.status === false) {
      return styles.declined; // Declined
    }
  };

  const getStatusText = (event) => {
    const eventTimeEnd = parseDate(event.end);
    const currentTime = new Date();
    const adjustedTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const adjustedTimeEnd = new Date(eventTimeEnd.getTime() + 60 * 60 * 1000);
    const currentTimeUTC = new Date(adjustedTime.toISOString());
    if (event.status === null) {
      return "منتظر"; // Waiting
    } else if (event.status === true && currentTimeUTC < adjustedTimeEnd) {
      return "موافقة"; // Approved
    } else if (event.status === true && currentTimeUTC >= adjustedTimeEnd) {
      return "منتهية"; // Done
    } else if (event.status === false) {
      return "مرفوضة"; // Declined
    }
  };

  const extractDate = (dateTimeStr) => {
    const [time] = dateTimeStr.split(" ");
    return time;
  };

  const extractTime = (dateTimeStr) => {
    const [, date] = dateTimeStr.split(" ");
    return date;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loading}
          />
        ) : events.length === 0 ? (
          <Text style={styles.noEventsText}>لا تتوفر أحداث</Text>
        ) : (
          events.map((event) => (
            <TouchableOpacity
              key={event._id}
              style={styles.card}
              onPress={() => handleCardPress(event)}
            >
              <View style={styles.eventDetails}>
                <Text style={styles.barberName}>{event.title}</Text>
                <View style={styles.Row}>
                  <Text style={styles.Label}>الوقت: </Text>
                  <Text style={styles.time}>{extractTime(event.start)}</Text>
                </View>
                <View style={styles.Row}>
                  <Text style={styles.Label}>التاريخ: </Text>
                  <Text style={styles.time}>{extractDate(event.start)}</Text>
                </View>
                <View style={styles.Row}>
                  <Text style={styles.Label}>تسريحات الشعر:</Text>
                  <Text style={styles.description}>{event.description}</Text>
                </View>
                <View style={[styles.statusContainer, getStatusStyle(event)]}>
                  <Text style={[styles.statusText]}>
                    {getStatusText(event)}
                  </Text>
                </View>
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
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 50,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
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
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  eventDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "right",
  },
  Row: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },

  Label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 5,
  },
  time: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 18,
    marginBottom: 8,
  },
  statusContainer: {
    position: "absolute",
    bottom: -10,
    left: -5,
    paddingHorizontal: 5,
    borderRadius: 5,
    // For Android
    elevation: 5,
    // For iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    paddingVertical: 2,
    textTransform: "capitalize",
  },
  done: {
    backgroundColor: "#4CAF50",
  },
  approved: {
    backgroundColor: "#4CAF50",
  },
  declined: {
    backgroundColor: "#FF5722",
  },
  waiting: {
    backgroundColor: "#FF9800",
  },
  styles: {
    fontSize: 14,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
  },
  loading: {
    justifyContent: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "white",
  },
});
