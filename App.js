import "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./src/Components/Login";
import Profile from "./src/Components/Profile";
import Notifications from "./src/Components/Notifications";
import Event from "./src/Components/Event";
import Events from "./src/Components/Events";
import SignUp from "./src/Components/SignUp";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import SharedStateContext from "./SharedStateContext";
import EventDetails from "./src/Components/EventDetails";
import UpdateEvent from "./src/Components/UpdateEvent";
import SeeWorkers from "./src/Components/SeeWorkers";
import WorkerDetails from "./src/Components/WorkerDetails";
import ManageEvents from "./src/Components/ManageEvents";
import NewsLetter from "./src/Components/NewsLetter";
import SeeNewsLetter from "./src/Components/SeeNewsLetter";
import UpdateNewsLetter from "./src/Components/UpdateNewsLetter";
import SeeNewsPaperClient from "./src/Components/NewsPaperClient";
import EventAdmin from "./src/Components/EventAdmin";
import SeeEventsAdmin from "./src/Components/SeeEventsAdmin";
import ManageUser from "./src/Components/ManageUser";
import axios from "axios";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
navigator.__defineGetter__("userAgent", function () {
  return "react-native";
});
import Entypo from "@expo/vector-icons/Entypo";

import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import ForgetPassword from "./src/Components/ForgetPassword";
import Welcome from "./src/Components/welcome";
import ChangePassword from "./src/Components/ChangePassword";
import SocketIOClient from "socket.io-client/dist/socket.io.js";
import GoogleUp from "./src/Components/GoogleUp";
import ManageTimeOpening from "./src/Components/ManageTimeOpening";
import * as Notification from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import ChooseTimeSeeEvents from "./src/Components/ChooseTimeSeeEvents";
// import FacebookUp from "./src/Components/FacebookUp";
import { I18nManager } from "react-native";
I18nManager.forceRTL(false);
I18nManager.allowRTL(false);
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const AdminStack = createStackNavigator();
const socket = SocketIOClient("https://api.nahtah.com");
SplashScreen.preventAutoHideAsync();

