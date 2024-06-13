import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

export default function SeeNewsLetter() {
  const [loading, setLoading] = useState(true);
  const [newsletters, setNewsletters] = useState([]);
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const getNewsLetters = async () => {
    try {
      const response = await axios.get(
        `https://api.nahtah.com/newsletter?page=${currentPage}`
      );
      if (response.data) {
        setNewsletters(response.data.newsletters);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      getNewsLetters();
      setCurrentPage(1);
    }, [])
  );
  useEffect(() => {
    getNewsLetters();
  }, [currentPage]);

  const handleCardPress = (newsletter) => {
    navigation.navigate("تحديث رسالة الأخبار", {
      newsletterId: newsletter._id,
      title: newsletter.title,
      text: newsletter.text,
    });
  };

  const handleDelete = async (newsletterId) => {
    try {
      await axios.delete(`https://api.nahtah.com/newsletter/${newsletterId}`);
      setNewsletters(
        newsletters.filter((newsletter) => newsletter._id !== newsletterId)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddNewsletter = () => {
    navigation.navigate("النشرة الإخبارية");
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : newsletters.length === 0 ? (
        <View style={styles.headerContainer}>
          <Text style={{ textAlign: "center" }}>لا توجد رسائل</Text>
          <TouchableOpacity
            onPress={handleAddNewsletter}
            style={styles.addButton}
          >
            <FontAwesome name="plus" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>النشرات الإخبارية</Text>
          <TouchableOpacity
            onPress={handleAddNewsletter}
            style={styles.addButton}
          >
            <FontAwesome name="plus" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView>
        {newsletters.map((newsletter, index) => (
          <TouchableOpacity
            key={newsletter._id}
            style={styles.newsletterContainer}
          >
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <FontAwesome
                  name="trash"
                  size={20}
                  color="red"
                  style={{ marginRight: 15 }}
                  onPress={() =>
                    Alert.alert("حذف الرسالة", "هل تريد حذف الرسالة؟", [
                      {
                        text: "إلغاء",
                        style: "cancel",
                      },
                      {
                        text: "نعم",
                        onPress: () => handleDelete(newsletter._id),
                      },
                    ])
                  }
                />
              </View>
              <View style={styles.icon}>
                <FontAwesome
                  name="eye"
                  size={20}
                  color="#0059b3"
                  onPress={() => handleCardPress(newsletter)}
                />
              </View>
            </View>
            <View>
              <Text style={styles.title}>{newsletter.title}</Text>
              <Text style={styles.text}>{newsletter.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 1}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentPage === 1 ? "gray" : "black"}
          />
        </TouchableOpacity>
        <Text>
          {currentPage}/{totalPages}
        </Text>
        <TouchableOpacity
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={currentPage === totalPages ? "gray" : "black"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  addButton: {
    fontSize: 16,
    color: "#003366",
    position: "absolute",
    right: 20,
  },
  newsletterContainer: {
    borderWidth: 0,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    textAlign: "right",
  },
  icon: {
    flexDirection: "row",
    alignItems: "center",
    margin: 1,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    marginVertical: 20,
  },
});
