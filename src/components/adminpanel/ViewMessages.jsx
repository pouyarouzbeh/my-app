// src/components/administrator/ViewMessages.jsx

import React, { useState, useEffect } from "react";
import {
  getContacts,
  getContactById,
  deleteContactById,
} from "../../utils/api";

import Notification from "./Notification";
import "../../assets/css/administrator.css";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const ViewMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalSubject, setModalSubject] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState(null);

  // =========================================================================
  //  Fetch Contacts
  // =========================================================================
  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getContacts();
      console.log("Contacts Response:", response.data);

      const contactsData = response.data?.results || [];
      if (!Array.isArray(contactsData)) {
        throw new Error("فرمت داده‌های دریافتی اشتباه است.");
      }

      setContacts(contactsData);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(
        err.response?.data?.message || "خطا در دریافت پیام‌ها."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // =========================================================================
  //  Open Modal for Viewing Contact
  // =========================================================================
  const handleOpenViewModal = async (contact) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getContactById(contact.id);
      const detailedContact = response.data;
      console.log("Detailed Contact Response:", response.data);
      setModalSubject(detailedContact.subject || "");
      setModalMessage(detailedContact.message || "");
      setModalStatus(detailedContact.status || "مشاهده شده");
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching contact details:", err);
      setError(
        err.response?.data?.message || "خطا در دریافت جزئیات پیام."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  Close View Modal
  // =========================================================================
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setModalSubject("");
    setModalMessage("");
    setModalStatus("");
    setError("");
  };

  // =========================================================================
  //  Open Delete Confirmation Modal
  // =========================================================================
  const handleOpenDeleteModal = (contactId) => {
    setDeleteContactId(contactId);
    setShowDeleteModal(true);
  };

  // =========================================================================
  //  Close Delete Confirmation Modal
  // =========================================================================
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteContactId(null);
    setError("");
  };

  // =========================================================================
  //  Delete Contact
  // =========================================================================
  const handleDeleteContact = async () => {
    if (!deleteContactId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await deleteContactById(deleteContactId);
      fetchContacts();
      setSuccess("پیام با موفقیت حذف شد.");
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Error deleting contact:", err);
      setError(
        err.response?.data?.message || "خطا در حذف پیام."
      );
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
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      )}

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
              <span className={`badge bg-${contact.status === "جدید" ? "primary" : contact.status === "مشاهده شده" ? "secondary" : "success"}`}>
                {contact.status || "جدید"}
              </span>
            </div>
            <div className="message-actions">
              <Button
                variant="info"
                size="sm"
                className="me-2"
                onClick={() => handleOpenViewModal(contact)}
                disabled={loading}
              >
                مشاهده
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleOpenDeleteModal(contact.id)}
                disabled={loading}
              >
                حذف
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* View Contact Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal}>
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>جزئیات پیام</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="modalSubject">
              <Form.Label>موضوع</Form.Label>
              <Form.Control
                type="text"
                value={modalSubject}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalMessage">
              <Form.Label>پیام</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={modalMessage}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalStatus">
              <Form.Label>وضعیت</Form.Label>
              <Form.Control
                type="text"
                value={modalStatus}
                readOnly
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseViewModal} disabled={loading}>
              بستن
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>تایید حذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            لغو
          </Button>
          <Button variant="danger" onClick={handleDeleteContact} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> در حال حذف...
              </>
            ) : (
              "حذف"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewMessages;
