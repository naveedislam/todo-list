const mysql = require("mysql2/promise");
const dbConfig = require("../config");

async function createTodo(userId, title, description, status, duedate) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check if the user has reached the limit of 50 tasks
    const taskCount = await getTaskCount(connection, userId);
    if (taskCount >= 50) {
      return {
        status: 400,
        message: "Task limit reached (50 tasks allowed).",
      };
    }

    // Validate task properties as needed
    if (!title || title.length === 0) {
      return {
        status: 400,
        message: "Title is required.",
      };
    }

    if (!description || description.length === 0) {
      return {
        status: 400,
        message: "Description is required.",
      };
    }

    if (!duedate || duedate.length === 0) {
      return {
        status: 400,
        message: "Duedate is required.",
      };
    }

    // Insert the new task into the database
    const [result] = await connection.execute(
      "INSERT INTO tbl_todo_list (user_id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?)",
      [userId, title, description, status, duedate]
    );

    return {
      status: 201,
      message: "Task added successfully",
      taskId: result.insertId,
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      status: 500,
      message: "Internal server error",
    };
  } finally {
    connection.end();
  }
}

async function getAllTodos(userId) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Retrieve tasks for the authenticated user
    const userTasks = await getTasksForUser(connection, userId);

    return {
      status: 200,
      data: userTasks,
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      status: 500,
      message: "Internal server error",
    };
  } finally {
    connection.end();
  }
}

async function deleteTodo(userId, taskId) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check if the user owns the task by querying the database
    const task = await getTaskById(connection, taskId);

    if (!task) {
      return {
        status: 404,
        message: "Task not found.",
      };
    }

    if (task.user_id !== userId) {
      return {
        status: 403,
        message: "You are not authorized to update this task.",
      };
    }

    // Update the task in the database
    await deleteTask(connection, taskId);

    return {
      status: 200,
      message: "Task deleted successfully",
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      status: 500,
      message: "Internal server error",
    };
  } finally {
    connection.end();
  }
}

async function updateTodo(
  userId,
  taskId,
  title,
  description,
  status,
  completiondate
) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check if the user owns the task by querying the database
    const task = await getTaskById(connection, taskId);

    if (!task) {
      return {
        status: 404,
        message: "Task not found.",
      };
    }

    if (task.user_id !== userId) {
      return {
        status: 403,
        message: "You are not authorized to update this task.",
      };
    }

    // Update the task in the database
    await updateTask(
      connection,
      taskId,
      title,
      description,
      status,
      completiondate
    );

    return {
      status: 200,
      message: "Task updated successfully",
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      status: 500,
      message: "Internal server error",
    };
  } finally {
    connection.end();
  }
}

async function getTodoCount(userId) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Retrieve tasks count for the authenticated user
    const taskCount = await getTasksCount(connection, userId);

    return {
      status: 200,
      count: taskCount,
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      status: 500,
      message: "Internal server error",
    };
  } finally {
    connection.end();
  }
}

async function getTasksForUser(connection, userId) {
  try {
    // Query the database to retrieve the task by userId
    const [rows] = await connection.execute(
      "SELECT * FROM tbl_todo_list WHERE user_id  = ?",
      [userId]
    );

    // Return the task details
    return rows;
  } catch (err) {
    throw err;
  }
}

///// Get Task by ID
async function getTaskById(connection, taskId) {
  try {
    // Query the database to retrieve the task by taskId
    const [rows] = await connection.execute(
      "SELECT * FROM tbl_todo_list WHERE id = ?",
      [taskId]
    );

    // Check if a task was found
    if (rows.length === 0) {
      return null; // Task not found
    }

    // Return the task details
    return rows[0];
  } catch (err) {
    throw err;
  }
}

//get user task maximum 50 tasks per users required
async function getTasksCount(connection, userId) {
  const [rows] = await connection.execute(
    "SELECT COUNT(*) as count FROM tbl_todo_list WHERE user_id = ?",
    [userId]
  );
  return rows[0].count;
}


module.exports = {
  createTodo,
  getAllTodos,
  deleteTodo,
  updateTodo,
  getTodoCount,
};
