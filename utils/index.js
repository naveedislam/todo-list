const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

module.exports = {
  generateVerificationToken: (tokenLength) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const tokenArray = new Array(tokenLength);

    for (let i = 0; i < tokenLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      tokenArray[i] = characters.charAt(randomIndex);
    }

    const verificationToken = tokenArray.join("");

    return verificationToken;
  },

  sendVerificationEmail: (email, verificationLink) => {
    const mailOptions = {
      from: process.env.SG_SENDER_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `Click the following link to verify your email: <a href="${verificationLink}">Verify Email</a>`,
    };

    try {
      sgMail.setApiKey(process.env.SG_API_KEY);

      return sgMail.send(mailOptions);
    } catch (err) {
      throw new Error(`${err}`);
    }
  },

  //verify token function
  verifyToken: async (token) => {
    try {
      // Verify the token and extract the user ID
      const decoded = await jwt.verify(token, "secret_key");

      const userId = decoded.userId;
      return userId;
    } catch (err) {
      console.log(err);
      throw new Error("Token verification failed");
    }
  },

  areTasksSimilar: (task1, task2) => {
    const words1 = task1.toLowerCase().split(" ");
    const words2 = task2.toLowerCase().split(" ");

    for (const word of words1) {
      if (!words2.includes(word)) {
        return false;
      }
    }

    return true;
  },
};
