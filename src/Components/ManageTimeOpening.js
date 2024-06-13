import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import TimePickerExample from "./ClockPicker";

export default function ManageTimeOpening() {
  const [initialTimeOpen, setInitialTimeOpen] = useState(new Date());
  const [initialTimeClose, setInitialTimeClose] = useState(new Date());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTimeEnd, setSelectedTimeEnd] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimePickerEnd, setShowTimePickerEnd] = useState(false);
  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker);
  };
  const toggleTimePickerEnd = () => {
    setShowTimePickerEnd(!showTimePickerEnd);
  };
  const TimePickerComponentEnd = React.useMemo(() => {
    return (
      <TimePickerExample
        visible={showTimePickerEnd}
        toggleModal={toggleTimePickerEnd}
        time={selectedTimeEnd}
        setTime={setSelectedTimeEnd}
      />
    );
  }, [showTimePickerEnd]);
  const TimePickerComponent = React.useMemo(() => {
    return (
      <TimePickerExample
        visible={showTimePicker}
        toggleModal={toggleTimePicker}
        time={selectedTime}
        setTime={setSelectedTime}
      />
    );
  }, [showTimePicker]);

  const formatTime = (inputTime) => {
    const hours = inputTime.getHours();
    const minutes = inputTime.getMinutes();
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const getTime = async () => {
    try {
      const response = await axios.post("https://api.nahtah.com/store/findOne");
      if (
        !response.data ||
        !response.data.timeOpen ||
        !response.data.timeClose
      ) {
        return;
      }

      const { timeOpen: open, timeClose: close } = response.data;

      // Parse the date strings into Date objects
      const openTime = new Date(open);
      const closeTime = new Date(close);

      // Subtract one hour from the opening and closing times
      openTime.setHours(openTime.getHours() - 1);
      closeTime.setHours(closeTime.getHours() - 1);

      // Set the state with the modified Date objects
      setInitialTimeOpen(openTime); // Set initial opening time
      setInitialTimeClose(closeTime); // Set initial closing time
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getTime();
    }, [])
  );

  const sendData = async () => {
    const userString = await AsyncStorage.getItem("user");
    if (!userString) {
      Alert.alert("يرجى تسجيل الدخول للمتابعة");
      return;
    }
    if (!selectedTime || !selectedTimeEnd) {
      Alert.alert(" يرجى اختيار وقت الفتح والإغلاق");
      return;
    }
    const user = JSON.parse(userString);
    try {
      const data = {
        timeOpen: selectedTime,
        timeClose: selectedTimeEnd,
      };
      axios
        .post("https://api.nahtah.com/store", {
          timeOpen: data.timeOpen,
          timeClose: data.timeClose,
          userId: user._id,
        })
        .then((response) => {
          setSelectedTime("");
          setSelectedTimeEnd("");
          getTime();
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16, marginBottom: 20, fontWeight: "bold" }}>
        الوقت الحالي للفتح: {formatTime(initialTimeOpen)}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20, fontWeight: "bold" }}>
        الوقت الحالي للإغلاق: {formatTime(initialTimeClose)}
      </Text>

      <View style={styles.timePickerButton}>
        <Text style={styles.selectedTimeText}>{selectedTime}</Text>
        <TouchableOpacity
          onPress={toggleTimePicker}
          style={styles.timePickerBtn}
        >
          <Text style={styles.timePickerBtnText}>اختر وقت الفتح</Text>
        </TouchableOpacity>
      </View>
      {showTimePicker && TimePickerComponent}
      <View style={styles.timePickerButton}>
        <Text style={styles.selectedTimeText}>{selectedTimeEnd}</Text>
        <TouchableOpacity
          onPress={toggleTimePickerEnd}
          style={styles.timePickerBtn}
        >
          <Text style={styles.timePickerBtnText}>اختر وقت الإغلاق</Text>
        </TouchableOpacity>
      </View>
      {showTimePickerEnd && TimePickerComponentEnd}

      {showSuccessMessage && (
        <Text style={styles.successMessage}>تم حفظ البيانات بنجاح</Text>
      )}
      <TouchableOpacity onPress={sendData} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>حفظ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  selectedTimeText: {
    fontSize: 18,
    marginRight: 10,
    color: "#555",
    fontWeight: "bold",
  },
  timePickerBtn: {
    width: 150,
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5,
  },
  timePickerBtnText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    width: "80%",
    backgroundColor: "#003366",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  successMessage: {
    color: "#28A745", // Green color
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
});
