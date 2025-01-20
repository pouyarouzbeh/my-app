// src/components/adminpanel/AdminHomePage.jsx

import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, Row, Col } from "react-bootstrap";
import { FaUser, FaEnvelope, FaSmile } from "react-icons/fa";

const AdminHomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="admin-homepage">
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <FaSmile size={50} className="mb-3 text-primary" />
              <Card.Title>خوش آمدید، {user.first_name}!</Card.Title>
              <Card.Text>
                به پنل مدیریت سامانه خوش‌آمدید. از طریق نوار کناری می‌توانید به بخش‌های مختلف مدیریت دسترسی داشته باشید.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaUser size={30} className="text-success me-3" />
              <div>
                <Card.Title>نام کاربری</Card.Title>
                <Card.Text>{user.username}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaEnvelope size={30} className="text-warning me-3" />
              <div>
                <Card.Title>ایمیل</Card.Title>
                <Card.Text>{user.email}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHomePage;
