import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { loginUser, registerUser } from "../ApiServices/serverActions";
import Toast from "react-native-toast-message";

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation
  const isPasswordMatch =
    !isLogin && confirmPassword && password === confirmPassword;
  const showPasswordMatchIcon = !isLogin && confirmPassword.length > 0;

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
        position: "top",
      });
      return;
    }

    console.log("🔐 Attempting login for email:", email);
    setLoading(true);

    const { user, session, error } = await loginUser(email, password);

    if (error) {
      console.error("❌ Login failed:", error.message);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message,
        position: "top",
      });
    } else {
      console.log("✅ Login successful!");
      Toast.show({
        type: "success",
        text1: "Welcome Back! 🎉",
        text2: `Logged in as ${user?.email}`,
        position: "top",
      });
      navigation?.navigate("MainTabs");
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
        position: "top",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
        position: "top",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
        position: "top",
      });
      return;
    }

    console.log("📝 Attempting registration for email:", email);
    setLoading(true);

    // Prepare user metadata with phone number
    const userMetadata = {
      full_name: email.split("@")[0],
    };
    if (phoneNumber) {
      userMetadata.phone = phoneNumber;
    }

    const { user, session, error } = await registerUser(
      email,
      password,
      userMetadata,
    );

    if (error) {
      console.error("❌ Registration failed:", error.message);
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: error.message,
        position: "top",
      });
    } else {
      console.log("✅ Registration successful!");

      // Check if email confirmation is required
      if (session === null) {
        console.log("📧 Email confirmation required - check your inbox");
        Toast.show({
          type: "success",
          text1: "Success! 📧",
          text2: "Check your email for the confirmation link!",
          position: "top",
          visibilityTime: 4000,
        });
        setIsLogin(true);
      } else {
        console.log("✅ Auto-logged in after registration!");
        Toast.show({
          type: "success",
          text1: "Account Created! 🎉",
          text2: "Welcome to KFurniture!",
          position: "top",
        });
        navigation?.navigate("MainTabs");
      }
    }
    setLoading(false);
  };

  const toggleForm = () => {
    console.log(`🔄 Switching to ${isLogin ? "sign up" : "login"} mode`);
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Sign in to continue" : "Sign up to get started"}
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Phone Number Input - only for registration */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number (optional)"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password (only for sign up) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              {showPasswordMatchIcon && (
                <Ionicons
                  name={isPasswordMatch ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={isPasswordMatch ? "green" : "red"}
                  style={styles.validationIcon}
                />
              )}
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={isLogin ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Toggle between Login / Sign Up */}
          <TouchableOpacity onPress={toggleForm} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4b2020",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  validationIcon: {
    marginRight: 4,
  },
  submitButton: {
    backgroundColor: "#4b2020",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: "#4b2020",
    fontSize: 14,
    fontWeight: "500",
  },
});
