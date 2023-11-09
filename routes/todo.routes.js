const express = require("express");
const router = express.Router();

const todoController = require("../controllers/todo.controller");

router.post("/", todoController.create);
router.get("/", todoController.getAll);
router.put("/:id", todoController.updateToDo);
router.delete("/:id", todoController.deleteToDo);
router.get("/count", todoController.todosCount);

module.exports = router;