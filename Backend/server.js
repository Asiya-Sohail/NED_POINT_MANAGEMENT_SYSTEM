const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
// For posting
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Asiya@1234",
  database: "new_point_system",
});

// Creating an API
app.get("/", (req, res) => {
  return res.json("From Backend Side");
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users;";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

PORT = 3000;
app.listen(PORT, () => {
  console.log("Listening");
});

app.post("/register", (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const sql =
    "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, password, phone, role], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error", error: err });
    }
    console.log(
      `New user inserted: Name=${name}, Email=${email}, ID=${result.insertId}`
    );
    // console.log("Record inserted successfully:", result); // 👈 Logs success info
    return res.status(200).json({ message: "User registered successfully" });
  });
});

app.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const sql =
    "SELECT * FROM users WHERE email = ? AND password_hash = ? AND role = ?";

  db.query(sql, [email, password, role], (err, result) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (result.length > 0) {
      const user = result[0];
      return res.status(200).json({
        success: true,
        message: "User exists",
        userId: user.user_id, // ✅ include user ID in response
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
  });
});

//Student Portal Info
// Student Portal Info (Separate Queries)
app.get("/student/:id", (req, res) => {
  const userId = req.params.id;

  const resultData = {};

  const queries = [
    {
      name: "name",
      query: "SELECT name FROM users WHERE user_id = ?",
      key: "name",
    },
    {
      name: "email",
      query: "SELECT email FROM users WHERE user_id = ?",
      key: "email",
    },
    {
      name: "phone",
      query: "SELECT phone FROM users WHERE user_id = ?",
      key: "phone",
    },
    {
      name: "busBooked",
      query: `
      SELECT COALESCE(b.bus_name, 'Not Registered') AS busBooked
      FROM users u
      LEFT JOIN student_bus_registrations s ON u.user_id = s.student_id
      LEFT JOIN buses b ON s.bus_id = b.bus_id
      WHERE u.user_id = ? AND u.role = 'student'
    `,
      key: "busBooked",
    },
    {
      name: "feeStatus",
      query: "SELECT payment_status FROM payments WHERE student_id = ?",
      key: "feeStatus",
    },
    {
      name: "studentId",
      query: `
      SELECT IFNULL(s.student_id, 'Not registered') AS studentId
      FROM users u
      LEFT JOIN student_bus_registrations s ON u.user_id = s.student_id
      WHERE u.user_id = ?
    `,
      key: "studentId",
    },
    {
      name: "feedback",
      query: `
      SELECT comments FROM feedback WHERE student_id = ? 
      ORDER BY feedback_id DESC LIMIT 1
    `,
      key: "feedback",
    },
  ];

  let completed = 0;

  queries.forEach((q) => {
    db.query(q.query, [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      if (result.length > 0) {
        resultData[q.key] = result[0][q.key] || Object.values(result[0])[0];
      } else {
        resultData[q.key] = "Not Available";
      }

      completed++;

      if (completed === queries.length) {
        return res.status(200).json(resultData);
      }
    });
  });
});

app.get("/buses", (req, res) => {
  const sql = `SELECT 
          b.bus_id, 
          b.bus_name, 
          TIME(bs.departure_time) AS departure_time, 
          TIME(bs.arrival_time) AS arrival_time, 
          (b.max_capacity - COUNT(sbr.registration_id)) AS seats_available,
          r.route_name
      FROM buses b
      JOIN bus_schedule bs ON b.bus_id = bs.bus_id
      JOIN routes r ON bs.route_id = r.route_id
      LEFT JOIN student_bus_registrations sbr ON b.bus_id = sbr.bus_id
      GROUP BY b.bus_id, b.bus_name, bs.departure_time, bs.arrival_time, b.max_capacity, r.route_name;`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(result);
  });
});

app.get("/buses/:busId/stops", (req, res) => {
  const bus_id = req.params.busId;
  const sql = `SELECT st.stop_name
    FROM buses b
    JOIN bus_schedule s ON b.bus_id = s.bus_id
    JOIN routes r ON s.route_id = r.route_id
    JOIN route_stops rs ON rs.route_id = r.route_id
    JOIN stops st ON rs.stop_id = st.stop_id
    WHERE b.bus_id = ?
    ORDER BY rs.stop_sequence ASC;`;
  db.query(sql, [bus_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(result);
  });
});

app.get("/available-buses", (req, res) => {
  const sql = `SELECT b.bus_id, b.bus_name
    FROM buses b
    LEFT JOIN student_bus_registrations sbr ON b.bus_id = sbr.bus_id
    GROUP BY b.bus_id, b.bus_name, b.max_capacity
    HAVING (b.max_capacity - COUNT(sbr.registration_id)) > 0;`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(result);
  });
});

