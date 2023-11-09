const todoService = require("../services/todo.service");

module.exports = {
  create: async (req, res) => {
    const { title, description, status, duedate } = req.body;
    const { userId } = req;

    const result = await todoService.createTodo(userId, title, description, status, duedate);

    res.status(result.status).json(result);
  },

  getAll: async (req, res) => {
    const { userId } = req;

    const result = await todoService.getAllTodos(userId);

    res.status(result.status).json(result.data);
  },

  deleteToDo: async (req, res) => {
    const taskId = req.params.id;
    const { userId } = req;

    const result = await todoService.deleteTodo(userId, taskId);

    res.status(result.status).json(result);
  },

  updateToDo: async (req, res) => {
    const { title, description, status, completiondate } = req.body;
    const { userId } = req;
    const taskId = req.params.id;

    const result = await todoService.updateTodo(userId, taskId, title, description, status, completiondate);

    res.status(result.status).json(result);
  },

  todosCount: async (req, res) => {
    const { userId } = req;

    const result = await todoService.getTodoCount(userId);

    res.status(result.status).json(result);
  },
};
