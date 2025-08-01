import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import React, { useEffect } from 'react'
import {Link} from 'expo-router'
import { Colors } from '../constants/Colors';
import ThemedView from '../components/ThemedView';

const { width } = Dimensions.get('window');

const index = () => {
  useEffect(() => {
    fetch('http://localhost:3000/users')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log)
  }, [])
  return (
    <ThemedView style={styles.container} safe={true}>
      {/* <Image  
        source={require('../assets/Point_pic.jpeg')} 
        style={styles.logo}
        resizeMode="contain"
      /> */}
      
      <ThemedView>
        <Text style={styles.welcomeText}>NED Point System</Text>
        <Text style={styles.description}>Point System redefined</Text>
      </ThemedView>
      
      <Link href='./studentportal' asChild style={styles.buttonContainer}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </Link>

    </ThemedView>
  );
};

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 24,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary, 
  },
  toText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.active,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color : Colors.active,
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer : {
    display : 'flex',
    justifyContent: 'center',
    alignItems : 'center'
  },
  button: {
    backgroundColor: Colors.primary,
    width: width * 0.4,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: Colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
})
