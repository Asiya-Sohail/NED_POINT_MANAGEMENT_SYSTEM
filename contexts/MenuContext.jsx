import React, { createContext, useState } from 'react';

export const MenuContext = createContext();

export const MenuProvider = ({children}) => {
  const [registerBusVisible, setRegisterBusVisible] = useState(false);
  const [feeStatus, setFeeStatus] = useState('');
  const [feedbackgiven, setFeedbackgiven] = useState(null); // null = not checked, true = already given, false = not yet given
  

  return (
    <MenuContext.Provider value={{ registerBusVisible, setRegisterBusVisible , feeStatus, setFeeStatus,
    feedbackgiven, setFeedbackgiven}}>
      {children}
    </MenuContext.Provider>
  );
}