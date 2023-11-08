const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const todoController = require("../controllers/todo.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot", authController.forgot);
router.get("/verify", authController.verify);

router.post("/todo", todoController.create);
router.put("/todo/:id", todoController.updateToDo);
router.delete("/todo/:id", todoController.deleteToDo);
router.get("/todo", todoController.getAll);
router.get("/todo/count", todoController.todosCount);
router.get("/todo/similar", todoController.similarTasks);

module.exports = router;