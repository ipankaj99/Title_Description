import React from 'react'
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function Protected_Routes() 
{
  const [auth, setAuth]=useState(null);

  useEffect(()=>
   {
     async function checkProtected()
     {
        try{
            const response=await fetch('http://localhost:5000/protected', {
                credentials:"include"
            });

        const data= await response.json();
          if(response.ok)
          {
            setAuth(true);
          }
          else{
            setAuth(false);
          }

        }catch(err)
        {
           setAuth(false);
        }

     }
     checkProtected();

   }, [])
   if(auth==null)
   {
      return(
                <p>Checking Auth.....</p>
      )
   }
   if(!auth)
   {
    return(
        <Navigate to="/login"/>
    )
   }
  return (
      <Outlet/>
  )
}

export default Protected_Routes;