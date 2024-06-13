import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import axios from "axios";
import { FormatNumberDigitisToEn } from "../Localization";
import DatePickerModal from "./DatePicker";

export default function WorkerDetails() {
  const route = useRoute();
  const { workerId, FirstName, LastName, Age, gender } = route.params;
  const [daysOff, setDaysOff] = useState([]);
  const navigation = useNavigation();

  const [review, setReview] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const defaultUri =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg";
  const [imageUri, setImageUri] = useState(defaultUri);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const formatCustomDate = (date) => {
    let replacedText = date.replace(/\//g, "-");
    return replacedText.replace(/\//g, "-");
  };
  const datePickerComponent = React.useMemo(() => {
    return (
      <DatePickerModal
        visible={showDatePicker}
        toggleModal={toggleDatePicker}
        selectedStartDate={selectedDate}
        setSelectedStartDate={setSelectedDate}
      />
    );
  }, [showDatePicker]);

  useEffect(() => {
    axios
      .post("https://api.nahtah.com/events/review", {
        userId: workerId,
      })
      .then((response) => {
        setReview(response.data);
      })
      .catch((error) => {
        console.error("Error fetching review data:", error);
      });
    const Profile = `https://api.nahtah.com/img/${workerId}.jpg`;
    setImageUri(Profile);
    getDaysOff();
    return () => {
      showDatePicker && setShowDatePicker(false);
    };
  }, [workerId]);

  const StarRating = ({ rating }) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5).keys()].map((i) => {
          return (
            <View key={i} style={styles.starButton}>
              <Text
                style={i < rating ? styles.starFilled : styles.starUnfilled}
              >
                ★
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const handleImageError = (e) => {
    setImageUri(defaultUri);
  };
  const handleSubmitDate = () => {
    const formattedDate = formatCustomDate(selectedDate);
    axios
      .post("https://api.nahtah.com/offdays", {
        userId: workerId,
        date: formattedDate,
      })
      .then((response) => {
        if (response.status === 201) {
          getDaysOff();
        } else {
          setError(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching review data:", error);
      });
  };
  const getDaysOff = async () => {
    try {
      await axios
        .get(`https://api.nahtah.com/offdays/user/${workerId}`)
        .then((response) => {
          const daysOffData = response.data.map((item) => ({
            id: item._id,
            date: item.date,
          }));
          setDaysOff(daysOffData);
        });
    } catch (error) {
      console.error("Error fetching days off:", error);
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://api.nahtah.com/offdays/${id}`);
      getDaysOff();
    } catch (error) {
      console.error("Error fetching review data:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{
              uri: imageUri,
            }}
            style={styles.profileImage}
            onError={handleImageError}
            resizeMode="cover"
          />
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>اسم العائلة:{FirstName}</Text>
            <Text style={styles.detailText}>اسم: {LastName}</Text>
            <Text style={styles.detailText}>العمر: {Age}</Text>
            <Text style={styles.detailText}>
              جنس: {gender === "Man" ? "ذكر" : "أنثى"}
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.DaysOffTextTitle}>أضف يوم عطلة</Text>
          <View style={styles.datePickerButton}>
          {selectedDate && (
            <Text>{selectedDate}</Text>
          )}
          
            <TouchableOpacity
              onPress={toggleDatePicker}
              style={styles.datePickerBtn}
            >
              <Text style={styles.datePickerBtnText}>اختر التاريخ</Text>
            </TouchableOpacity>
          
          </View>
          {showDatePicker && datePickerComponent}
          
          {daysOff.length > 0 ? (
            <View>
              {daysOff.map((day) => {
                return (
                  <View key={day.id} style={styles.DaysOffContainer}>
                    <View style={styles.ShowOffDays}>
                      <Text style={styles.DaysOffText}>{day.date}</Text>
                      <FontAwesome
                        name="trash"
                        size={20}
                        color="red"
                        style={styles.trashIcon}
                        onPress={() =>
                          Alert.alert("هل أنت متأكد من حذف هذا التاريخ؟", "", [
                            {
                              text: "إلغاء",

                              style: "cancel",
                            },
                            {
                              text: "نعم",
                              onPress: () => handleDelete(day.id),
                            },
                          ])
                        }
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              handleSubmitDate();
            }}
          >
            <Text style={styles.datePickerBtnText}>إضافة</Text>
          </TouchableOpacity>
          {error &&
            Alert.alert(
              "لا يمكنك إضافة نفس التاريخ",
              "يرجى اختيار تاريخ مختلف.",
              [
                {
                  text: "إلغاء",
                  style: "cancel",
                  onPress: () => setError(false),
                },
              ]
            )}
        </View>
        {review.length > 0 ? (
          review
            .filter(
              (r) => r.feedback !== "Event hasn't been rated" && r.rate !== "-"
            )
            .map((r) => (
              <View key={r._id} style={styles.ReviewCard}>
                <Text style={styles.reviewText}>{r.feedback}</Text>
                <StarRating rating={r.rate} />
              </View>
            ))
        ) : (
          <Text style={styles.reviewText}>لا توجد تقييمات</Text>
        )}
      </View>
      <View style={styles.arrowBack}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-forward-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingTop: 50,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  arrowBack: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,

    elevation: 3,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  detailsContainer: {
    alignItems: "center",
  },
  detailText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  ReviewCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    marginTop: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewText: {
    textAlign: "right",
    fontSize: 16,
    marginBottom: 5,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    width: "100%",
  },
  starButton: {
    width: "20%",
    alignItems: "center",
  },
  starFilled: {
    fontSize: 50,
    color: "gold",
  },
  starUnfilled: {
    fontSize: 50,
    color: "lightgray",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-end",
    gap: 20,
    marginBottom: 20,
  },
  datePickerBtn: {
    width: "48%",
    height: 35,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 5,
    color: "#fff",
  },
  datePickerBtnText: {
    color: "#fff",
    fontSize: 18,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  submitBtn: {
    width: "100%",
    height: 40,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 5,
    color: "#fff",
    marginBottom: 20,
  },
  DaysOffContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
  },
  ShowOffDays: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
  },
  DaysOffText: {
    fontSize: 18,
    alignSelf: "center",
    fontWeight: "bold",
  },
  trashIcon: {
    marginRight: 15,
  },
  DaysOffTextTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 15,
  },
});
