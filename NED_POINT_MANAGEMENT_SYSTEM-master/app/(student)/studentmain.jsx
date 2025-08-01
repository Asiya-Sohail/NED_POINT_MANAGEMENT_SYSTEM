import { StyleSheet, Text, View, ScrollView, Platform, Pressable } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { Colors } from '../../constants/Colors'
import ThemedView from '../../components/ThemedView'
import InfoCard from '../../components/InfoCard'
import { Ionicons } from '@expo/vector-icons'
import { UserContext } from '../../contexts/UserContext'
import { MenuContext } from '../../contexts/MenuContext'

const StudentMainPage = () => {

  const { loggedInUser } = useContext(UserContext);
  const { registerBusVisible, feeStatus , feedbackgiven} = useContext(MenuContext);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    if (!loggedInUser) return;

    fetch(`http://localhost:3000/student/${loggedInUser.id}`)
      .then(res => res.json())
      .then(data => {
        setStudentInfo({
          name: data.name,
          email: data.email,
          phoneNumber: data.phone,
          studentId: data.studentId,
          busBooked: data.busBooked,
          feeStatus: data.feeStatus ,
          feedback: data.feedback || 'No feedback given',
          userId: loggedInUser.id,
        });
      })
      .catch(err => console.error("Error fetching student info:", err));

  }, [loggedInUser, registerBusVisible, feeStatus, feedbackgiven]);


  useEffect(() => {
    if (studentInfo) {
      console.log(studentInfo);
    }
  }, [studentInfo]);
  

  // State for all student information
  // const [studentInfo, setStudentInfo] = useState({
  //   name: "John Doe",
  //   userId: "1",
  //   studentId: "STU2023001",
  //   email: "john.doe@gmail.com",
  //   phoneNumber: "+1 452-1519",
  //   busBooked: "Route 287 - 212 (Morning)",
  //   feeStatus: "Paid",
  //   studentId: "1816-1892",
  //   feedback: "Excellent service"
  // });

  if (!studentInfo) {
    return <Text style={{padding: 20, color : Colors.background}}>Loading student data...</Text>;
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor : Colors.primary}]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* New Header Section with Circular Profile */}
        <View style={styles.profileHeader}>
          <View style={{alignSelf : 'center', alignItems: 'center'}}>
            <View style={styles.profileCircle}>
              <Ionicons name="person" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.profileName}>{studentInfo.name}</Text>
            <Text style={styles.profileUserId}>User : {studentInfo.userId}</Text>
          </View>
        </View>

        {/* Information Cards */}
        <View style={styles.cardsContainer}>
        <InfoCard 
            title="Student ID" 
            value={studentInfo.studentId} 
            icon="school"
            color={Colors.primary}
          />

          <InfoCard 
            title="Email" 
            value={studentInfo.email} 
            icon="mail"
            color={Colors.active}
          />
          
          <InfoCard 
            title="Phone Number" 
            value={studentInfo.phoneNumber} 
            icon="call"
            color={Colors.text}
          />
          
          <InfoCard 
            title="Bus Booked" 
            value={studentInfo.busBooked} 
            icon="bus"
            color={Colors.success}
          />
          
          <InfoCard 
            title="Fee Status" 
            value={studentInfo.feeStatus} 
            valueStyle={studentInfo.feeStatus === "completed" ? styles.paidText : styles.unpaidText}
            icon="card"
            color={studentInfo.feeStatus === "completed" ? Colors.success : Colors.warning}
          />
          
          <InfoCard 
            title="Feedback" 
            value={studentInfo.feedback} 
            icon="chatbubbles"
            color={Colors.star}
          />
        </View>
      </ScrollView>
    </ThemedView>
  )
}

export default StudentMainPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    gap : 10,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    // alignItems: 'center',
    marginBottom: 32,
    paddingBlock : 20,
    backgroundColor : Colors.primary,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.background,
    marginBottom: 4,
  },
  profileUserId: {
    fontSize: 16,
    color: Colors.background,
    opacity: 0.8,
  },
  cardsContainer: {
    gap: 16,
  },
  paidText: {
    color: Colors.success,
    fontWeight: 'bold',
  },
  unpaidText: {
    color: Colors.warning,
    fontWeight: 'bold',
  },

})