function MainStackScreen() {
  const [uncheckedCount, setUncheckedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const getNotifications = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user) {
          const response = await axios.get(
            `https://api.nahtah.com/notifications/${user._id}?page=${page}`
          );
          setNotifications(response.data.sortedEvents);
          setUncheckedCount(response.data.uncheckedNotifications);
          setTotalPages(response.data.totalPages);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("newNotification", () => {
      getNotifications();
    });
    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  useEffect(() => {
    getNotifications();
  }, [page]);

  // handle notification tap redirection
  useEffect(() => {
    const responseListener =
      Notification.addNotificationResponseReceivedListener((response) => {
        const { channelId } = response.notification.request.trigger;
        if (channelId) {
          navigation.navigate(channelId);
        }
      });
    return () => {
      responseListener.remove();
    };
  }, [navigation]);
  //  call the functions

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: 80,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "حساب تعريفي") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "حجز") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "الحجوزات") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "إشعارات") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "Logout") {
            iconName = focused ? "log-out" : "log-out-outline";
          } else if (route.name === "النشرة الإخبارية") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ADD8E6",
        tabBarInactiveTintColor: "white",
        tabBarInactiveBackgroundColor: "#003366",
        tabBarActiveBackgroundColor: "#003366",
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="حجز"
        component={Event}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />
      <Tab.Screen
        name="الحجوزات"
        component={Events}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      ></Tab.Screen>
      <Tab.Screen
        name="النشرة الإخبارية"
        component={SeeNewsPaperClient}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      ></Tab.Screen>

      <Tab.Screen
        name="إشعارات"
        options={{
          headerShown: false,
          tabBarBadge: uncheckedCount > 0 ? uncheckedCount : null,
          tabBarLabelStyle: { fontSize: 10 },
        }}
      >
        {() => (
          <Notifications
            notifications={notifications}
            loading={loading}
            setUncheckedCount={setUncheckedCount}
            totalPages={totalPages}
            setPage={setPage}
            setLoading={setLoading}
            page={page}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="حساب تعريفي"
        component={Profile}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />
      <Tab.Screen
        name="Logout"
        component={HandleLogout}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />

      <Tab.Screen
        name="Details"
        component={EventDetails}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="UpdateEvent"
        component={UpdateEvent}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
function AdminStackScreen() {
  const navigation = useNavigation();

  const [eventSLength, setEventSLength] = useState(0);

  const getEvents = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user) {
          const response = await axios.post(
            `https://api.nahtah.com/events/status`,
            {
              status: null,
            }
          );
          if (response.data) {
            setEventSLength(response.data.length);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on("newEvent", () => {
      getEvents();
    });
    return () => {
      socket.off("newEvent");
    };
  }, [socket]);
  useEffect(() => {
    getEvents();
  }, []);

  useEffect(() => {
    const responseListener =
      Notification.addNotificationResponseReceivedListener((response) => {
        const { channelId } = response.notification.request.trigger;
        if (channelId) {
          navigation.navigate(channelId);
        }
      });
    return () => {
      responseListener.remove();
    };
  }, [navigation]);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: 80,
          width: "100%",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "حساب تعريفي") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "SeeWorkers") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "ManageEvents") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Logout") {
            iconName = focused ? "log-out" : "log-out-outline";
          } else if (route.name === "النشرة الإخبارية") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "العروض") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "حجز") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "الحجوزات") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "ManageUsers") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "time") {
            iconName = focused ? "time" : "time-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ADD8E6",
        tabBarInactiveTintColor: "white",
        tabBarInactiveBackgroundColor: "#003366",
        tabBarActiveBackgroundColor: "#003366",
      })}
    >
      <Tab.Screen
        name="SeeWorkers"
        component={SeeWorkers}
        options={{
          headerShown: false,
          tabBarLabel: "إدارة العمال",
          tabBarLabelStyle: { fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="ManageEvents"
        options={{
          tabBarLabel: "إدارة الحجوزات",
          tabBarLabelStyle: { fontSize: 10 },
          headerShown: false,
          tabBarBadge: eventSLength > 0 ? eventSLength : null,
        }}
      >
        {(props) => <ManageEvents {...props} triggerGetEvents={getEvents} />}
      </Tab.Screen>

      <Tab.Screen
        name="العروض"
        component={SeeNewsLetter}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />
      <Tab.Screen
        name="time"
        component={ManageTimeOpening}
        options={{
          tabBarLabel: "وقت العمل",
          headerShown: false,
          tabBarLabelStyle: { fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="حجز"
        component={EventAdmin}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />
      <Tab.Screen
        name="الحجوزات"
        component={ChooseTimeSeeEvents}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />
      <Tab.Screen
        name="تحديث رسالة الأخبار"
        component={UpdateNewsLetter}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
          headerShown: false,
          tabBarLabelStyle: { fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="ManageUsers"
        component={ManageUser}
        options={{
          tabBarLabel: "إدارة المستخدمين",
          headerShown: false,
          tabBarLabelStyle: { fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="حساب تعريفي"
        component={Profile}
        options={{ headerShown: false, tabBarLabelStyle: { fontSize: 10 } }}
      />
      <Tab.Screen
        name="Logout"
        component={HandleLogout}
        options={{
          headerShown: false,
          tabBarLabel: "الخروج",
          tabBarLabelStyle: { fontSize: 10 },
        }}
      />

      <Tab.Screen
        name="WorkerDetails"
        component={WorkerDetails}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="النشرة الإخبارية"
        component={NewsLetter}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="SeeEventsAdmin"
        component={SeeEventsAdmin}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

const signOut = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } else {
      // Only try to sign out from Firebase if there's a current user
    }
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  } catch (error) {
    if (error.code === "SIGN_IN_REQUIRED") {
      console.log("User is not signed in");
    } else if (error.code === "auth/no-current-user") {
      console.log("No user currently signed in to Firebase");
    } else {
      console.error("Error signing out:", error);
    }
  }
};

function HandleLogout() {
  const { setIsLoggedIn, setuser, setIsAdmin } =
    React.useContext(SharedStateContext);
  const logout = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      const expoPushToken = await AsyncStorage.getItem("expoPushToken");
      const user = JSON.parse(userString);
      if (user && user._id) {
        axios.post("https://api.nahtah.com/deleteToken", {
          userId: user._id,
          token: expoPushToken,
        });
      }
      await AsyncStorage.clear();
      await signOut();
      setIsLoggedIn(false);
      setIsAdmin("");
      setuser(null);
    } catch (error) {
      console.error("Error while logging out:", error);
    }
  };
  useEffect(() => {
    logout();
  }, []);

  return null;
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Home"
        component={Login}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="ForgetPassword"
        component={ForgetPassword}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="google"
        component={GoogleUp}
        options={{ headerShown: false }}
      />
      {/* <AuthStack.Screen
        name="FacebookLogin"
        component={FacebookUp}
        options={{ headerShown: false }}
      /> */}
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setuser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState("");
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(Entypo.font);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.imgContainer}>
          <Image source={require("./assets/Logo.png")} style={styles.img} />
        </View>
      </View>
    );
  }
  return (
    <SharedStateContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setuser,
        isAdmin,
        setIsAdmin,
      }}
    >
      <NavigationContainer>
        {isLoggedIn ? (
          isAdmin === "Admin" ? (
            <AdminStackScreen />
          ) : isAdmin === "User" ? (
            <MainStackScreen />
          ) : (
            <AuthStackScreen />
          )
        ) : (
          <AuthStackScreen />
        )}
      </NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="black" />
    </SharedStateContext.Provider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  imgContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    margin: 10,
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
