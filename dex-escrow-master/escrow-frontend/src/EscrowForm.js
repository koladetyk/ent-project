import React, { useState } from "react"; // Import React and useState hook for state management
import axios from "axios"; // Import axios for making HTTP requests

/**
 * Component representing an escrow form.
 */
function EscrowForm() {
  // Initialize state with initial form data values
  const [formData, setFormData] = useState({
    sender: "", // Sender address
    receiver: "", // Receiver address
    amount: "", // Amount to be transferred
    secret: "", // Secret key for transaction security
  });

  /**
   * Event handler for input changes.
   * Updates the corresponding field in the form data state.
   * @param {Event} e - The event object containing the input element's name and value.
   */
  const handleChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target
    setFormData({ ...formData, [name]: value }); // Update the state with the new value
  };

  /**
   * Asynchronous function to submit the form data.
   * Prevents the default form submission behavior, sends a POST request to the server,
   * logs the response or error, and logs the submitted form data.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await axios.post(
        "http://localhost:5000/api/escrow", // API endpoint URL
        formData // Form data to send
      );
      console.log("Transaction successful:", response.data); // Log success message and response data
    } catch (error) {
      console.error("Error submitting form:", error); // Log error message
    }
    console.log("Form submitted:", formData); // Log submitted form data
  };

  // Render the form UI
  return (
    <form onSubmit={handleSubmit}>
      {" "}
      {/* Form element with onSubmit handler */}
      <div>
        <label>Sender Address:</label> {/* Label for sender address input */}
        <input
          type="text"
          name="sender"
          value={formData.sender} // Bind input value to state
          onChange={handleChange} // Attach change handler
        />
      </div>
      <div>
        <label>Receiver Address:</label>{" "}
        {/* Label for receiver address input */}
        <input
          type="text"
          name="receiver"
          value={formData.receiver} // Bind input value to state
          onChange={handleChange} // Attach change handler
        />
      </div>
      <div>
        <label>Amount:</label> {/* Label for amount input */}
        <input
          type="text"
          name="amount"
          value={formData.amount} // Bind input value to state
          onChange={handleChange} // Attach change handler
        />
      </div>
      <div>
        <label>Secret:</label> {/* Label for secret input */}
        <input
          type="text"
          name="secret"
          value={formData.secret} // Bind input value to state
          onChange={handleChange} // Attach change handler
        />
      </div>
      <button type="submit">Submit</button> {/* Submit button */}
    </form>
  );
}

export default EscrowForm; // Export the component for use elsewhere
