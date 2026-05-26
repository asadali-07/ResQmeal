const { Resend } = require("resend");
require("dotenv").config();


async function sendEmail(to, subject, text, html) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: "ResQMeal <noreply@mail.revoire.in>",
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Message sent:", response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email: " + error.message);
  }
}

module.exports = { sendEmail };