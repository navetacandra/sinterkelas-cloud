exports.me = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const token = req.headers["x-access-token"] || req.cookies["token"]; // Get user token

  try {
    const userRecord = await conn.query(
      `WITH u AS (
        SELECT * FROM users WHERE id=(SELECT user_id FROM sessions WHERE token=$1 LIMIT 1) LIMIT 1
      )
      SELECT 
        u.id AS user_id,
        u.username,
        CASE
          WHEN u.role = 'admin' THEN a.name
          WHEN u.role = 'teacher' THEN t.name
          WHEN u.role = 'student' THEN s.name
        END AS name,
        CASE
          WHEN u.role = 'student' THEN s.nis
        END AS nis,
        u.role
      FROM u 
      LEFT JOIN students s ON u.id=s.user_id 
      LEFT JOIN teachers t ON u.id=t.user_id 
      LEFT JOIN admins a ON u.id=a.user_id
      LIMIT 1;`,
      [token],
    );
    return res
      .status(200)
      .json({ status: "success", data: userRecord.rows[0] });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
