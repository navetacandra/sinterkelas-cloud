exports.forceLogout = async (req, res) => {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  let actorToken = req.headers["x-access-token"] || req.cookies["token"]; // Get user token
  const { token } = req.body;
  const ua = req.headers["user-agent"]; // Get user agent

  const sessionToken = await conn.query(
    `WITH actor AS (
      SELECT * FROM sessions 
      WHERE token=$1 AND ua=$2
    ) 
    SELECT * FROM sessions WHERE user_id=(SELECT user_id FROM actor) AND token=$3;`,
    [actorToken, ua, token],
  );
  if (sessionToken.rowCount < 1) {
    return res.status(400).json({ status: "error", message: "Invalid token" }); // Send 401 when token not found
  }

  await conn.query(`DELETE FROM sessions WHERE token=$1;`, [token]);
  const response = res.status(200);
  if (actorToken == token) {
    response.clearCookie("token");
    actorToken = null;
  }
  response.json({
    status: "success",
    message: "Logged out",
    data: { token: actorToken },
  });
};
