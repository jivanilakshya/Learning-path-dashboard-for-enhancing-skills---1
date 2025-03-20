import React, { useState } from "react";
import HR from "../Login/Images/HR.svg";
import "./Login.css";
import { NavLink, useNavigate } from "react-router-dom";
import Radiobtn from "../Components/RadioBtn/Radiobtn";
import Header from "../Home/Header/Header";
import { authService } from "../../services/authService";

export default function Login() {
  // State to hold user input and errors
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState('');
  const [err, setErr] = useState('');

  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = {};

    if (!Email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(Email)) {
      newErrors.email = "Invalid email format";
    }

    if (!Password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!userType) {
      newErrors.userType = "Please select a user type";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const credentials = {
      Email: Email,
      Password: Password
    };

    try {
      console.log("Attempting to login with:", { userType, credentials });
      
      const response = await authService.login(userType, credentials);
      console.log("Login response:", response);

      if (response.statusCode === 200) {
        const userData = response.data;
        const userid = userData.user._id;
        
        console.log("Login successful");
        console.log("User approval status:", userData.user.Isapproved);
        
        if (userData.user.Isapproved === "pending") {
          if (userData.user.Teacherdetails || userData.user.Studentdetails) {
            navigate('/pending');
          } else {
            if (userType === 'student') {
              navigate(`/StudentDocument/${userid}`);
            } else if (userType === 'teacher') {
              navigate(`/TeacherDocument/${userid}`);
            }
          }
        } else if (userData.user.Isapproved === "approved") {
          if (userType === 'student') {
            navigate(`/Student/Dashboard/${userid}/Search`);
          } else if (userType === 'teacher') {
            navigate(`/Teacher/Dashboard/${userid}/Home`);
          }
        } else if (userData.user.Isapproved === "reupload") {
          navigate(`/rejected/${userType}/${userid}`);
        } else {
          setErr('You are banned from our platform!');
        }
      } else {
        setErr(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        setErr(error.response.data.message || "Login failed");
      } else if (error.request) {
        setErr("Cannot connect to server. Please make sure the server is running on port 8000.");
      } else {
        setErr("An error occurred during login. Please try again.");
      }
    }
  };

  return (
    <>
    <Header/>
    <section className="main">
      <div className="container">
        {/* <div className="logo">
          <img src="" alt="" />
          <h1 className="head">Logo</h1>
        </div> */}
        {/* headings */}
        <div className="para1">
          <h2> WELCOME BACK!</h2>
        </div>

        <div className="para">
          <h5> Please Log Into Your Account.</h5>
        </div>

        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="input-1">
              <input
                type="text"
                placeholder="Email Address"
                className="input-0"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>
            <div className="input-2">
              <input
                type="password"
                placeholder="Password"
                className="input-0"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            {/* radio buttons */}
            <div className="radio-btn">
              <Radiobtn  userType={userType} setUserType={setUserType}  />
            </div>
            {errors.userType && (
              <div className="error-message">{errors.userType}</div>
            )}

            <div className="signup-link">
              <span>Don't have an account? </span>
              <NavLink to="/signup" className="link text-yellow-400 text-semibold text-md ">
                signup
              </NavLink>
            </div>

            <div className="text-yellow-400 text-semibold pt-3 cursor-pointer" onClick={()=>navigate('/forgetpassword')} >
              Forget Password?
            </div>

            {/* btns */}
            <div className="btns">
              <button type="submit" className="btns-1" onClick={handleSubmit}> 
                Log In
              </button>
            </div>
            {err != '' && (
              <p className="text-red-400 text-sm">{err}</p>
            )}
            {/* {errors.general && (
              <div className="error-message">{errors.general}</div>
            )} */}
          </form>
        </div>
      </div>

      {/* image */}
      <div className="img-3">
        <img src={HR} width={600} alt="" />
      </div>
    </section>
    </>
  );
 
}
