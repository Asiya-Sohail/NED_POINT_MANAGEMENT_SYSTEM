import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import { Colors } from "../constants/Colors"
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const studentportal = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student'
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    phone: false
  });

  const router = useRouter();
  

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name.trim() === '',
      email: !/^\S+@\S+\.\S+$/.test(formData.email),
      password: formData.password.length < 6,
      phone: formData.phone.trim() === '' || !/^\d+$/.test(formData.phone)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleRegister = () => {
    if (validateForm()) {
      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then(response => response.json())
        .then(data => {
          showAlert("Success", data.message);
          console.log("Response from backend:", data);
          router.push('/studentportal');
        })
        .catch(error => {
          console.error("Error:", error);
          showAlert("Error", "Failed to register user");
        });
    } else {
      showAlert('Validation Error', 'Please fill all fields correctly');
    }
  };  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Registration</Text>
        
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.errorInput]}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.iconColor}
            autoCapitalize="words"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>Name is required</Text>}
        </View>
        
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="Enter your email"
            placeholderTextColor={Colors.iconColor}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
          {errors.email && <Text style={styles.errorText}>Valid email is required</Text>}
        </View>
        
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, errors.password && styles.errorInput]}
            placeholder="Create a password (min 6 characters)"
            placeholderTextColor={Colors.iconColor}
            secureTextEntry={true}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
          />
          {errors.password && <Text style={styles.errorText}>Password must be at least 6 characters</Text>}
        </View>
        
        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.errorInput]}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.iconColor}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
          />
          {errors.phone && <Text style={styles.errorText}>Valid phone number is required</Text>}
        </View>
        
        {/* Role Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleContainer}>
            {['student', 'driver', 'transport_staff'].map((role) => (
              <Pressable
                key={role}
                style={[
                  styles.roleButton,
                  formData.role === role && styles.selectedRoleButton
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, role }));
                }}
              >
                <Text style={[
                  styles.roleText,
                  formData.role === role && styles.selectedRoleText
                ]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {/* Register Button */}
        <Pressable 
          style={[styles.button, styles.registerButton]}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>
        
        {/* Login Instead Button */}
        <Link href='./studentportal' style={styles.loginInsteadButton}>
          <Pressable>
            <Text style={styles.loginInsteadText}>Already have an account? Login Instead</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  )
}

export default studentportal

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
    color: Colors.primary,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: Colors.background,
    color: Colors.title,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  errorInput: {
    borderColor: Colors.warning,
  },
  errorText: {
    color: Colors.warning,
    fontSize: 12,
    marginTop: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.background,
  },
  roleText: {
    color: Colors.primary,
    fontSize: 14,
  },
  selectedRoleText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginInsteadButton: {
    marginTop: 20,
    alignItems: 'center',
    textAlign : 'center'
  },
  loginInsteadText: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})