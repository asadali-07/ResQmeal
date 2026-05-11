const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const accessToken = await oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: accessToken.token,
  },
});

transporter.verify((error, success) => {
  if (error) console.error("Error connecting to email server:", error);
  else console.log("Email server is ready to send messages ✅");
});

async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Asad Ali" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };