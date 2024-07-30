import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from "react-native";
import axios from "axios";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import DatePickerModal from "./DatePicker";
import { format } from "date-fns";

export default function EventAdmin() {
  const [selectedBarber, setSelectedBarber] = useState("اختر الحلاق");
  const [selectedBarberImage, setSelectedBarberImage] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [selectedValue, setSelectedValue] = useState("option");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedHaircuts, setSelectedHaircuts] = useState([]);
  const [notAvailableTime, setNotAvailableTime] = useState([]);
  const [timeOptions, setTimeOptions] = useState([]);
  const [newDay, setNewDay] = useState("");
  const [lastOptionTime, setLastOptionTime] = useState("");
  const [isOff, setIsOff] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notAvailableTimeOfTomorrow, setNotAvailableTimeOfTomorrow] = useState(
    []
  );
  const [AfterMidnightTimes, setAfterMidnightTimes] = useState([]);
  const [beforeMidnightTimes, setBeforeMidnightTimes] = useState([]);

  const [daysOff, setDaysOff] = useState({
    date: "",
    userId: "",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const formatCustomDate = (date) => {
    let replacedText = date.replace(/\//g, "-");
    return replacedText.replace(/\//g, "-");
  };
  const headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6IjYzN2RmOGQ2OTVmNDViYWZjYTkyM2Q1NSIsImVtYWlsIjoiYmFzc2VtQG5haHRhaC5jb20iLCJpYXQiOjE2NzUwMjAzMDksImV4cCI6MTY3NTEwNjcwOX0.9qOaIHW1ykFq8Ne7djbAvYH6BlkR0sEy7Ym4zy01aPI",
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

  const haircutsData = [
    {
      id: 1,
      name: "حلاقة ذقن و شعر ",
      image: require("../../assets/barb.webp"),
    },
    { id: 2, name: "حلاقة ذقن", image: require("../../assets/beard.jpeg") },
    { id: 3, name: "حلاقة شعر", image: require("../../assets/barb.webp") },
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const handleOptionPress = (barber) => {
    setSelectedBarber(barber);
    const selectedBarberObject = barbers.find(
      (barb) => barb.fullName === barber
    );
    if (selectedBarberObject) {
      setSelectedBarberId(selectedBarberObject.id);
      setSelectedBarberImage(selectedBarberObject.image);
    }
    setModalVisible(false);
    setNotAvailableTime([]);
    setNotAvailableTimeOfTomorrow([]);
  };

  const fetchData = () => {
    axios
      .get(`https://oldapi.nahtah.com/api/user/`, { headers: headers })
      .then((response) => {
        const usersWithIds = response.data.map((user) => {
          const fullName = `${user.firstName} ${user.lastName}`;
          const image = `https://api.nahtah.com/img/${user._id}.jpg`;
          return {
            id: user._id,
            fullName: fullName,
            image: image,
            error: false,
          };
        });
        const filteredUsers = usersWithIds.filter(
          (user) =>
            user.id !== "6428ac21a2eb42f259bf94d4" &&
            user.id !== "63894924d17c157b439cf422" &&
            user.id !== "6388b0d3d17c157b439ce8a3" &&
            user.id !== "6388b13fd17c157b439ce8b2"
        );
        setBarbers(filteredUsers);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const filterPastTimes = (options) => {
    const beforeMidnight = [];
    const afterMidnight = [];

    let isAfterMidnight = false;

    options.forEach((option, index) => {
      if (isAfterMidnight || (option === "00:00" && index !== 0)) {
        afterMidnight.push(option);
        isAfterMidnight = true;
      } else {
        beforeMidnight.push(option);
      }
    });
    const beforeMidnightWithStatus = beforeMidnight.map((option) => {
      const [hours, minutes] = option.split(":").map(Number);
      const isPast =
        hours < new Date().getHours() ||
        (hours === new Date().getHours() && minutes <= new Date().getMinutes());
      return {
        time: option,
        isPast: isPast,
      };
    });
    const afterMidnightWithStatus = afterMidnight.map((option) => {
      const [hours, minutes] = option.split(":").map(Number);
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      const selectedDateString = formatCustomDate(selectedDate);
      const dayy = new Date(selectedDateString);
      dayy.setDate(dayy.getDate() + 1);

      const isPast =
        (new Date().getDate() === dayy.getDate() &&
          hours < currentDate.getHours()) ||
        (hours === currentDate.getHours() &&
          minutes <= currentDate.getMinutes());
      return {
        time: option,
        isPast: false,
      };
    });
    setBeforeMidnightTimes(beforeMidnightWithStatus);
    setAfterMidnightTimes(
      afterMidnightWithStatus ? afterMidnightWithStatus : []
    );
    if (afterMidnightWithStatus.length === 0) {
      return { AllTimes: beforeMidnightWithStatus };
    } else {
      const AllTimes = beforeMidnightWithStatus.concat(afterMidnightWithStatus);
      return {
        AllTimes: AllTimes,
      };
    }
  };
  const filterPastTimesNotToday = (options) => {
    const beforeMidnight = [];
    const afterMidnight = [];

    let isAfterMidnight = false;

    options.forEach((option, index) => {
      if (isAfterMidnight || (option === "00:00" && index !== 0)) {
        afterMidnight.push(option);
        isAfterMidnight = true;
      } else {
        beforeMidnight.push(option);
      }
    });
    const beforeMidnightWithStatus = beforeMidnight.map((option) => {
      return {
        time: option,
        isPast: false,
      };
    });
    const afterMidnightWithStatus = afterMidnight.map((option) => {
      const [hours, minutes] = option.split(":").map(Number);
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      return {
        time: option,
        isPast: false,
      };
    });
    setBeforeMidnightTimes(beforeMidnightWithStatus);
    setAfterMidnightTimes(
      afterMidnightWithStatus ? afterMidnightWithStatus : []
    );

    if (afterMidnightWithStatus.length === 0) {
      return { AllTimes: beforeMidnightWithStatus };
    } else {
      const AllTimes = beforeMidnightWithStatus.concat(afterMidnightWithStatus);
      return {
        AllTimes: AllTimes,
      };
    }
  };
  const filterPastTimesyeseterday = (options) => {
    const beforeMidnight = [];
    const afterMidnight = [];

    let isAfterMidnight = false;

    options.forEach((option, index) => {
      if (isAfterMidnight || (option === "00:00" && index !== 0)) {
        afterMidnight.push(option);
        isAfterMidnight = true;
      } else {
        beforeMidnight.push(option);
      }
    });
    const beforeMidnightWithStatus = beforeMidnight.map((option) => {
      return {
        time: option,
        isPast: true,
      };
    });
    const afterMidnightWithStatus = afterMidnight.map((option) => {
      const [hours, minutes] = option.split(":").map(Number);
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      const isPast =
        hours < currentDate.getHours() ||
        (hours === currentDate.getHours() &&
          minutes <= currentDate.getMinutes());
      return {
        time: option,
        isPast: isPast,
      };
    });
    setBeforeMidnightTimes(beforeMidnightWithStatus);
    setAfterMidnightTimes(
      afterMidnightWithStatus ? afterMidnightWithStatus : []
    );
    if (afterMidnightWithStatus.length === 0) {
      return { AllTimes: beforeMidnightWithStatus };
    } else {
      const AllTimes = beforeMidnightWithStatus.concat(afterMidnightWithStatus);
      return {
        AllTimes: AllTimes,
      };
    }
  };

  const fetchTimeOptions = () => {
    axios
      .get("https://api.nahtah.com/store")
      .then((response) => {
        let timeOptions = response.data || [];
        if (timeOptions.length === 0) {
          timeOptions = [
            "8:00",
            "8:30",
            "9:00",
            "9:30",
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
          ];
        }
        const modifiedDate = selectedDate.replace(/\//g, "-");
        const deviceDate = new Date();
        let year = deviceDate.getFullYear();
        let month = String(deviceDate.getMonth() + 1).padStart(2, "0");
        let day = String(deviceDate.getDate()).padStart(2, "0");
        let formattedDeviceDate = `${year}-${month}-${day}`;

        if (selectedDate) {
          if (modifiedDate === formattedDeviceDate) {
            setTimeOptions(filterPastTimes(timeOptions));
          } else if (modifiedDate < formattedDeviceDate) {
            setTimeOptions(filterPastTimesyeseterday(timeOptions));
          } else {
            setTimeOptions(filterPastTimesNotToday(timeOptions));
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    fetchTimeOptions();
  }, [selectedDate]);
  const notAvalabletime = async () => {
    if (selectedBarber === "اختر الحلاق") {
      setNotAvailableTime([]);
      setNotAvailableTimeOfTomorrow([]);
    } else {
      setNotAvailableTime([]);
      setNotAvailableTimeOfTomorrow([]);
      const selectedDateString = formatCustomDate(selectedDate);
      axios
        .post("https://api.nahtah.com/events/today", {
          userId: selectedBarberId,
          start: selectedDateString,
        })
        .then((response) => {
          if (response.data) {
            response.data.map((event) => {
              if (event.isTomorrow === false) {
                setNotAvailableTime((prev) => [...prev, event.eventsDate]);
              } else {
                setNotAvailableTimeOfTomorrow((prev) => [
                  ...prev,
                  event.eventsDate,
                ]);
              }
            });
          } else {
            setNotAvailableTime([]);
            setNotAvailableTimeOfTomorrow([]);
          }
        })

        .catch((error) => {
          console.error(error);
        });
    }
  };
  const getDaysOff = async () => {
    if (selectedBarber === "اختر الحلاق") {
      return;
    } else {
      axios
        .post("https://api.nahtah.com/offdays/user", {
          userId: selectedBarberId,
          date: formatCustomDate(selectedDate),
        })
        .then(({ data }) => {
          const date = data.length > 0 ? data[0].date : null;
          if (date) {
            setIsOff(true);
          } else {
            setIsOff(false);
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  };
  const getAllDaysOffByDate = async () => {
    try {
      const response = await axios.post("https://api.nahtah.com/offdays/date", {
        date: formatCustomDate(selectedDate),
      });
      const { data } = response;

      setDaysOff(
        data.map((item) => ({ date: item.date, userId: item.userId }))
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    getAllDaysOffByDate();
  }, [modalVisible, selectedDate]);
  useEffect(() => {
    fetchData();
    notAvalabletime();
    getDaysOff();
  }, [selectedBarber, selectedBarberId, selectedDate]);

  const getLastOptionTime = async () => {
    await axios.get("https://api.nahtah.com/store").then((response) => {
      const timeOptions = response.data || [];
      if (timeOptions.length > 0) {
        const lastOptionTime = timeOptions[timeOptions.length - 1];
        setLastOptionTime(lastOptionTime);
        const deviceDate = new Date();
        let year = deviceDate.getFullYear();
        let month = String(deviceDate.getMonth() + 1).padStart(2, "0");
        let day = String(deviceDate.getDate()).padStart(2, "0");
        let formattedDeviceDate = `${year}/${month}/${day}`;
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let year2 = yesterday.getFullYear();
        let month2 = String(yesterday.getMonth() + 1).padStart(2, "0");
        let day2 = String(yesterday.getDate()).padStart(2, "0");
        let formattedDeviceDate2 = `${year2}/${month2}/${day2}`;

        const currentTime = new Date().toLocaleTimeString();
        const FormatedTime = currentTime.split(":");
        if (FormatedTime[0].length === 1) {
          FormatedTime[0] = "0" + FormatedTime[0];
          const FormatedTime2 = FormatedTime[0] + ":" + FormatedTime[1];
          const isPast = lastOptionTime <= FormatedTime2;
          if (isPast === false) {
            setSelectedDate(formattedDeviceDate2);
          } else {
            setSelectedDate(formattedDeviceDate);
          }
        } else {
          const FormatedTime2 = FormatedTime[0] + ":" + FormatedTime[1];
          const isPast = lastOptionTime <= FormatedTime2;
          if (isPast === false) {
            setSelectedDate(formattedDeviceDate2);
          } else {
            setSelectedDate(formattedDeviceDate);
          }
        }
      }
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      getLastOptionTime();

      fetchTimeOptions();
    }, [])
  );

  function handleImageError(barberId) {
    const updatedBarbers = barbers.map((barber) => {
      if (barber.id === barberId) {
        return {
          ...barber,
          error: true,
          image:
            "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg",
        };
      }
      return barber;
    });
    setBarbers(updatedBarbers);
  }

  const toggleHaircutSelection = (haircutId) => {
    if (selectedHaircuts.includes(haircutId)) {
      setSelectedHaircuts([]);
    } else {
      setSelectedHaircuts([haircutId]);
    }
  };

  const PostAppointment = async () => {
    if (
      selectedBarber === "اختر الحلاق" ||
      selectedValue === "option" ||
      selectedHaircuts.length === 0
    ) {
      alert("يرجى اختيار الحلاق والوقت وتصفيفة الشعر");
      return;
    }

    const hairstylesString = selectedHaircuts
      .map((id) => haircutsData[id - 1].name)
      .join(", ");

    try {
      if (AfterMidnightTimes.some((option) => option.time === selectedValue)) {
        const selectedDateString = formatCustomDate(selectedDate);
        const AddDay = new Date(selectedDateString);
        AddDay.setDate(AddDay.getDate() + 1);
        const startTime =
          AddDay.toISOString().split("T")[0] + " " + selectedValue;
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60000);
        const endTimeString =
          endTime.toISOString().split("T")[0] +
          " " +
          endTime.toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });

        axios
          .post("https://api.nahtah.com/events/create", {
            title: selectedBarber,
            start: startTime,
            end: endTimeString,
            userId: selectedBarberId,
            barberImg: selectedBarberImage,
            description: hairstylesString,
          })
          .then((res) => {
            if (res.data.alert) {
              Alert.alert("الحدث مع هذا العامل والوقت موجود بالفعل");
            }
            if (res.data.msg) {
              Alert.alert("تم الحجز بنجاح", "تم حجز موعدك بنجاح");
              setSelectedBarber("اختر الحلاق");
              setSelectedValue("option");
              setSelectedBarberImage("");
              setSelectedDate("");
              setSelectedHaircuts([]);
              setNotAvailableTimeOfTomorrow([]);
              setSelectedBarberId("");

              setNotAvailableTime([]);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        const selectedDateString = formatCustomDate(selectedDate);
        const startTime = selectedDateString + " " + selectedValue;
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60000);
        const endTimeString =
          endTime.toISOString().split("T")[0] +
          " " +
          endTime.toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });

        axios
          .post("https://api.nahtah.com/events/create", {
            title: selectedBarber,
            start: startTime,
            end: endTimeString,
            userId: selectedBarberId,
            barberImg: selectedBarberImage,
            description: hairstylesString,
          })
          .then((res) => {
            if (res.data.alert) {
              Alert.alert("الحدث مع هذا العامل والوقت موجود بالفعل");
            }
            if (res.data.msg) {
              Alert.alert("تم الحجز بنجاح", "تم حجز موعدك بنجاح");
              setSelectedBarber("اختر الحلاق");
              setSelectedValue("option");
              setSelectedBarberImage("");
              setSelectedBarberId("");
              setSelectedDate("");
              setSelectedHaircuts([]);
              setNotAvailableTimeOfTomorrow([]);
              setNotAvailableTime([]);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (selectedDate) {
      const selectedDateString = formatCustomDate(selectedDate);
      const dayy = new Date(selectedDateString);
      dayy.setDate(dayy.getDate() + 1);
      setNewDay(dayy);
    }
  }, [selectedDate]);
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.mainContainer}>
        {/* Pickers Section */}
        <Text style={styles.title}>احجز موعدك</Text>
        <View style={styles.pickersContainer}>
          {/* Barber Picker */}
          <Text style={styles.label}>اختر الحلاق</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.picker}
          >
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text
                style={[
                  styles.pickerItem,
                  selectedBarber === "اختر الحلاق" ? { marginRight: 20 } : null,
                ]}
              >
                {selectedBarber}
              </Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            {selectedBarberImage && (
              <View style={styles.hairstylesContainer}>
                <View style={styles.hairstyleCard}>
                  <Image
                    source={{ uri: selectedBarberImage }}
                    style={styles.hairstyleImage}
                  />
                  <Text style={styles.hairstyleName}>{selectedBarber}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.datePickerButton}>
            {selectedDate && <Text>{selectedDate}</Text>}
            <TouchableOpacity
              onPress={toggleDatePicker}
              style={styles.datePickerBtn}
            >
              <Text style={styles.datePickerBtnText}>اختر التاريخ</Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && datePickerComponent}
          <Text style={styles.label}>اختر الوقت</Text>
          {selectedBarberId ? (
            beforeMidnightTimes && beforeMidnightTimes.length > 0 ? (
              <View style={styles.container}>
                {isOff ? (
                  <Text style={styles.offDayText}>إجازة</Text>
                ) : (
                  <View style={styles.timeOptionsContainer}>
                    {showAll ? (
                      <>
                        {beforeMidnightTimes.map((option) => (
                          <TouchableOpacity
                            key={option.time}
                            style={[
                              styles.timeOption,
                              option.time === selectedValue
                                ? styles.selectedTimeOption
                                : null,
                              option.isPast ? styles.disabledTimeOption : null,
                              notAvailableTime.includes(option.time)
                                ? styles.notAvailableTimeOption
                                : null,
                            ]}
                            onPress={() => {
                              if (
                                !notAvailableTime.includes(option.time) &&
                                !option.isPast
                              ) {
                                setSelectedValue(option.time);
                              }
                            }}
                            disabled={option.isPast}
                          >
                            <View style={styles.textContainer}>
                              <Text style={styles.textTime}>{option.time}</Text>
                              {(option.isPast ||
                                notAvailableTime.includes(option.time)) && (
                                <View style={styles.lineThrough} />
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}

                        {AfterMidnightTimes.length > 0 && (
                          <>
                            <View style={styles.divider} />
                            <View style={styles.nextDayContainer}>
                              <Text style={styles.nextDayText}>
                                اليوم التالي:
                                {" " + format(newDay, "yyyy/MM/dd")}
                              </Text>
                            </View>
                          </>
                        )}

                        {AfterMidnightTimes.map((option) => (
                          <TouchableOpacity
                            key={option.time}
                            style={[
                              styles.timeOption,
                              option.time === selectedValue
                                ? styles.selectedTimeOption
                                : null,
                              option.isPast ? styles.disabledTimeOption : null,
                              notAvailableTimeOfTomorrow.includes(option.time)
                                ? styles.notAvailableTimeOption
                                : null,
                            ]}
                            onPress={() => {
                              if (
                                !notAvailableTimeOfTomorrow.includes(
                                  option.time
                                ) &&
                                !option.isPast
                              ) {
                                setSelectedValue(option.time);
                              }
                            }}
                            disabled={option.isPast}
                          >
                            <View style={styles.textContainer}>
                              <Text style={styles.textTime}>{option.time}</Text>
                              {(option.isPast ||
                                notAvailableTimeOfTomorrow.includes(
                                  option.time
                                )) && <View style={styles.lineThrough} />}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    ) : (
                      <>
                        {beforeMidnightTimes.slice(0, 6).map((option) => (
                          <TouchableOpacity
                            key={option.time}
                            style={[
                              styles.timeOption,
                              option.time === selectedValue
                                ? styles.selectedTimeOption
                                : null,
                              option.isPast ? styles.disabledTimeOption : null,
                              notAvailableTime.includes(option.time)
                                ? styles.notAvailableTimeOption
                                : null,
                            ]}
                            onPress={() => {
                              if (
                                !notAvailableTime.includes(option.time) &&
                                !option.isPast
                              ) {
                                setSelectedValue(option.time);
                              }
                            }}
                            disabled={option.isPast}
                          >
                            <View style={styles.textContainer}>
                              <Text style={styles.textTime}>{option.time}</Text>
                              {(option.isPast ||
                                notAvailableTime.includes(option.time)) && (
                                <View style={styles.lineThrough} />
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                )}
                {!isOff &&
                  (beforeMidnightTimes.length > 6 ||
                    AfterMidnightTimes.length > 6) && (
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
              </View>
            ) : (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={{ marginTop: 10 }}>جاري تحميل الأوقات...</Text>
              </View>
            )
          ) : (
            <Text style={{ marginTop: 10, color: "red" }}>
              يرجى اختيار الحلاق
            </Text>
          )}
        </View>

        <Text style={styles.label}>اختر تصفيفة الشعر</Text>
        <View style={styles.hairstylesContainer}>
          {haircutsData.map((haircut) => (
            <TouchableOpacity
              key={haircut.id}
              style={[
                styles.hairstyleCard,
                selectedHaircuts.includes(haircut.id) &&
                  styles.selectedHairstyle,
              ]}
              onPress={() => toggleHaircutSelection(haircut.id)}
            >
              <Image source={haircut.image} style={styles.hairstyleImage} />
              <Text style={styles.hairstyleName}>{haircut.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {isOff ? (
          <View style={styles.BtnContainer}>
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                PostAppointment();
              }}
              disabled={true}
            >
              <Text style={styles.buttonText}>احجز</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.BtnContainer}>
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                PostAppointment();
              }}
            >
              <Text style={styles.buttonText}>احجز</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Barber Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView style={{ width: "100%" }}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>إلغاء</Text>
                </TouchableOpacity>
                {barbers.map((barber) => (
                  <TouchableOpacity
                    key={barber.id}
                    onPress={() => handleOptionPress(barber.fullName)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      marginBottom: 18,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row-reverse",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={
                          barber.error
                            ? {
                                uri: "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg",
                              }
                            : { uri: barber.image }
                        }
                        style={styles.barberImage}
                        onError={() => handleImageError(barber.id)}
                      />
                      <Text style={styles.barberName}>{barber.fullName}</Text>
                      {daysOff &&
                      daysOff.length > 0 &&
                      daysOff.some((offDay) => offDay.userId === barber.id) ? (
                        <Text style={styles.ijezaText}>(إجازة)</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <View style={styles.socialIconsContainer}>
          <View style={styles.icon}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  "https://www.instagram.com/tunis_barber?igsh=NXp4NzdocngzcjJu"
                );
              }}
            >
              <Ionicons
                name="logo-instagram"
                style={styles.socialIcon}
                size={24}
                color="#003366"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.icon}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  "https://www.tiktok.com/@bassemnahta?_t=8lTSJnAJeiY&_r=1"
                );
              }}
            >
              <Ionicons
                name="logo-tiktok"
                style={styles.socialIcon}
                size={24}
                color="#003366"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.icon}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL("https://maps.app.goo.gl/BDGJ4rHkF1ZemzHZA");
              }}
            >
              <MaterialCommunityIcons
                name="google-maps"
                size={24}
                color="#003366"
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.icon}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  "https://www.snapchat.com/add/coiffeurbisso?share_id=2IXNoc-4Q5ebWO-qHhXK7g&locale=fr_SA%40calendar%3Dgregorian"
                );
              }}
            >
              <Ionicons name="logo-snapchat" size={24} color="#003366" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "white", // Light gray background color
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pickersContainer: {
    width: "100%",
    alignItems: "center",
  },
  disabledTimeOption: {
    color: "#696969",
    textDecorationLine: "line-through",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#003366",
    marginBottom: 10,
  },
  nextDayContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  nextDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003366",
  },

  lineThrough: {
    position: "absolute",
    top: "48%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "red",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5,
  },
  picker: {
    width: "80%",
    height: 50,
    backgroundColor: "white",
    marginTop: 13,
    marginBottom: 20,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  datePickerBtn: {
    width: "48%",
    height: 45,
    backgroundColor: "#003366",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8, // Slightly rounded corners
    marginLeft: 8,
  },
  datePickerBtnText: {
    color: "#fff",
    fontSize: 18,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
    color: "black",
  },
  label: {
    width: "80%",
    textAlign: "right",
    fontWeight: "bold",
    marginBottom: 5,
  },
  BtnContainer: {
    width: "80%",
    alignItems: "center",
  },
  sendBtn: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    marginTop: 10,
    color: "#fff",
    backgroundColor: "#003366",
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  hairstylesContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  hairstyleCard: {
    marginRight: 10,
    borderRadius: 8,
    padding: 5,
    backgroundColor: "white",
    alignItems: "center",
    height: 140,
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5, // Shadow for Android
  },
  selectedHairstyle: {
    backgroundColor: "#003366",
  },
  hairstyleImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  hairstyleName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "92%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    maxHeight: "95%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cancelText: {
    textAlign: "right",
    fontSize: 18,
    color: "red",
    marginBottom: 10,
  },
  barberName: {
    fontSize: 18,
    marginRight: 10,
  },
  ijezaText: {
    fontSize: 18,
    marginRight: 10,
    color: "red",
    opacity: 0.8,
  },
  barberImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
    marginRight: 10,
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
    elevation: 4, // Shadow for Android
    shadowColor: "#aaa", // Shadow for iOS
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  selectedTimeOption: {
    backgroundColor: "#e6e6e6",
  },
  notAvailableTimeOption: {
    backgroundColor: "red",
    opacity: 0.4,
  },
  textTime: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
  },
  offDayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
    marginBottom: 20,
  },
  ArrowBtn: {
    marginTop: 10,
    alignItems: "center",
  },
  socialIconsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 17,
  },
  icon: {
    marginHorizontal: 20,
    borderRadius: 50,
    padding: 8,
    borderWidth: 1,
    borderColor: "#003366",
  },
  socialIconText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
