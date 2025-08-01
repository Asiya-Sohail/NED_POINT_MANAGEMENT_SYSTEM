import { StyleSheet } from 'react-native'
import { Tabs } from "expo-router"
import { Colors } from "../../constants/Colors"
import { Ionicons } from '@expo/vector-icons';


const DashboardLayout = () => {
   
  return (
    <Tabs 
        screenOptions={{headerShown: false, tabBarStyle : {
            backgroundColor : Colors.primary,
            height : 70,
        }, 
        tabBarActiveTintColor : Colors.background,
        tabBarInactiveTintColor : Colors.buttonText,
        tabBarLabelStyle : {
            fontSize : 16,
        },
        }}
    >
        <Tabs.Screen 
            name="studentportal" 
            options={{title : 'Student', tabBarIcon : ({ focused }) => {
                <Ionicons 
                    size={24}
                    name = {focused ? 'person' : 'person_outline'}
                    color = {focused ? Colors.iconColorFocused : Colors.iconColor}
                />
            }}}
        />
        <Tabs.Screen 
            name="driverportal" 
            options={{title : 'Driver', tabBarIcon : ({ focused }) => {
                <Ionicons 
                    size={24}
                    name = {focused ? 'book' : 'book_outline'}
                    color = {focused ? Colors.iconColorFocused : Colors.iconColor}
                />
            }}}
        />
        <Tabs.Screen 
            name="conductorportal" 
            options={{title : 'Conductor', tabBarIcon : ({ focused }) => {
                <Ionicons 
                    size={24}
                    name = {focused ? 'create' : 'create_outline'}
                    color = {focused ? Colors.iconColorFocused : Colors.iconColor}
                />
            }}}
        />
    </Tabs>
  )
}

export default DashboardLayout

const styles = StyleSheet.create({})