import { StyleSheet, Text, View, TextInput, Pressable, Alert , Platform } from 'react-native'
import React, { useState } from 'react'
import { Colors } from "../../constants/Colors"
import { Link } from 'expo-router'

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const conductorportal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('transport_staff'); 

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", role);

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          
          console.log("Success")
          // Alert.alert("Success", "Login Successful!");
          showAlert("Success", "You are logged in!");
        } else {
          showAlert("Failed", "No user found, please register first.");
        }
      })
      .catch(err => {
        console.error(err);
        showAlert("Error", "Something went wrong.");
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conductor Portal</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={Colors.iconColor}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={Colors.iconColor}
          secureTextEntry={true}
          onChangeText={setPassword}
        />
      </View>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        <Link href='/register' style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
        </Link>
        <Link href='/' style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

export default conductorportal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.primary,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: Colors.primary,
    textAlign : 'center'
  },
  buttonText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
})