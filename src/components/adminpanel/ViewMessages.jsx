import React, { useState, useEffect, useCallback } from "react";
import {
  getContacts,
  getContactById,
  updateContactById,
  deleteContactById
} from "../../utils/api";

import Notification from "./Notification";
import "../../assets/css/administrator.css";
import { Modal, Button, Form } from "react-bootstrap";

const ViewMessages = () => {
  const [contacts, setContacts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [modalSubject, setModalSubject] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");

  // =========================================================================
  //  Fetch Contacts (Updated)
  // =========================================================================
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getContacts();
      console.log("Contacts Response:", response.data);

      // تغییر برای دسترسی ایمن به داده‌ها
      const contactsData = response.data?.results || [];
      if (!Array.isArray(contactsData)) {
        throw new Error("فرمت داده‌های دریافتی اشتباه است.");
      }

      setContacts(contactsData);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err.response?.data?.message || "خطا در دریافت پیام‌ها.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // =========================================================================
  //  Open Modal for Viewing/Updating Contact
  // =========================================================================
  const handleOpenModal = async (contact) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getContactById(contact.id);
      const detailedContact = response.data;
      console.log("Detailed Contact Response:", response.data);

      setCurrentContact(detailedContact);
      setModalSubject(detailedContact.subject || "");
      setModalMessage(detailedContact.message || "");
      setModalStatus(detailedContact.status || "مشاهده شده");
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching contact details:", err);
      setError(err.response?.data?.message || "خطا در دریافت جزئیات پیام.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  Close Modal
  // =========================================================================
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentContact(null);
    setModalSubject("");
    setModalMessage("");
    setModalStatus("");
    setError("");
  };

  // =========================================================================
  //  Update Contact (Updated)
  // =========================================================================
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!currentContact) return;

    console.log("Submitting Update:", { modalSubject, modalMessage, modalStatus });

    setLoading(true);
    setError("");
    setSuccess("");

    const updatedContact = {
      subject: (modalSubject || "").trim(),
      message: (modalMessage || "").trim(),
      status: (modalStatus || "").trim(),
    };

    // Client-side Validation
    if (!updatedContact.subject || !updatedContact.status) {
      setError("لطفاً موضوع و وضعیت پیام را وارد کنید.");
      setLoading(false);
      return;
    }

    try {
      await updateContactById(currentContact.id, updatedContact);
      setSuccess("پیام با موفقیت به‌روزرسانی شد.");
      fetchContacts();
      handleCloseModal();
    } catch (err) {
      console.error("Error updating contact:", err);
      setError(err.response?.data?.message || "خطا در به‌روزرسانی پیام.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  Delete Contact (Updated)
  // =========================================================================
  const handleDeleteContact = async (id) => {
    if (!window.confirm("آیا مطمئن هستید می‌خواهید این پیام را حذف کنید؟")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await deleteContactById(id);
      setSuccess("پیام با موفقیت حذف شد.");
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
      setError(err.response?.data?.message || "خطا در حذف پیام.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  رابط کاربری (رندر)
  // =========================================================================
  return (
    <div className="container view-messages-container">
      <h2 className="my-4">مشاهده پیام‌ها</h2>

      {/* Notifications */}
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError("")}
          uniqueClass="view-messages-error-notification"
        />
      )}
      {success && (
        <Notification
          message={success}
          type="success"
          onClose={() => setSuccess("")}
          uniqueClass="view-messages-success-notification"
        />
      )}
      {loading && <p className="text-info">در حال بارگذاری...</p>}

      {/* Messages List */}
      <ul className="list-group messages-list">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="list-group-item d-flex justify-content-between align-items-center message-item"
          >
            <div className="message-summary">
              <strong>{contact.subject}</strong>
              <p className="mb-1">{contact.message.substring(0, 50)}...</p>
              <span className="badge bg-secondary">{contact.status || "جدید"}</span>
            </div>
            <div className="message-actions">
              <button
                onClick={() => handleOpenModal(contact)}
                className="btn btn-info btn-sm me-2"
                disabled={loading}
              >
                مشاهده
              </button>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="btn btn-danger btn-sm"
                disabled={loading}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* View/Update Contact Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Form onSubmit={handleSubmitUpdate}>
          <Modal.Header closeButton>
            <Modal.Title>جزئیات پیام</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="modalSubject">
              <Form.Label>موضوع</Form.Label>
              <Form.Control
                type="text"
                value={modalSubject}
                onChange={(e) => setModalSubject(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalMessage">
              <Form.Label>پیام</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalStatus">
              <Form.Label>وضعیت</Form.Label>
              <Form.Select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
                required
              >
                <option value="">انتخاب وضعیت</option>
                <option value="جدید">جدید</option>
                <option value="مشاهده شده">مشاهده شده</option>
                <option value="پاسخ داده شده">پاسخ داده شده</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              بستن
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              ذخیره تغییرات
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewMessages;
