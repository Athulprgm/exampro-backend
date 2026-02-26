import dotenv from "dotenv";
dotenv.config();
import sendEmail from "../utils/sendEmail.js";

console.log("Testing email configuration...");
console.log("User:", process.env.EMAIL_USER);
// console.log('Pass:', process.env.EMAIL_PASS); // Security: don't log pass

const test = async () => {
  try {
    console.log("Attempting to send email...");
    await sendEmail({
      email: process.env.EMAIL_USER,
      subject: "Test Email form ExamSeatPro",
      message:
        "This is a test email to verify configuration. If you see this, email sending is working!",
    });
    console.log("✅ Test email sent successfully! Check your inbox.");
  } catch (error) {
    console.error("❌ Test email failed:", error);
  }
};

test();
