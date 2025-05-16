import { Slot, useRouter } from 'expo-router';
import { View, Text, Pressable, Modal, StyleSheet, TextInput  } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContext';
import { Picker } from '@react-native-picker/picker';

import ThemedView from '../../components/ThemedView';
import { MenuContext } from '../../contexts/MenuContext';


export default function Layout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { loggedInUser, logoutUser } = useContext(UserContext);

  const { registerBusVisible, setRegisterBusVisible, feeStatus, setFeeStatus, feedbackgiven, setFeedbackgiven } = useContext(MenuContext);
  
  const [isBusRegistered, setIsBusRegistered] = useState(false);
  const [registeredBusName, setRegisteredBusName] = useState('');


  const [selectedBus, setSelectedBus] = useState("");
  const [busOptions, setBusOptions] = useState([]);

  const [payFeeVisible, setPayFeeVisible] = useState(false);
  const [busRegistered, setBusRegistered] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false); // Controls Feedback Modal visibility
  // const [feedbackgiven, setFeedbackgiven] = useState(null); // null = not checked, true = already given, false = not yet given
  const [inputFeedback, setInputFeedback] = useState(''); // Stores the comment input

  const [modalMessage, setModalMessage] = useState('');
  
  const [loading, setLoading] = useState(false);  
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:3000/available-buses')
      .then((res) => res.json())
      .then((data) => {
        setBusOptions(data);
        if (data.length === 1) {
          setSelectedBus(data[0].bus_name); // Auto-select the only bus
        }
      })
      .catch((err) => console.error("Error fetching buses:", err));
  }, [busRegistered]);

  useEffect(() => {
    if (loggedInUser) {
      fetch(`http://localhost:3000/check-bus-status/${loggedInUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.bus_status) {
            // console.log(data)
            setRegisteredBusName(data.bus_status);
            setIsBusRegistered(true);
          } else {
            setRegisteredBusName('');
            setIsBusRegistered(false);
          }
        })
        .catch(err => {
          console.error("Error checking bus registration status:", err);
          setRegisteredBusName('');
          setIsBusRegistered(false);
        });
    }
  }, [busRegistered]);

  const handleNavigate = (route) => {
    setMenuVisible(false);
    if (route === '/registerbus') {
      setRegisterBusVisible(true); // Show modal instead of navigating
      // setMenuVisible(false);
    } 
    else if (route === '/payfees') {  
      checkBusAndFeeStatus(); 
      setMenuVisible(false); 
      setPayFeeVisible(true); 
    }
    else if (route === '/deleteaccount') {
      setMenuVisible(false);
      handleDeleteAccount(); // directly call it
    }
    else if (route === '/feedback') {
      setMenuVisible(false);
      checkBusAndFeedbackStatus();
      setFeedbackVisible(true);// directly call it
    }
    else {
      router.push(route);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.replace('/studentportal');
  };

  const handleRegisterBus = async () => {
    if (!selectedBus || selectedBus.trim() === "") {
      alert("Please select a bus before registering.");
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/register-bus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: loggedInUser.id,
          bus_name: selectedBus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // checkBusAndFeeStatus();
        alert("Bus registered successfully!");
        setRegisterBusVisible(false);
      } else {
        alert("Registration failed: " + result.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred while registering the bus.");
    }
  };

  const cancelBusRegistration = async () => {
    try {
      const response = await fetch(`http://localhost:3000/cancel-bus-registration/${loggedInUser.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
          setIsBusRegistered(false)
          setRegisteredBusName('')
          setRegisterBusVisible(false)
        alert('Bus registration cancelled successfully');
        // Optionally refresh state or UI
      } else {
        alert('Failed to cancel bus registration');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while cancelling');
    }
  };

  const checkBusAndFeeStatus = async () => {
    setLoading(true);
    try {
      // 1. Check bus status
      const busRes = await fetch(`http://localhost:3000/check-bus-status/${loggedInUser.id}`);
      const busData = await busRes.json();

      if (!busData.bus_status) {
        setModalMessage('Register a bus first');
        setBusRegistered(false);
        setFeeStatus('');
      } else {
        setBusRegistered(true);

        // 2. Check fee status
        const feeRes = await fetch(`http://localhost:3000/fee-status/${loggedInUser.id}`);
        const feeData = await feeRes.json();

        setFeeStatus(feeData.paid ? 'completed' : 'pending');
        setModalMessage(feeData.paid ? 'Your fee is paid.' : '');
      }

      setPayFeeVisible(true);
    } catch (error) {
      console.log(error)
      setModalMessage('Something went wrong. Try again.');
      setPayFeeVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const checkBusAndFeedbackStatus = async () => {
    setLoading(true);
    try {
      // 1. Check bus status
      const busRes = await fetch(`http://localhost:3000/check-bus-status/${loggedInUser.id}`);
      const busData = await busRes.json();

      if (!busData.bus_status) {
        setModalMessage('Register a bus first');
        setBusRegistered(false);
        setFeedbackVisible(true);  // Show modal with message
        setFeedbackgiven(null);
        return;
      }

      setBusRegistered(true);

      // 2. Check feedback status
      const feedbackRes = await fetch(`http://localhost:3000/feedback-status/${loggedInUser.id}`);
      const feedbackData = await feedbackRes.json();

      if (feedbackData.feedbackGiven) {
        setFeedbackgiven(true);
      } else {
        setFeedbackgiven(false);
      }

      setFeedbackVisible(true);
    } catch (error) {
      console.log(error);
      setModalMessage('Something went wrong. Try again.');
      setFeedbackVisible(true);
    } finally {
      setLoading(false);
    }
  };


  const handlefeedback = async () => {
    try {
      const res = await fetch('http://localhost:3000/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: loggedInUser.id, comments: inputFeedback }),
      });

      const data = await res.json();

      if (data.message === "Feedback submitted successfully") {
        setFeedbackgiven(true);
      }

    } catch (error) {
      console.log('Feedback submission error:', error);
    }
  };



  // const checkBusAndFeeStatus = async () => {
  //   setLoading(true);
  //   try {
  //     // 1. Check Bus Status
  //     const busRes = await fetch(`http://localhost:3000/check-bus-status/${loggedInUser.id}`);
  //     const busText = await busRes.text(); // read as text first

  //     if (!busText) {
  //       setBusRegistered(false);
  //       setModalMessage('Register a bus first');
  //       setFeeStatus('');
  //       setPayFeeVisible(true);
  //       return;
  //     }

  //     // Bus is registered
  //     setBusRegistered(true);

  //     // 2. Check Fee Status
  //     const feeRes = await fetch(`http://localhost:3000/fee-status/${loggedInUser.id}`);
  //     const feeText = await feeRes.text();

  //     let feeData;
  //     try {
  //       feeData = JSON.parse(feeText);
  //     } catch (err) {
  //       setModalMessage('Error parsing fee status.');
  //       setFeeStatus('');
  //       setPayFeeVisible(true);
  //       return;
  //     }

  //     if (feeData.message === 'Student not found') {
  //       setModalMessage('Register a bus first');
  //       setBusRegistered(false);
  //       setFeeStatus('');
  //     } else if (feeData.status === 'Completed') {
  //       setFeeStatus('Completed');
  //       setModalMessage('Your fee is paid.');
  //     } else {
  //       setFeeStatus('Pending');
  //       setModalMessage('');
  //     }

  //     setPayFeeVisible(true);
  //   } catch (error) {
  //     setModalMessage('Something went wrong. Try again.');
  //     setPayFeeVisible(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handlePayFee = async () => {
    try {
      setLoading(true);
      await fetch(`http://localhost:3000/pay-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: loggedInUser.id }),
      });
      setFeeStatus('Completed');
      setModalMessage('Your fee is paid.'); // ✅ Set modal text
      alert('Your fee is successfully paid.'); // ✅ Show alert
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment failed. Please try again.'); // optional fallback alert
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account permanently?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/delete-account/${loggedInUser.id}`, {
        method: 'DELETE',
      });

      const contentType = response.headers.get("content-type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();  // fallback if response is not JSON
        throw new Error("Unexpected response format:\n" + text);
      }

      if (response.ok) {
        alert('Your account has been deleted.');
        logoutUser();
        router.replace('/');
      } else {
        alert('Failed to delete account: ' + data.message);
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account. Please check the console for details.');
    }
  };

  return (
    <ThemedView style={{ flex: 1 , backgroundColor: Colors.primary}}>
      {/* Custom Header */}
      <View style={styles.menucontainer}>
        <Pressable onPress={() => setMenuVisible(true)}>
          <Ionicons name='menu' size={30} color={Colors.background}/>
        </Pressable>
        <Pressable 
          style={styles.button}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>

      {/* Screen Content */}
      <Slot />

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menu}>
            {[
              { label: 'Bus details', route: '/busdetails' },
              { label: 'Student Portal', route: '/studentmain' },
              { label: 'Delete your account', route: '/deleteaccount' },
              { label: 'Pay fees', route: '/payfees' },
              { label: 'Give Feedback', route: '/feedback' },
              {label : 'Register a bus', route: '/registerbus'}
            ].map((item, index) => (
              <Pressable
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.route)}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={registerBusVisible}
        onRequestClose={() => setRegisterBusVisible(false)}
      >
        {/* <View style={styles.modalOverlay}>
          <View style={styles.registerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register for a Bus</Text>
              <Pressable onPress={() => setRegisterBusVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </Pressable>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 8, color: Colors.primary }}>Select a Bus:</Text>
              <View style={styles.pickerWrapper}>
              {busOptions.length === 0 ? (
                <Text style={{ color: Colors.primary }}>No buses available at the moment.</Text>
              ) : (
                <Picker
                  selectedValue={selectedBus}
                  onValueChange={(itemValue) => setSelectedBus(itemValue)}
                  style={styles.picker}
                >
                  {busOptions.map((bus) => (
                    <Picker.Item key={bus.bus_id} label={bus.bus_name} value={bus.bus_name} />
                  ))}
                </Picker>
              )}
              </View>
            </View>

            <Pressable style={styles.registerButton} onPress={handleRegisterBus}>
              <Text style={styles.registerButtonText}>Register</Text>
            </Pressable>
          </View>
        </View> */}

        <View style={styles.modalOverlay}>
          <View style={styles.registerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register for a Bus</Text>
              <Pressable onPress={() => setRegisterBusVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </Pressable>
            </View>

            {isBusRegistered ? (
              <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, color: Colors.primary, marginBottom: 20 }}>
                You are already registered for <Text style={{ fontWeight: "bold" }}>{registeredBusName}</Text>.
              </Text>

                <Pressable style={styles.registerButton} onPress={cancelBusRegistration}>
                  <Text style={styles.registerButtonText}>Cancel Registration</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, marginBottom: 8, color: Colors.primary }}>Select a Bus:</Text>
                  <View style={styles.pickerWrapper}>
                    {busOptions.length === 0 ? (
                      <Text style={{ color: Colors.primary }}>No buses available at the moment.</Text>
                    ) : (
                      <Picker
                        selectedValue={selectedBus}
                        onValueChange={(itemValue) => setSelectedBus(itemValue)}
                        style={styles.picker}
                      >
                        {busOptions.map((bus) => (
                          <Picker.Item key={bus.bus_id} label={bus.bus_name} value={bus.bus_name} />
                        ))}
                      </Picker>
                    )}
                  </View>
                </View>

                <Pressable style={styles.registerButton} onPress={handleRegisterBus}>
                  <Text style={styles.registerButtonText}>Register</Text>
                </Pressable>
              </>
            )}

          </View>
        </View>

      </Modal>

      <Modal animationType="slide" transparent={true} visible={payFeeVisible} onRequestClose={() => setPayFeeVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.feeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fee Status</Text>
              <Pressable onPress={() => setPayFeeVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </Pressable>
            </View>


            {!busRegistered ? (
              <Text style={styles.paidText}>Register a bus first</Text>
            ) : feeStatus === 'Completed' ? (
              <Text style={styles.paidText}>{modalMessage}</Text>
            ) : (
              <>
                <Text style={styles.paidText}>Fee not paid. Please pay below.</Text>
                <Pressable style={styles.payButton} onPress={handlePayFee}>
                  <Text style={styles.payButtonText}>PAY FEE</Text>
                </Pressable>
              </>
            )}

            {/* 
            {feeStatus === 'Completed' ? (
              <Text style={styles.paidText}>{modalMessage}</Text>
            ) : (
              <>
                <Text style={styles.paidText}>Fee not paid. Please pay below.</Text>
                <Pressable style={styles.payButton} onPress={handlePayFee}>
                  <Text style={styles.payButtonText}>PAY FEE</Text>
                </Pressable>
              </>
            )} */}
          </View>
        </View>
      </Modal>

{/* 
      <Modal animationType="slide" transparent={true} visible={feedbackVisible} onRequestClose={() => setFeedbackVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.feeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Feedback</Text>
              <Pressable onPress={() => setFeedbackVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </Pressable>
            </View>

            {feedbackgiven === true ? (
              <Text style={styles.paidText}>You have already given the feedback. Thank you</Text>
            ) : (
              <>
                <Text style={styles.paidText}>Please write your comments below</Text>
                <TextInput
                  multiline={true}
                  numberOfLines={4}
                  placeholder="Enter your feedback..."
                  style={{
                    height: 100,
                    borderColor: Colors.primary,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    textAlignVertical: 'top', // Important for Android
                  }}
                  value={inputFeedback}
                  onChangeText={setInputFeedback}
                />

                <Pressable style={styles.payButton} onPress={handlefeedback}>
                  <Text style={styles.payButtonText}>Submit</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal> */}

      <Modal animationType="slide" transparent={true} visible={feedbackVisible} onRequestClose={() => setFeedbackVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.feeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Feedback</Text>
              <Pressable onPress={() => setFeedbackVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </Pressable>
            </View>

            {!busRegistered ? (
              <Text style={styles.paidText}>Register a bus first</Text>
            ) : feedbackgiven === true ? (
              <Text style={styles.paidText}>Your feedback is already given</Text>
            ) : (
              <>
                <Text style={styles.paidText}>Please write your comments below</Text>
                <TextInput
                  multiline={true}
                  numberOfLines={4}
                  placeholder="Enter your feedback..."
                  style={{
                    height: 100,
                    borderColor: Colors.primary,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    textAlignVertical: 'top',
                  }}
                  value={inputFeedback}
                  onChangeText={setInputFeedback}
                />
                <Pressable style={styles.payButton} onPress={handlefeedback}>
                  <Text style={styles.payButtonText}>Submit</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>



      {/* Pay Fee Modal */}
      {/* <Modal animationType="slide" transparent={true} visible={payFeeVisible} onRequestClose={() => setPayFeeVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.feeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fee Status</Text>
              <Pressable onPress={() => setPayFeeVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </Pressable>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : feeStatus === 'Completed' ? (
              <Text style={styles.paidText}>Your fee is paid.</Text>
            ) : (
              <Pressable style={styles.payButton} onPress={handlePayFee}>
                <Text style={styles.payButtonText}>PAY FEE</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal> */}



    </ThemedView>
  );
}

const styles = StyleSheet.create({
  menucontainer : {
    flexDirection: 'row',
    justifyContent: 'space-between', // This pushes items to opposite ends
    alignItems: 'center', // Vertically centers items
    paddingHorizontal: 20, // Same as margin-inline 20
    paddingVertical: 10, // Creates the gap below menu (before profile)
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  menuItem: {
    marginVertical: 10,
  },
  menuText: {
    fontSize: 18,
    color: '#0a192f',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  buttonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerModal: {
  backgroundColor: Colors.background,
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: Colors.primary,
},
dropdown: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: Colors.primary,
  padding: 12,
  borderRadius: 8,
},
dropdownText: {
  fontSize: 16,
  color: Colors.primary,
},
registerButton: {
  backgroundColor: Colors.primary,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
registerButtonText: {
  color: Colors.buttonText,
  fontWeight: 'bold',
  fontSize: 16,
},
pickerWrapper: {
  borderWidth: 1,
  borderColor: Colors.primary,
  borderRadius: 8,
  overflow: 'hidden',
},
picker: {
  height: 50,
  width: '100%',
  color: Colors.primary,
},
  feeModal: {
    backgroundColor: Colors.background,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  paidText: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
