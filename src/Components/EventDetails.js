import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
export default function EventDetails() {
  const route = useRoute();
  const {
    eventId,
    barberName,
    barberImg,
    time,
    date,
    hairstyles,
    status,
    barberId,
  } = route.params;
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewAdded, setReviewAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelAllowed, setCancelAllowed] = useState(false);
  const [updateAllowed, setUpdateAllowed] = useState(false);
  const navigation = useNavigation();
  const GetEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.nahtah.com/events/id/${eventId}`
      );
      setRating(response.data.rate);
      setReview(response.data.feedback);
      if (
        response.data.rate === undefined &&
        response.data.feedback === undefined
      ) {
        setReviewAdded(false);
      } else {
        setReviewAdded(true);
      }
      const oneHourBeforeStartTime = new Date(date + " " + time);
      oneHourBeforeStartTime.setHours(oneHourBeforeStartTime.getHours() - 1);
      const currentTime = new Date();
      const adjustedTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
      const currentTimeUTC = new Date(adjustedTime.toISOString());
      if (currentTimeUTC < oneHourBeforeStartTime) {
        setCancelAllowed(true);
        setUpdateAllowed(true);
      } else {
        setCancelAllowed(false);
        setUpdateAllowed(false);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false); // Set loading to false after async operation is complete
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
  useEffect(() => {
    setLoading(true);
    GetEvent();
  }, [eventId, date, time]);

  const handleSubmitReview = () => {
    try {
      axios
        .put(`https://api.nahtah.com/events/${eventId}`, {
          feedback: review,
          rate: rating,
        })
        .then((response) => {
          axios
            .get(`https://api.nahtah.com/events/id/${eventId}`)
            .then((res) => {
              setRating(res.data.rate);
              setReview(res.data.feedback);
              setReviewAdded(true);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const HandleUpdateEvent = (eventId) => {
    navigation.navigate("UpdateEvent", {
      eventId: eventId,
      barberName: barberName,
      barberId: barberId,
      barberImg: barberImg,
      time: time,
      dateP: date,
      hairstyles: hairstyles,
      status: status,
    });
  };

  const CancelEvent = (eventId) => {
    axios
      .delete(`https://api.nahtah.com/events/${eventId}`)
      .then((response) => {
        navigation.navigate("الحجوزات");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleCancelEvent = (eventId) => {
    Alert.alert(
      "تأكيد الإلغاء",
      "هل أنت متأكد أنك تريد إلغاء الحجز؟",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "تأكيد",
          onPress: () => {
            CancelEvent(eventId);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const StarRating = ({ rating, onPress }) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onPress(index + 1)}
            style={styles.starButton}
          >
            <Text
              style={index < rating ? styles.starFilled : styles.starUnfilled}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // You can adjust the behavior based on your preference
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Loader */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <View>
            <View style={styles.arrowBack}>
              <TouchableOpacity onPress={() => navigation.navigate("الحجوزات")}>
                <Ionicons
                  name="arrow-forward-outline"
                  size={28}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.textTitle}>{barberName}</Text>
              <View style={styles.Row}>
                <Text style={styles.Label}>الوقت:</Text>
                <Text style={styles.text}>{time}</Text>
              </View>
              <View style={styles.Row}>
                <Text style={styles.Label}>التاريخ:</Text>
                <Text style={styles.text}> {date}</Text>
              </View>
              <View style={[styles.statusContainer, getStatusStyle(status)]}>
                <Text style={styles.statusText}>{status}</Text>
              </View>
              <View style={styles.Row}>
                <Text style={styles.Label}>تسريحات الشعر:</Text>
                <Text style={styles.text}>{hairstyles}</Text>
              </View>
            </View>
            {status === "منتهية" && !reviewAdded ? (
              <View>
                <View style={styles.card}>
                  <StarRating
                    rating={rating}
                    onPress={(value) => setRating(value)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="اكتب مراجعتك..."
                    value={review}
                    onChangeText={setReview}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      handleSubmitReview();
                    }}
                  >
                    <Text style={styles.buttonText}>إرسال المراجعة</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              reviewAdded && (
                <View style={styles.card}>
                  <View style={styles.Row}>
                    <Text style={styles.Label}>مراجعة:</Text>
                    <Text style={styles.text}> {review}</Text>
                  </View>
                  <View style={styles.Row}>
                    <Text style={styles.Label}>تقييم:</Text>
                    <Text style={styles.text}> {rating}</Text>
                  </View>
                </View>
              )
            )}
            <View style={styles.cardCancelUpdateContainer}>
              {cancelAllowed === true && status !== "مرفوضة" && (
                <TouchableOpacity
                  onPress={() => {
                    handleCancelEvent(eventId);
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>إلغاء الحجز</Text>
                </TouchableOpacity>
              )}
              {updateAllowed === true && status !== "مرفوضة" && (
                <TouchableOpacity
                  onPress={() => {
                    HandleUpdateEvent(eventId);
                  }}
                  style={styles.updateButton}
                >
                  <Text style={styles.buttonText}>تعديل الحجز</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 50,
    backgroundColor: "white",
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
    shadowRadius: 3.84,
    elevation: 5,
  },
  arrowBack: {
    position: "absolute",
    top: -35,
    right: 20,
  },
  cardCancelUpdateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    width: "45%",
    backgroundColor: "#FF5722", // Red color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 18,
  },
  updateButton: {
    width: "45%",
    backgroundColor: "#285F8F", // Blue color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
  textTitle: {
    textAlign: "right",
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
  statusContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
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
  approved: {
    backgroundColor: "#4CAF50",
  },
  declined: {
    backgroundColor: "#FF5722",
  },
  waiting: {
    backgroundColor: "#FF9800",
  },
  done: {
    backgroundColor: "#4CAF50",
  },
  input: {
    textAlign: "right",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    width: "100%",
  },
  starButton: {
    width: "20%", // Set equal width for each star
    alignItems: "center",
  },
  starFilled: {
    fontSize: 50, // Increase font size for filled star
    color: "gold",
  },
  starUnfilled: {
    fontSize: 50, // Increase font size for unfilled star
    color: "lightgray",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#285F8F",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
const getStatusStyle = (status) => {
  switch (status) {
    case "موافقة":
      return styles.approved;
    case "مرفوضة":
      return styles.declined;
    case "منتظر":
      return styles.waiting;
    case "منتهية":
      return styles.done;
    default:
      return {};
  }
};
