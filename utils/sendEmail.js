import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message) => {
  // Creating a transporter object using Gmail's SMTP service
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // Defining email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
