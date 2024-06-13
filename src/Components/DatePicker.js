import React, { useState } from "react";
import { Modal, View, TouchableOpacity, Text } from "react-native";
import DatePicker from "react-native-modern-datepicker";
import { getFormatedDate } from "react-native-modern-datepicker";

const DatePickerModal = ({
  visible,
  toggleModal,
  selectedStartDate,
  setSelectedStartDate,
}) => {
  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate()),
    "YYYY-MM-DD"
  );
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = getFormatedDate(yesterday, "YYYY-MM-DD");

  const [startedDate, setStartedDate] = useState(startDate);

  function handleChangeStartDate(propDate) {
    setStartedDate(propDate);
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <DatePicker
            mode="calendar"
            minimumDate={yesterdayDate}
            selected={startedDate}
            onDateChanged={handleChangeStartDate}
            onSelectedChange={(date) => setSelectedStartDate(date)}
            options={{
              backgroundColor: "white",
              textHeaderColor: "#003366",
              textDefaultColor: "#003366",
              selectedTextColor: "white",
              mainColor: "#003366",
              textSecondaryColor: "#003366",
              borderColor: "#003366",
            }}
          />
          <TouchableOpacity onPress={toggleModal}>
            <Text style={{ color: "#003366" }}> إغلاق </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
};

export default DatePickerModal;
