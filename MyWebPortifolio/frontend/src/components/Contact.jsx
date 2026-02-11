import React from "react";
import "../styles/contact.css";

const Contact = () => {
  return (
    <section className="contact" id="contact">
      <h2>Contato</h2>
      <p>Entre em contato comigo:</p>
      
      <div className="contact-links">
        <a href="mailto:brunofraga@email.com">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M4 4h16v16H4V4zm8 9l8-5H4l8 5z"/>
          </svg>
          Email: brunofraga@email.com
        </a>
        <a href="https://linkedin.com/in/brunofraga" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M4 4h16v16H4V4zm4 14h2v-6H8v6zm1-7a1 1 0 100-2 1 1 0 000 2zm4 7h2v-3c0-1 0-3-2-3s-2 2-2 3v3z"/>
          </svg>
          LinkedIn: linkedin.com/in/brunofraga
        </a>
      </div>
    </section>
  );
};

export default Contact;
