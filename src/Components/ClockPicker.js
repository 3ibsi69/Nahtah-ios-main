import React, { useState } from "react";
import { Modal, View, TouchableOpacity, Text } from "react-native";
import DatePicker from "react-native-modern-datepicker";

const TimePickerExample = ({ visible, toggleModal, time, setTime }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <DatePicker
            mode="time"
            onTimeChange={(selectedTime) => {
              setTime(selectedTime);
              toggleModal();
            }}
            minuteInterval={5}
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

export default TimePickerExample;
