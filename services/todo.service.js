module.exports = {
  //get user task maximum 50 tasks per users required

  getTaskCount: async (connection, userId) => {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM tbl_todo_list WHERE user_id = ?",
      [userId]
    );
    return rows[0].count;
  },

  ///// Get Task by ID
  getTaskById: async (connection, taskId) => {
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
  },

  //Update task function
  updateTask: async (
    connection,
    taskId,
    title,
    description,
    status,
    completiondate
  ) => {
    try {
      // Update the task in the database
      await connection.execute(
        "UPDATE tbl_todo_list SET title = ?, description = ?, status = ?, completion_dt = ? WHERE id = ?",
        [title, description, status, completiondate, taskId]
      );
    } catch (err) {
      throw err;
    }
  },

  //Delete task function
  deleteTask: (connection, taskId) => {
    try {
      return connection.execute("DELETE FROM tbl_todo_list WHERE id = ?", [
        taskId,
      ]);
    } catch (err) {
      throw err;
    }
  },

  //get all users list
  getTasksForUser: async (connection, userId) => {
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
  },
};
