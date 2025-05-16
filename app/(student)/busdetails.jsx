import { StyleSheet, Text, View, ScrollView, Platform, Pressable, Modal } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';


const BusSelectionScreen = () => {
  // const buses = [
  //   { id: 1, name: "Express 101", departure: "600 AM", arrival: "900 AM", seats: "32 Seats Available",  route : "Route A" },
  //   { id: 2, name: "City Shuttle", departure: "600 AM", arrival: "900 AM", seats: "18 Seats Available",  route : "Route B" },
  //   { id: 3, name: "Metro Rapid", departure: "600 AM", arrival: "900 AM", seats: "25 Seats Available",  route : "Route C" },
  //   { id: 4, name: "Premium Line", departure: "600 AM", arrival: "900 AM", seats: "12 Seats Available", route : "Route D" },
  // ];

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [stops, setStops] = useState([]);
  const [selectedBusName, setSelectedBusName] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/buses')
      .then((response) => response.json())
      .then((data) => {
        setBuses(data);
        console.log(data)
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching buses:', error);
        setLoading(false);
      });
  }, []);

  const fetchStops = async (busId, busName) => {
    try {
      const response = await fetch(`http://localhost:3000/buses/${busId}/stops`);
      const data = await response.json();

      setStops(data);
      setSelectedBusName(busName);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: Colors.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>BUS DETAILS</Text>
          {/* <Text style={styles.screenTitle}>SYSTEM</Text> */}
          {/* <Text style={styles.subtitle}>Hop on with Confidence</Text> */}
        </View>

        {/* Bus Cards */}
        {buses.map((bus) => (
        <Pressable key={bus.bus_id} onPress={() => fetchStops(bus.bus_id, bus.bus_name)}>
          <View key={bus.bus_id} style={styles.busCard}>
            <View style={styles.busHeader}>
              <Text style={styles.busName}>{bus.bus_name}</Text>
              <Text style={styles.routeName}>{bus.route_name}</Text>
            </View>

            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.timeText}>{bus.departure_time} — {bus.arrival_time}</Text>
            </View>

            <Text style={styles.seatsText}>{bus.seats_available} Seats Available</Text>
          </View>
        </Pressable>
      ))}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', position: 'relative'
          }}>
            
            {/* Close Icon */}
            <Pressable 
                onPress={() => {
                  // Close immediately
                  setModalVisible(false);
                  // Also clear stops and bus name if needed
                  setStops([]);
                  setSelectedBusName('');
                }} 
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color={Colors.primary} />
            </Pressable>

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, paddingTop: 10 }}>
              Stops for {selectedBusName}
            </Text>

            {stops.map((stop, index) => (
              <Text key={index} style={{ fontSize: 16, marginBottom: 5 }}>
                {index + 1}. {stop.stop_name}
              </Text>
            ))}
          </View>
        </View>
      </Modal>

      </ScrollView>
    </View>
    
  );
};

export default BusSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.background,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.background,
    marginBottom: 5,
  },
  route: {
    fontSize: 18,
    color: Colors.background,
    fontWeight: '500',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.background,
    opacity: 0.8,
    marginBottom: 15,
  },
  busCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  busName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  routeName: {
    fontSize: 16,
    color: Colors.text,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 8,
    color: Colors.text,
    fontSize: 16,
  },
  seatsText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 16,
  },
});