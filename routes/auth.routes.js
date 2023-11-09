const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot", authController.forgot);
router.get("/verify", authController.verify);


module.exports = router;