app.post("/register-bus", (req, res) => {
  const { student_id, bus_name } = req.body;

  const sql = `
  INSERT INTO student_bus_registrations (student_id, bus_id)
  SELECT ?, bus_id FROM buses WHERE bus_name = ?
`;

  db.query(sql, [student_id, bus_name], (err, result) => {
    if (err) {
      console.error("Bus registration error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    return res.status(200).json({ message: "Bus registered successfully" });
  });
});

app.get("/check-bus-status/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT
        COALESCE(b.bus_name, 'Not Registered') AS bus_status
    FROM
        users u
    LEFT JOIN
        student_bus_registrations sbr ON u.user_id = sbr.student_id
    LEFT JOIN
        buses b ON sbr.bus_id = b.bus_id
    WHERE
        u.user_id = ?;
`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.length > 0) {
      return res.status(200).json(result[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

// Get fee status by student ID
app.get("/fee-status/:id", (req, res) => {
  const studentId = req.params.id;
  const sql = "SELECT payment_status FROM payments WHERE student_id = ?";

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error fetching fee status:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res.status(200).json(result[0]);
    } else {
      return res.status(404).json({ message: "Student not found" });
    }
  });
});

// Update fee status to 'Completed'
app.post("/pay-fee", (req, res) => {
  const { student_id } = req.body;

  const sql =
    // "UPDATE payments SET payment_status = 'completed' WHERE student_id = ?";
    "INSERT INTO payments (student_id, amount, payment_date, payment_status, transaction_id) VALUES (?, 1500.00, NOW(), 'completed', CONCAT('TRX', FLOOR(RAND() * 1000000)));";

  db.query(sql, [student_id], (err, result) => {
    if (err) {
      console.error("Payment update failed:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Payment marked as completed" });
    } else {
      return res
        .status(404)
        .json({ message: "Student not found or already paid" });
    }
  });
});

// Get feedback status by student ID (similar to fee-status)
app.get("/feedback-status/:id", (req, res) => {
  const studentId = req.params.id;
  const sql =
    "SELECT * FROM feedback WHERE student_id = ? ORDER BY feedback_id DESC LIMIT 1";

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error fetching feedback status:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res.status(200).json({
        feedbackGiven: true,
        feedback: result[0],
      });
    } else {
      return res.status(200).json({
        feedbackGiven: false,
        feedback: null,
      });
    }
  });
});

// Submit feedback endpoint
app.post("/submit-feedback", (req, res) => {
  const { student_id, comments, bus_name } = req.body;

  // const sql = "INSERT INTO feedback (student_id, comments, feedback_date) VALUES (?, ?, NOW())";
  const sql = `
 INSERT INTO feedback (student_id, comments, bus_id, feedback_date)  VALUES (?, ?, (SELECT bus_id FROM BUSES WHERE bus_name = ?), NOW()); 
`;

  db.query(sql, [student_id, comments, bus_name], (err, result) => {
    if (err) {
      console.error("Feedback submission failed:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "Feedback submitted successfully",
        feedback_id: result.insertId,
      });
    } else {
      return res.status(500).json({
        message: "Failed to submit feedback",
      });
    }
  });
});

app.delete("/delete-account/:id", (req, res) => {
  const userId = req.params.id;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start failed:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const queries = [
      { sql: "DELETE FROM student_bus_registrations WHERE student_id = ?", values: [userId] },
      { sql: "DELETE FROM payments WHERE student_id = ?", values: [userId] },
      { sql: "DELETE FROM feedback WHERE student_id = ?", values: [userId] },
      { sql: "DELETE FROM bus_attendance WHERE student_id = ?", values: [userId] },
      { sql: "DELETE FROM incident_reports WHERE reported_by = ?", values: [userId] },
      { sql: "DELETE FROM notifications WHERE user_id = ?", values: [userId] },
      { sql: "DELETE FROM users WHERE user_id = ?", values: [userId] },
    ];

    const executeQuery = (index) => {
      if (index >= queries.length) {
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Commit failed:", err);
              res.status(500).json({ error: "Transaction commit failed" });
            });
          }
          res.json({ message: "User and related data deleted successfully." });
        });
        return;
      }

      const { sql, values } = queries[index];
      db.query(sql, values, (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Query failed:", err);
            res.status(500).json({ error: "Deletion failed" });
          });
        }
        executeQuery(index + 1);
      });
    };

    executeQuery(0);
  });
});


app.delete("/cancel-bus-registration/:id", (req, res) => {
  const studentId = req.params.id;

  db.query("DELETE FROM feedback WHERE student_id = ?", [studentId], (err) => {
    if (err) {
      console.error("Error deleting feedback:", err);
      return res.status(500).json({ success: false });
    }

    db.query("DELETE FROM payments WHERE student_id = ?", [studentId], (err) => {
      if (err) {
        console.error("Error deleting payments:", err);
        return res.status(500).json({ success: false });
      }

      db.query("DELETE FROM student_bus_registrations WHERE student_id = ?", [studentId], (err) => {
        if (err) {
          console.error("Error deleting registration:", err);
          return res.status(500).json({ success: false });
        }

        res.json({ success: true, message: "All data deleted successfully" });
      });
    });
  });
});


