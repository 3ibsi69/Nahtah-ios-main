// import React, { useEffect, useState, useContext } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Text,
//   Alert,
// } from "react-native";
// import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

// import { StatusBar } from "expo-status-bar";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import SharedStateContext from "../../SharedStateContext";
// import TESTNOTIF from "./TESTNOTIF";
// import { SocialIcon } from "react-native-elements";

// export default function FacebookUp() {
//   const [userInfo, setUserInfo] = useState(null);
//   const { setIsLoggedIn, setIsAdmin } = useContext(SharedStateContext);
//   const [loading, setLoading] = useState(false);

//   const handleTokenReceived = async (receivedToken) => {
//     try {
//       if (receivedToken) {
//         await AsyncStorage.setItem("expoPushToken", receivedToken);
//         const user = await AsyncStorage.getItem("user");
//         if (user) {
//           const userId = JSON.parse(user)._id;
//           SaveTokenAndUserId(receivedToken, userId);
//         }
//       }
//     } catch (error) {
//       console.error("Error saving token:", error);
//     }
//   };

//   const SaveTokenAndUserId = async (token, userId) => {
//     try {
//       await axios.post("https://api.nahtah.com/registerPushToken", {
//         token: token,
//         userId: userId,
//       });
//     } catch (error) {
//       console.error("Error saving token:", error);
//     }
//   };

//   useEffect(() => {
//     const requestTracking = async () => {
//       try {
//         const { status } = await requestTrackingPermissionsAsync();
//         Settings.initializeSDK();
//         if (status === "granted") {
//           await Settings.setAdvertiserTrackingEnabled(true);
//         }
//       } catch (error) {
//         console.error("Error requesting tracking permissions:", error);
//       }
//     };
//     requestTracking();
//   }, []);

//   const fetchUserData = async () => {
//     try {
//       setLoading(true); // Start loading
//       const infoRequest = new GraphRequest(
//         "/me",
//         { parameters: { fields: { string: "id,name,email" } } },
//         (error, result) => {
//           if (error) {
//             console.error("Error fetching user data:", error);
//           } else {
//             setUserInfo(result);
//             if (result) {
//               AsyncStorage.setItem("user", JSON.stringify(result));
//               handleUserAuthentication(result);
//             }
//           }
//           setLoading(false); // Stop loading
//         }
//       );
//       new GraphRequestManager().addRequest(infoRequest).start();
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       setLoading(false); // Ensure loading state is updated in case of error
//     }
//   };

//   const handleUserAuthentication = async (userInfo) => {
//     try {
//       setLoading(true);
//       const { email, name, id } = userInfo;
//       const res = await axios.post("https://api.nahtah.com/auth/user/signup", {
//         email: email,
//         username: name,
//         password: "s" + email,
//         number: userInfo.phoneNumber,
//       });

//       if (res.data.msg && res.data.msg === "email already exist") {
//         await handleLoginWithEmailPassword(email);
//       } else {
//         const { token, user } = res.data;
//         await AsyncStorage.setItem("token", JSON.stringify(token));
//         await AsyncStorage.setItem("user", JSON.stringify(user));
//         setIsLoggedIn(true);
//         setIsAdmin(user.type === "Admin" ? "Admin" : "User");
//       }
//     } catch (error) {
//       console.error("Error authenticating user:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoginWithEmailPassword = async (email) => {
//     try {
//       setLoading(true);
//       const res = await axios.post("https://api.nahtah.com/auth/user/signin", {
//         email: email,
//         password: "s" + email,
//       });
//       if (res.data.msg === "wrong password") {
//         Alert.alert(
//           "تم استخدام هذا البريد الإلكتروني مسبقًا مع كلمة مرور أخرى",
//           "يرجى المحاولة مرة أخرى",
//           [{ text: "OK" }]
//         );
//         const currentAccessToken = await AccessToken.getCurrentAccessToken();
//         if (currentAccessToken) {
//           await LoginManager.logOut();
//         }
//         setUserInfo(null);
//       } else if (res.data.token) {
//         const { token, user } = res.data;
//         await AsyncStorage.setItem("token", JSON.stringify(token));
//         await AsyncStorage.setItem("user", JSON.stringify(user));
//         setIsLoggedIn(true);
//         setIsAdmin(user.type === "Admin" ? "Admin" : "User");
//       } else {
//         console.error("Login attempt failed:", res.data.msg);
//       }
//     } catch (error) {
//       console.error("Error logging in with email and password:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     try {
//       const result = await LoginManager.logInWithPermissions([
//         "public_profile",
//         "email",
//       ]);
//       if (!result.isCancelled) {
//         await fetchUserData();
//         const tokenData = await AccessToken.getCurrentAccessToken();
//         if (tokenData) {
//         }
//       }
//     } catch (error) {
//       console.error("Error logging in:", error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       setLoading(true); // Start loading
//       const currentAccessToken = await AccessToken.getCurrentAccessToken();
//       if (currentAccessToken) {
//         await LoginManager.logOut();
//       }
//       setUserInfo(null); // Clear user info from state
//       // Clear AsyncStorage and reset state
//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("user");
//       setIsLoggedIn(false);
//       setIsAdmin(null);
//     } catch (error) {
//       console.error("Error logging out:", error);
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <>
//         {!userInfo ? (
//           <TouchableOpacity onPress={handleLogin} disabled={loading}>
//             <SocialIcon type="facebook" iconSize={25} />
//             {loading && (
//               <ActivityIndicator
//                 size="large"
//                 color="#0000ff"
//                 style={styles.loader}
//               />
//             )}
//           </TouchableOpacity>
//         ) : (
//           <>
//             <TouchableOpacity onPress={handleLogout} disabled={loading}>
//               <SocialIcon type="facebook" iconSize={25} />
//               {loading && (
//                 <ActivityIndicator
//                   size="large"
//                   color="#0000ff"
//                   style={styles.loader}
//                 />
//               )}
//             </TouchableOpacity>
//             <TESTNOTIF handleTokenReceived={handleTokenReceived} />
//           </>
//         )}
//       </>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
