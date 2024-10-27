exports.logout = async (req, res) => {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const token = req.headers["x-access-token"] || req.cookies["token"]; // Get user token
  const ua = req.headers["user-agent"]; // Get user agent

  const sessionToken = await conn.query(
    `SELECT * FROM sessions WHERE token=$1 AND ua=$2;`,
    [token, ua],
  );
  if (sessionToken.rowCount < 1) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Unauthorized",
        code: "auth/unauthorized",
      }); // Send 401 when token not found
  }

  await conn.query(`DELETE FROM sessions WHERE token=$1;`, [token]);
  return res
    .status(200)
    .clearCookie("token")
    .json({ status: "success", message: "Logged out" });
};
