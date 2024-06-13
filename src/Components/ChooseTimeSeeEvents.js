import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { FormatNumberDigitisToEn } from "../Localization";
import DatePickerModal from "./DatePickerNoMin";

export default function ChooseTimeSeeEvents() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);
  const [timeOptions, setTimeOptions] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [showAll, setShowAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const [selectedDateEnd, setSelectedDateEnd] = useState("");
  const toggleDatePickerEnd = () => {
    setShowDatePickerEnd(!showDatePickerEnd);
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
  const datePickerComponentEnd = React.useMemo(() => {
    return (
      <DatePickerModal
        visible={showDatePickerEnd}
        toggleModal={toggleDatePickerEnd}
        selectedStartDate={selectedDateEnd}
        setSelectedStartDate={setSelectedDateEnd}
      />
    );
  }, [showDatePickerEnd]);

  const fetchTimeOptions = () => {
    setTimeOptions([
      "00:00",
      "00:30",
      "01:00",
      "01:30",
      "02:00",
      "02:30",
      "03:00",
      "03:30",
      "04:00",
      "04:30",
      "05:00",
      "05:30",
      "06:00",
      "06:30",
      "07:00",
      "07:30",
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
      "22:30",
      "23:00",
      "23:30",
    ]);

    setLoading(false);
  };

  const handleTimeOptionSelection = (value) => {
    if (selectedStartTime === null && selectedEndTime === null) {
      setSelectedStartTime(value);
    } else if (selectedStartTime !== null && selectedEndTime === null) {
      if (value === selectedStartTime) {
        setSelectedStartTime(null);
      } else if (value > selectedStartTime) {
        setSelectedEndTime(value);
      } else {
        setSelectedEndTime(selectedStartTime);
        setSelectedStartTime(value);
      }
    } else {
      if (value === selectedEndTime) {
        setSelectedEndTime(null);
      } else if (value > selectedStartTime) {
        setSelectedEndTime(value);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTimeOptions();
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      setShowAll(false);
    }, [])
  );
  const handlePressSend = () => {
    if (selectedStartTime === null || selectedEndTime === null) {
      Alert.alert("يرجى تحديد الوقت", "", [{ text: "حسناً" }]);
      return;
    } else if (selectedDate === "" || selectedDateEnd === "") {
      Alert.alert("يرجى تحديد التاريخ", "", [{ text: "حسناً" }]);
      return;
    } else if (
      formatCustomDate(selectedDate) > formatCustomDate(selectedDateEnd)
    ) {
      Alert.alert("تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء", "", [
        { text: "حسناً" },
      ]);
      return;
    } else {
      const selectedDateString = formatCustomDate(selectedDate);
      const selectedDateStringEnd = formatCustomDate(selectedDateEnd);
      navigation.navigate("SeeEventsAdmin", {
        startRange: selectedDateString,
        endRange: selectedDateStringEnd,
        startRangTime: selectedStartTime,
        endRangTime: selectedEndTime,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.datePickerContainer}>
        <View
          style={[styles.datePickerButton, !selectedDate && { width: "90%" }]}
        >
          {Platform.OS === "android" && (
            <>
              <Text style={styles.selectedDateText}>{selectedDate}</Text>
            </>
          )}
          <TouchableOpacity
            onPress={toggleDatePicker}
            style={styles.datePickerBtn}
          >
            <Text style={styles.datePickerBtnText}>اختر تاريخ البدء</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && datePickerComponent}
        <View
          style={[
            styles.datePickerButton,
            !selectedDateEnd && { width: "90%" },
          ]}
        >
          {Platform.OS === "android" && (
            <>
              <Text style={styles.selectedDateText}>{selectedDateEnd}</Text>
            </>
          )}
          <TouchableOpacity
            onPress={toggleDatePickerEnd}
            style={styles.datePickerBtn}
          >
            <Text style={styles.datePickerBtnText}> اختر تاريخ الانتهاء</Text>
          </TouchableOpacity>
        </View>
        {showDatePickerEnd && datePickerComponentEnd}
      </View>

      <View style={styles.Squares}>
        <View style={styles.BlueSquare}></View>
        <Text style={styles.textTimeS}>الوقت البدء</Text>
        <View style={styles.RedSquare}></View>
        <Text style={styles.textTimeS}>الوقت الانتهاء</Text>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        />
      ) : (
        <ScrollView style={styles.scrollViewContainer}>
          {timeOptions.length === 0 ? (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text>لا يوجد أحداث</Text>
            </View>
          ) : (
            <View style={styles.timeOptionsContainer}>
              {showAll
                ? timeOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.timeOption,
                        (option === selectedStartTime &&
                          styles.selectedStartTimeOption) ||
                          (option === selectedEndTime &&
                            styles.selectedEndTimeOption),
                      ]}
                      onPress={() => handleTimeOptionSelection(option)}
                    >
                      <Text style={styles.textTime}>{option}</Text>
                    </TouchableOpacity>
                  ))
                : timeOptions.slice(0, 8).map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.timeOption,
                        (option === selectedStartTime &&
                          styles.selectedStartTimeOption) ||
                          (option === selectedEndTime &&
                            styles.selectedEndTimeOption),
                      ]}
                      onPress={() => handleTimeOptionSelection(option)}
                    >
                      <Text style={styles.textTime}>{option}</Text>
                    </TouchableOpacity>
                  ))}
            </View>
          )}
          {timeOptions.length > 8 && (
            <TouchableOpacity
              title={showAll ? "Show Less" : "Show All"}
              onPress={() => setShowAll(!showAll)}
              style={styles.ArrowBtn}
            >
              <FontAwesome
                name={showAll ? "caret-up" : "caret-down"}
                size={35}
                color="#003366"
              />
            </TouchableOpacity>
          )}

          <View style={styles.SeeButton}>
            <TouchableOpacity
              onPress={() => {
                handlePressSend();
              }}
              style={styles.datePickerBtnSubmit}
            >
              <Text style={styles.datePickerBtnText}>عرض الأحداث</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "white",
    alignItems: "center",
  },
  scrollViewContainer: {
    flexGrow: 1,
    marginTop: 20,
    paddingBottom: 20,
  },
  SeeButton: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  datePickerBtnSubmit: {
    width: "100%",
    height: 45,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  datePickerContainer: {
    width: "60%",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 10,
  },
  datePickerBtn: {
    width: "50%",
    height: 45,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  datePickerBtnText: {
    color: "#fff",
    fontSize: 16,
  },

  timeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  timeOption: {
    width: "25%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#aaa",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  selectedStartTimeOption: {
    backgroundColor: "#336699",
  },
  selectedEndTimeOption: {
    backgroundColor: "#FF6666",
  },
  textTime: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
  },
  Squares: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  BlueSquare: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
    backgroundColor: "#336699",
    borderRadius: 2,
  },
  RedSquare: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
    backgroundColor: "red",
    borderRadius: 2,
  },
  textTimeS: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
  },
  ArrowBtn: {
    marginTop: 10,
    alignItems: "center",
  },
});
