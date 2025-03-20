import React, { useState } from "react";
import "./Styles.css";
import { NavLink, useNavigate } from "react-router-dom";
import Images from "../Images/Grammar-correction.svg";
import Radiobtn from "../Components/RadioBtn/Radiobtn";
import Header from "../Home/Header/Header";
import axios from "axios";

const Signup = () => {
  const [Firstname, setFirstName] = useState("");
  const [Lastname, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState('');
  const [err, setErr] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!Firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!Lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (!Email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(Email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(Password)) {
      newErrors.password = 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    if (!userType) {
      newErrors.userType = 'User type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      Firstname,
      Lastname,
      Email,
      Password,
    };

    try {
      // Determine the endpoint based on the user type
      const endpoint = userType === 'student' ? 'student' : 'teacher';

      // Make a POST request to the appropriate backend signup endpoint
      const response = await axios.post(`http://localhost:8080/api/${endpoint}/signup`,data)
      

      const responseData = response.data
      setErr(responseData.message);

      if (response.ok) {
        // Navigate to the email verification page after successful signup
        navigate('/verify-email');
      } else if (response.status === 400) {
        setErrors(responseData.errors || {});
      } else {
        console.error("Registration failed with status code:", response.status);
      }
    } catch (error) {
      setErrors(error.message);
    }
  };

  // Define the handleClick function
  const handleClick = () => {
    console.log("Signup button clicked");
  };

  return (
    <>
      <Header />
      <div className="section">
        <article className="article">
          <div className="header">
            <h3 className="head">WELCOME</h3>
            <h4 className="Sub-head">join us today !!</h4>
          </div>
          <div className="inpts">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="input-x input-4"
                placeholder="Firstname"
                value={Firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstname && (
                <div className="error-message">{errors.firstname}</div>
              )}
              <input
                type="text"
                className="input-x input-5"
                placeholder="Lastname"
                value={Lastname}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastname && (
                <div className="error-message">{errors.lastname}</div>
              )}
              <input
                type="text"
                className="input-x input-6"
                placeholder="Email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
              <input
                type="password"
                className="input-x input-7"
                placeholder="Password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
              <div className="rad-btns">
                <Radiobtn userType={userType} setUserType={setUserType} />
              </div>
              {errors.userType && (
                <div className="error-message">{errors.userType}</div>
              )}
              <div className="signupage">
                <span>Already have an account? </span>
                <NavLink to="/Login" style={{ color: "green" }} className="link">
                  login
                </NavLink>
              </div>
              <div className="btn">
                <button type="submit" className="btn-4" onClick={handleClick}>
                  Signup
                </button>
              </div>
            </form>
            {err && (
              <div className="error-message">{err}</div>
            )}
          </div>
        </article>
        <div className="right-part">
          <img src={Images} alt="" className="imgs" />
        </div>
      </div>
      <p className='text-sm text-red-400 absolute bottom-3 left-3'>* Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.</p>
    </>
  );
};

export default Signup;
