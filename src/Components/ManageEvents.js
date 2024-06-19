import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import { Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  FormatNumberDigitisToEn,
  FormatNumberDigitsToEnglish,
} from "../Localization";
import SocketIOClient from "socket.io-client/dist/socket.io.js";

const socket = SocketIOClient("https://api.nahtah.com");
export default function ManageEvents({ triggerGetEvents }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [UsersIds, setUsersIds] = useState([]);

  useEffect(() => {
    socket.on("newEvent", (data) => {
      setEvents((prevEvents) => [data, ...prevEvents]);
      triggerGetEvents();
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  const makePhoneCall = (phoneNumber) => {
    if (phoneNumber === "") {
      return;
    }
    let phoneURL = `tel:${phoneNumber}`;
    Linking.openURL(phoneURL).catch((err) => console.error("Error:", err));
  };

  const getUsers = async () => {
    try {
      const response = await axios.get("https://api.nahtah.com/usersConnected");
      const keys = Object.keys(response.data);
      axios.get("https://api.nahtah.com/auth/user").then((res) => {
        const usersWithMatchingIds = res.data.filter((user) =>
          keys.includes(user._id)
        );
        setUsersIds(usersWithMatchingIds.map((user) => user._id));
      });
    } catch (error) {
      console.log("error", error);
    }
  };
  const getEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `https://api.nahtah.com/events/status`,
        {
          status: filterStatus,
        }
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      getEvents();
      getUsers();
    }, [filterStatus])
  );

  const FormatTime = (time) => {
    const formattedTime = new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return FormatNumberDigitsToEnglish(formattedTime);
  };

  const HandleChangeStatus = async (
    eventId,
    status,
    clientId,
    currentDate,
    title
  ) => {
    await axios
      .put(`https://api.nahtah.com/events/accept/${eventId}`, {
        status: status,
        client: clientId && clientId._id ? clientId._id : null,
      })
      .then(() => {
        const updatedEvents = events.map((event) => {
          if (event._id === eventId) {
            return { ...event, status: status };
          }
          return event;
        });
        setEvents(updatedEvents);
        triggerGetEvents();
        UsersIds.forEach(async (UserId) => {
          if (
            UsersIds.length > 0 &&
            clientId &&
            clientId._id &&
            ((UserId === clientId._id && status === true) ||
              (UserId === clientId._id && status === false))
          ) {
            await axios.post("https://api.nahtah.com/notifications/", {
              title: status === true ? " قبول الموعد" : " رفض الموعد",
              text:
                status === true
                  ? `لقد تم قبول موعد الحلاقة الخاص بك بتاريخ ${
                      currentDate.split(" ")[0]
                    } على الساعة ${currentDate.split(" ")[1]}`
                  : `لقد تم رفض موعد الحلاقة الخاص بك بتاريخ ${
                      currentDate.split(" ")[0]
                    } على الساعة ${currentDate.split(" ")[1]}`,
              redirection: "الحجوزات",
              client: UserId,
            });
            await axios.post("https://api.nahtah.com/send", {
              userId: UserId,
              title: status === true ? " قبول الموعد" : " رفض الموعد",
              body:
                status === true
                  ? `لقد تم قبول موعد الحلاقة الخاص بك بتاريخ ${
                      currentDate.split(" ")[0]
                    } على الساعة ${currentDate.split(" ")[1]}`
                  : `لقد تم رفض موعد الحلاقة الخاص بك بتاريخ ${
                      currentDate.split(" ")[0]
                    } على الساعة ${currentDate.split(" ")[1]}`,
              channelId: "إشعارات",
            });
          }
        });
      })
      .catch((error) => {
        console.error("Error updating event status:", error);
      });
  };

  // Filter events based on status
  const filteredEvents = events.filter((event) => {
    return event.status === filterStatus;
  });
  const getStatusStyle = (event) => {
    if (event.status === null) {
      return styles.waiting; // Waiting
    } else if (event.status === true) {
      return styles.approved; // Approved
    } else if (event.status === true) {
      return styles.done; // Done
    } else if (event.status === false) {
      return styles.declined; // Declined
    }
  };
  const getStatusText = (event) => {
    if (event.status === null) {
      return "منتظر"; // Waiting
    } else if (event.status === true) {
      return "مقبولة";
    } else if (event.status === false) {
      return "مرفوضة";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilterStatus(null)}
          style={[
            styles.filterButton,
            filterStatus === null && styles.activeFilterButton,
            styles.waitingButton,
          ]}
        >
          <Text style={styles.filterText}> الحجوزات المنتظرة </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterStatus(true)}
          style={[
            styles.filterButton,
            filterStatus === true && styles.activeFilterButton,
            styles.approvedButton,
          ]}
        >
          <Text style={styles.filterText}>الحجوزات المقبولة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterStatus(false)}
          style={[
            styles.filterButton,
            filterStatus === false && styles.activeFilterButton,
            styles.declinedButton,
          ]}
        >
          <Text style={styles.filterText}> الحجوزات المرفوضة </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          {filteredEvents.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              لا توجد أحداث
            </Text>
          ) : (
            filteredEvents.map((event) => (
              <View key={event._id} style={styles.eventContainer}>
                <Text style={styles.title}>{event.title}</Text>
                <View style={styles.row}>
                  <Text style={styles.Label}> التاريخ: </Text>
                  <Text style={styles.Text}>
                    {FormatNumberDigitisToEn(event.start)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.Label}> البداية: </Text>

                  <Text style={styles.Text}>{FormatTime(event.start)}</Text>
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
                  <Text style={styles.Label}> الهاتف: </Text>
                  <Text
                    style={[
                      styles.Text,
                      event.client && event.client.phone
                        ? styles.phoneWithNumber
                        : styles.phoneWithoutNumber,
                    ]}
                    onPress={() =>
                      makePhoneCall(event.client ? event.client.phone : "")
                    }
                  >
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

                {event.status !== true && event.status !== false && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        HandleChangeStatus(
                          event._id,
                          true,
                          event.client,
                          event.start,
                          event.title
                        )
                      }
                      style={styles.statusButton}
                    >
                      <Icon name="check" size={18} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        HandleChangeStatus(
                          event._id,
                          false,
                          event.client,
                          event.start,
                          event.title
                        )
                      }
                      style={styles.statusButton}
                    >
                      <Icon name="times" size={18} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 50,
    backgroundColor: "white",
  },

  activeFilterButton: {
    borderColor: "#003366",
    borderWidth: 1.6,
    opacity: 0.8,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eventContainer: {
    width: windowWidth * 0.9,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },
  title: {
    textAlign: "right",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5,
  },
  Label: {
    fontSize: windowWidth * 0.04,
    fontWeight: "bold",
    marginLeft: 2,
  },
  phoneWithNumber: {
    color: "#3498db",
    textDecorationLine: "underline",
  },
  Text: {
    fontSize: windowWidth * 0.04,
    color: "#333",
    flexWrap: "wrap",
    flex: 1,
    textAlign: "right",
  },
  statusContainer: {
    position: "absolute",
    bottom: 8,
    left: 5,
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
    color: "#fff",
    textAlign: "center",
  },
  waitingButton: {
    backgroundColor: "#3498db",
  },
  approvedButton: {
    backgroundColor: "#2ecc71",
  },
  declinedButton: {
    backgroundColor: "#e74c3c",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statusButton: {
    borderRadius: 5,
    padding: 10,
  },
});
