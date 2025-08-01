import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null); // null means no user logged in

  const loginUser = (user) => {
    if (loggedInUser) return false; // someone is already logged in
    console.log(user);
    setLoggedInUser(user);
    return true;
  };
  
  const logoutUser = () => {
    setLoggedInUser(null);
  };

  return (
    <UserContext.Provider value={{ loggedInUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
