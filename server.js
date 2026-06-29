const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const submissions = new Map();
const distPath = path.join(__dirname, "dist");
const distIndex = path.join(distPath, "index.html");
const hasBuiltFrontend = fs.existsSync(distIndex);

const cacheHeaders = (res, filePath) => {
    if (/\.(?:css|js|png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    }

    if (/\.html$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
    }
};

app.use(
    "/assets",
    express.static(path.join(__dirname, "assets"), {
        etag: true,
        lastModified: true,
        maxAge: "30d",
        setHeaders: cacheHeaders,
    })
);

app.use(
    express.static(hasBuiltFrontend ? distPath : path.join(__dirname), {
        etag: true,
        lastModified: true,
        maxAge: "30d",
        setHeaders: cacheHeaders,
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/send-email", async (req, res) => {
    const { name, email, phone, service, message, website } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (website) return res.status(200).send("OK");

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();
    const lastRequest = submissions.get(ip);

    if (lastRequest && now - lastRequest < 60000) {
        return res.status(429).send("Too many requests. Please wait 1 minute.");
    }

    submissions.set(ip, now);

    if (!name || !email || !service || !message) {
        return res.status(400).send("Please fill out all required fields.");
    }

    if (!emailPattern.test(email)) {
        return res.status(400).send("Please enter a valid email address.");
    }

    if (!message.trim()) {
        return res.status(400).send("Please provide a message.");
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
            to: "info@chicago-hvac.biz",
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

        await transporter.sendMail({
            from: `"Chicago HVAC" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: "We received your request",
            text: `
Hello ${name},

Thank you for contacting Chicago HVAC.

We have received your request regarding ${service} and will get back to you as soon as possible.

If this is an emergency, please call us directly at +1 (773) 216-0806.

Best regards,
Chicago HVAC
6610 N Northwest Hwy
Chicago, IL 60631
`,
        });

        res.redirect("/thank-you.html");
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).send("Email could not be sent.");
    }
});

app.get(/.*/, (req, res, next) => {
    if (!hasBuiltFrontend) return next();

    if (req.path.startsWith("/assets/") || req.path.startsWith("/src/")) {
        return next();
    }

    res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
    return res.sendFile(distIndex);
});

app.listen(PORT, () => {
    console.log(`Chicago HVAC server running on http://localhost:${PORT}`);
});
