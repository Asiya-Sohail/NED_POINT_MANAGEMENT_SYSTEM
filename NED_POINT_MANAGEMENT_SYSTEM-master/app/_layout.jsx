import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Slot , Stack} from 'expo-router'
import { UserProvider } from '../contexts/UserContext'
import { MenuProvider } from '../contexts/MenuContext'

const RootLayout = () => {
  return (
    <UserProvider>
      <MenuProvider>
        <Stack screenOptions={{
          headerStyle : {backgroundColor : '#ddd'},
          headerTintColor : '#333'
        }}>
          <Stack.Screen name ='index' options={{headerShown : false}}/>
          <Stack.Screen name='(portals)' options={{headerShown : false}}/>
          <Stack.Screen name='(student)' options={{headerShown : false}}/>
          <Stack.Screen name='register' options={{headerShown : false}}/>
          
        </Stack>
      </MenuProvider>
    </UserProvider>
  )
}

export default RootLayout

const styles = StyleSheet.create({})