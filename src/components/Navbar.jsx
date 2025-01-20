import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { FaUserCircle } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { Modal, Button, Dropdown, Image } from "react-bootstrap"; // اضافه کردن Modal و Button
import { AuthContext } from "./context/AuthContext";

import Logo1 from "../assets/pics/unvarm.gif";
import "../assets/css/common.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  

  useEffect(() => {
    if (user.isLoggedIn) {
      setUserName(
        user.is_admin
          ? "ادمین"
          : (user.first_name && user.last_name)
          ? `${user.first_name} ${user.last_name}`
          : "لطفا اطلاعات خود را کامل کنید"
      );
      
      setAvatar(user.avatar || null);
    } else {
      setUserName("");
      setAvatar(null);
    }
  }, [user]);

  const handleLogout = () => {
    setShowLogoutModal(false); // بستن مدال
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container container1">
          <Link className="navbar-brand d-flex align-items-center me-auto" to="/">
            <img
              src={Logo1}
              alt="لوگوی دانشگاه شهید رجایی"
              className="navbar-logo ms-2"
            />
            <span className="ms-2 uni">دانشگاه شهید رجایی</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <HashLink className="nav-link ms-4" to="/#home">
                  خانه
                </HashLink>
              </li>
              <li className="nav-item">
                <HashLink className="nav-link ms-4" to="/#about">
                  درباره ما
                </HashLink>
              </li>
              <li className="nav-item">
                <HashLink className="nav-link ms-4" to="/#services">
                  خدمات ما
                </HashLink>
              </li>
              <li className="nav-item">
                <HashLink className="nav-link ms-4" to="/#register">
                  پیش ثبت نام
                </HashLink>
              </li>
              <li className="nav-item">
                <HashLink className="nav-link ms-4" to="/#contact">
                  تماس با ما
                </HashLink>
              </li>
            </ul>

            <div className="ms-auto user-section">
              {user.isLoggedIn ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="custom-dropdown" id="dropdown-basic" className="dropdown-toggle">
                    {avatar ? (
                      <Image
                        src={avatar}
                        roundedCircle
                        className="user-avatar"
                        alt="User Avatar"
                      />
                    ) : (
                      <FaUserCircle size={22}/>
                    )}
                    <span className="user-name">{userName}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate(user.is_admin ? "/admin" : "/profile")}>
                      پروفایل
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => setShowLogoutModal(true)} // نمایش مدال هنگام کلیک
                      className="logout-button"
                    >
                      <IoLogOutOutline size={16} className="me-2" />
                      خروج
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="login-link">
                   <FaUserCircle size={21} className="me-2" /><span className="login-text1">ورود</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

 
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأیید خروج</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            انصراف
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            خروج
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Navbar;