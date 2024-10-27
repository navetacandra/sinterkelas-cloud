exports.authenticated = async function (req, res, next) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const token = req.headers["x-access-token"] || req.cookies["token"]; // Get user token
  const ua = req.headers["user-agent"]; // Get user agent

  if (!token) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Unauthorized",
        code: "auth/unauthorized",
      }); // Send 401 when token not provided
  }

  const session = await conn.query(
    `SELECT * FROM sessions WHERE token=$1 AND ua=$2;`,
    [token, ua],
  ); // Check on sessions
  if (session.rowCount < 1) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Unauthorized",
        code: "auth/unauthorized",
      }); // Send 401 when token not found
  }
  const user = await conn.query(`SELECT * FROM users WHERE id=$1;`, [
    session.rows[0].user_id,
  ]); // Check on users
  if (user.rowCount < 1) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Unauthorized",
        code: "auth/unauthorized",
      }); // Send 401 when user not found
  }
  next(); // Proceed to next middleware
};
