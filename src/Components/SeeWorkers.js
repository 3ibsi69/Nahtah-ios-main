import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export default function SeeWorkers() {
  const route = useRoute();
  const navigation = useNavigation();
  const [workers, setWorkers] = useState([]);
  const [expandedWorkerId, setExpandedWorkerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const defaultImageUri =
    "https://img.freepik.com/vecteurs-libre/homme-affaires-caractere-avatar-isole_24877-60111.jpg";
  const [imageError, setImageError] = useState(false);
  const AUTH_API2 = "https://oldapi.nahtah.com/";
  const [imageErrors, setImageErrors] = useState({});

  const httpOptions2 = {
    headers: {
      "Content-Type": "application/json",
    },
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6IjYzN2RmOGQ2OTVmNDViYWZjYTkyM2Q1NSIsImVtYWlsIjoiYmFzc2VtQG5haHRhaC5jb20iLCJpYXQiOjE2NzUwMjAzMDksImV4cCI6MTY3NTEwNjcwOX0.9qOaIHW1ykFq8Ne7djbAvYH6BlkR0sEy7Ym4zy01aPI",
  };
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${AUTH_API2}api/user`, httpOptions2)
      .then((response) => {
        const filteredUsers = response.data.filter(
          (user) =>
            user._id !== "6428ac21a2eb42f259bf94d4" &&
            user._id !== "63894924d17c157b439cf422" &&
            user._id !== "6388b0d3d17c157b439ce8a3" &&
            user._id !== "6388b13fd17c157b439ce8b2"
        );
        setWorkers(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching workers data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleToggleExpand = (workerId) => {
    setExpandedWorkerId(expandedWorkerId === workerId ? null : workerId);
  };

  const HandlePressSeeWorker = (worker) => {
    navigation.navigate("WorkerDetails", {
      workerId: worker._id,
      FirstName: worker.firstName,
      LastName: worker.lastName,
      Age: worker.age,
      gender: worker.gender,
    });
  };
  const handleImageError = (workerId) => {
    setImageErrors((prevErrors) => ({
      ...prevErrors,
      [workerId]: true,
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {!loading ? (
        <View style={styles.Maincontainer}>
          <Text
            style={{
              fontSize: 20,
              marginBottom: 10,
              textAlign: "center",
              fontWeight: "bold",
              color: "black",
            }}
          >
            العمال
          </Text>
          {workers.map((worker) => (
            <View key={worker._id} style={styles.workerContainer}>
              <TouchableOpacity
                style={styles.workerCard}
                onPress={() => handleToggleExpand(worker._id)}
              >
                <View style={styles.workerInfo}>
                  <Text
                    style={styles.workerName}
                  >{`${worker.firstName} ${worker.lastName}`}</Text>
                  {!imageErrors[worker._id] && (
                    <Image
                      source={{
                        uri: `https://api.nahtah.com/img/${worker._id}.jpg`,
                      }}
                      onError={() => handleImageError(worker._id)}
                      style={styles.profileImage}
                    />
                  )}
                  {imageErrors[worker._id] && (
                    <Image
                      source={{
                        uri: defaultImageUri,
                      }}
                      style={styles.profileImage}
                    />
                  )}
                </View>
                <View style={styles.workerDetails}>
                  {expandedWorkerId === worker._id && (
                    <>
                      <Text
                        style={styles.workerText}
                      >{`الجنس: ${worker.gender}`}</Text>
                      <Text
                        style={styles.workerText}
                      >{`العمر: ${worker.age}`}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
              {expandedWorkerId === worker._id && (
                <TouchableOpacity style={styles.viewButton}>
                  <Text
                    style={styles.viewText}
                    onPress={() => HandlePressSeeWorker(worker)}
                  >
                    معلومات العامل
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingTop: 50,
  },
  Maincontainer: {
    flex: 1,
    // justifyContent: "flex-end",
    justifyContent: "flex-start",

    padding: 10,
  },
  workerContainer: {
    marginBottom: 10,
  },
  workerCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },

  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "center",
  },

  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },

  workerName: {
    fontSize: 19,
    marginBottom: 5,
  },
  workerText: {
    fontSize: 16,
    marginBottom: 3,
  },
  viewButton: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  viewText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  workerDetails: {
    alignSelf: "flex-end",
    textAlign: "right", // Align text to the right

    marginLeft: 10,
    marginTop: 10,
    marginRight: 35,
  },
  workerName: {
    fontSize: 18,
  },
  workerText: {
    fontSize: 16,
    marginBottom: 3,
    textAlign: "right",
  },
  viewButton: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    position: "absolute",
    bottom: 5,
    left: 5,
  },
  viewText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
