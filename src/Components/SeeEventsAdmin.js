import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function SeeEvents() {
  const route = useRoute();
  const { startRange, endRange, startRangTime, endRangTime } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [number, setNumber] = useState("");
  const [notFound, setNotFound] = useState(false);
  const fetchEvents = () => {
    try {
      setLoading(true);
      axios
        .post("https://api.nahtah.com/events/GetByRange", {
          startRange: startRange,
          endRange: endRange,
          startRangTime: startRangTime,
          endRangTime: endRangTime,
        })
        .then((response) => {
          setEvents(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchEvents();
    setNumber("");
    return () => {
      setEvents([]);
      setNumber("");
    };
  }, [startRange, endRange, startRangTime, endRangTime]);
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
  const filterByPhone = (number) => {
    if (number.trim() === "") {
      fetchEvents();
      return;
    }
    const filteredEvents = events.filter((event) => {
      return (
        event.client &&
        event.client.phone &&
        event.client.phone.includes(number)
      );
    });

    if (filteredEvents.length === 0) {
      setNotFound(true);
      setTimeout(() => {
        setNotFound(false);
      }, 3000);
    } else {
      setEvents(filteredEvents);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.arrowBack}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("الحجوزات");
            setNumber("");
          }}
        >
          <Ionicons name="arrow-forward-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.SearchContainer}>
        <TextInput
          placeholder="رقم الهاتف"
          style={styles.inputSearch}
          onChangeText={(number) => setNumber(number)}
          value={number}
        />
        <TouchableOpacity
          style={styles.SearChButton}
          onPress={() => filterByPhone(number)}
        >
          <Text style={{ color: "white" }}>بحث</Text>
        </TouchableOpacity>
      </View>
      {notFound && (
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          لم يتم العثور على الرقم
        </Text>
      )}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        />
      ) : events.length === 0 ? (
        <Text style={styles.noEventsText}>لا يوجد أحداث</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {events.map((event) => (
            <TouchableOpacity key={event._id} style={styles.card}>
              <View style={styles.eventDetails}>
                <Text style={styles.barberName}>{event.title}</Text>
                <View style={styles.row}>
                  <Text style={styles.Label}>الوقت: </Text>
                  <Text style={styles.Text}>{extractTime(event.start)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.Label}>التاريخ: </Text>
                  <Text style={styles.Text}>{extractDate(event.start)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.Label}>تسريحات الشعر:</Text>
                  <Text style={styles.Text}>{event.description}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.Label}> الاسم: </Text>
                  <Text style={styles.Text}>
                    {event.client
                      ? event.client.username
                      : "تم إنشاؤه بواسطة المسؤول"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.Label}> البريد الإلكتروني: </Text>
                  <Text style={styles.Text}>
                    {event.client
                      ? event.client.email
                      : "تم إنشاؤه بواسطة المسؤول"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.Label}>الهاتف: </Text>
                  <Text style={styles.Text}>
                    {event.client
                      ? event.client.phone
                      : "تم إنشاؤه بواسطة المسؤول"}
                  </Text>
                </View>
                <View style={[styles.statusContainer, getStatusStyle(event)]}>
                  <Text style={[styles.statusText]}>
                    {getStatusText(event)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    backgroundColor: "white",
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    marginTop: 20, // Adjust marginTop for better alignment
    paddingBottom: 20, // Adjust paddingBottom for better spacing
  },
  SeeButton: {
    width: "100%",
    paddingHorizontal: 20,
  },
  arrowBack: {
    position: "absolute",
    top: 45,
    right: 20,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  eventDetails: {
    flex: 1,
  },
  barberName: {
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5,
  },
  Label: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 2,
  },
  Text: {
    fontSize: 16,
    color: "#333",
  },
  statusContainer: {
    position: "absolute",
    bottom: -12,
    left: -13,
    paddingHorizontal: 5,
    borderRadius: 5,
    elevation: 5,
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
  noEventsText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20, // Adjust marginTop for better alignment
  },
  SearchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  inputSearch: {
    height: 40,
    width: "60%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  SearChButton: {
    width: "20%",
    height: 40,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginLeft: 10,
  },
});
