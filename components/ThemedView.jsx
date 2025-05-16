import { View } from 'react-native'
import {Colors} from '../constants/Colors'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ThemedView = ({style, safe = false , ...props}) => {

    const insets = useSafeAreaInsets()

    if (!safe) return (
    <View 
        style={[{
          backgroundColor : Colors.background,
          paddingTop : insets.top,
          paddingBottom : insets.bottom
        }, style]}
        {...props}
    />
  )


  return (
    <View 
        style={[{backgroundColor : Colors.background}, style]}
        {...props}
    />
  )
}

export default ThemedView
