const mysql = require("mysql2/promise");
const dbConfig = require("../config");
const utils = require("../utils");

const todoService = require("../services/todo.service");

module.exports = {
  create: async (req, res) => {
    const { token, title, description, status, duedate } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Verify the token and get the user ID
      const userId = await utils.verifyToken(token);
      if (!userId) {
        // If token verification fails, return an error response
        res
          .status(401)
          .json({ message: "Token verification failed. Please log in again." });
        return;
      }

      // Check if the user has reached the limit of 50 tasks
      const taskCount = await todoService.getTaskCount(connection, userId);
      if (taskCount >= 50) {
        res
          .status(400)
          .json({ message: "Task limit reached (50 tasks allowed)." });
        return;
      }

      // Validate task properties as needed
      if (!title || title.length === 0) {
        res.status(400).json({ message: "Title is required." });
        return;
      }

      //check token field
      if (!token || token.length === 0) {
        res.status(400).json({ message: "Token is required." });
        return;
      }

      if (!description || description.length === 0) {
        res.status(400).json({ message: "Description is required." });
        return;
      }

      if (!duedate || duedate.length === 0) {
        res.status(400).json({ message: "Duedate is required." });
        return;
      }

      // Insert the new task into the database
      const [result] = await connection.execute(
        "INSERT INTO tbl_todo_list (user_id, title, description, status,due_date) VALUES (?, ?, ?, ?, ?)",
        [userId, title, description, status, duedate]
      );

      res
        .status(201)
        .json({ message: "Task added successfully", taskId: result.insertId });
      connection.end();
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server" });
    }
  },

  getAll: async (req, res) => {
    // Ensure the user is authenticated and has a valid token
    const bearerHeader = req.headers["authorization"];

    const bearer = bearerHeader.split(" ");

    const token = bearer[1];

    const userId = await utils.verifyToken(token);
    const connection = await mysql.createConnection(dbConfig);

    if (!userId) {
      res
        .status(401)
        .json({ message: "Authentication failed. Please log in again." });
      return;
    }

    try {
      // Retrieve tasks for the authenticated user
      const userTasks = await todoService.getTasksForUser(connection, userId);

      res.status(200).json(userTasks);
      connection.end();
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteToDo: async (req, res) => {
    const { token } = req.body;
    const taskId = req.params.id;
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Verify the token and get the user ID
      const userId = await utils.verifyToken(token);

      if (!userId) {
        res
          .status(401)
          .json({ message: "Token verification failed. Please log in again." });
        return;
      }

      // Check if the user owns the task by querying the database
      const task = await todoService.getTaskById(connection, taskId);

      if (!task) {
        res.status(404).json({ message: "Task not found." });
        return;
      }

      if (task.user_id !== userId) {
        res
          .status(403)
          .json({ message: "You are not authorized to update this task." });
        return;
      }

      // Update the task in the database
      await todoService.deleteTask(connection, taskId);

      res.status(200).json({ message: "Task deleted successfully" });
      connection.end();
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // PUT endpoint to update a specific To-Do task
  updateToDo: async (req, res) => {
    const { token, title, description, status, completiondate } = req.body;
    const taskId = req.params.id;
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Verify the token and get the user ID
      const userId = await utils.verifyToken(token);

      if (!userId) {
        res
          .status(401)
          .json({ message: "Token verification failed. Please log in again." });
        return;
      }

      // Check if the user owns the task by querying the database
      const task = await todoService.getTaskById(connection, taskId);

      if (!task) {
        res.status(404).json({ message: "Task not found." });
        return;
      }

      if (task.user_id !== userId) {
        res
          .status(403)
          .json({ message: "You are not authorized to update this task." });
        return;
      }

      // Update the task in the database
      await todoService.updateTask(
        connection,
        taskId,
        title,
        description,
        status,
        completiondate
      );

      res.status(200).json({ message: "Task updated successfully" });
      connection.end();
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  todosCount: async (req, res) => {
    // Ensure the user is authenticated and has a valid token
    const bearerHeader = req.headers["authorization"];

    const bearer = bearerHeader.split(" ");

    const token = bearer[1];

    const userId = await verifyToken(token);
    const connection = await mysql.createConnection(dbConfig);

    if (!userId) {
      res
        .status(401)
        .json({ message: "Authentication failed. Please log in again." });
      return;
    }

    try {
      // Retrieve tasks for the authenticated user
      const userTasks = await getTasksCount(connection, userId);

      res.status(200).json(userTasks);
      connection.end();
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  similarTasks: async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Ensure the user is authenticated and has a valid token
      const bearerHeader = req.headers["authorization"];

      const bearer = bearerHeader.split(" ");

      const token = bearer[1];

      const userId = await utils.verifyToken(token);
      // Retrieve tasks for the authenticated user
      const userTasks = await todoService.getTasksForUser(connection, userId);

      res.status(200).json({
        mesage: "Simialar tasks",
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      connection.end();
    }
  },
};
