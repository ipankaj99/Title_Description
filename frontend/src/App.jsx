import React from 'react'
import {Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import DashBoard from './components/DashBoard';
import Signup from './components/Signup';
import Protected_Routes from './components/Protected_Route/Protected_Routes';
import Password from './components/Password';
function App() {
  return (
  <Routes>
     <Route path="/" element={<Signup/>} />
     <Route path="/login" element={<Login/>} />

     {/* protected route */}
     <Route element={<Protected_Routes/>}>
        <Route path="/dashboard" element={<DashBoard/>} />
     </Route>
     <Route path="/forgot-password" element={<ForgotPassword/>} />
     <Route path="/password" element={<Password/>} />

  
   
     
  </Routes>
  )
}

export default App