const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/send-email", async (req, res) => {
    const { name, email, phone, service, message } = req.body;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !service || !message) {
        return res.status(400).send("Please fill out all required fields.");
    }

    if (!emailPattern.test(email)) {
        return res.status(400).send("Please enter a valid email address.");
    }

    if (message.length < 10) {
        return res.status(400).send("Please provide a message with at least 10 characters.");
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Chicago HVAC Website" <${process.env.SMTP_FROM}>`,
            to: "info@chicagohvac.biz",
            replyTo: email,
            subject: "New HVAC Website Lead",
            text: `
New HVAC service request:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Service: ${service}

Message:
${message}
      `,
        });

        res.redirect("/thank-you.html");
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).send("Email could not be sent.");
    }
});

app.listen(PORT, () => {
    console.log(`Chicago HVAC server running on http://localhost:${PORT}`);
});