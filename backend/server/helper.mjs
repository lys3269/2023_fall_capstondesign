// helper.mjs
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

const helperRouter = express.Router();

// dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

helperRouter.get("/", (req, res) => {
  res.json("success도우미");
});


// 이용자 목록을 반환하는 엔드포인트
helperRouter.get("/users", async (req, res) => {
  const client = await pool.connect();
  try {
    const users = await client.query(`SELECT * FROM user_data`);
    res.json(users.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching user data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the user data." });
  }
});

// 특정 이용자 정보 반환하는 엔드포인트
helperRouter.get("/users/:user_id", async (req, res) => {
  const client = await pool.connect();
  const userId = parseInt(req.params.user_id);
  try {
    const user = await client.query(`SELECT * FROM user_data WHERE id = $1`, [
      userId,
    ]);
    res.json(user.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching user data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the user data." });
  }
});

// 도우미가 수락/거절했을경우 이용자의 요구사항목록 데이터에서 status를 수락/거절으로 변경하는 엔드포인트
helperRouter.put("/response-request/:request_id", async (req, res) => {
  const client = await pool.connect();
  const requestId = parseInt(req.params.request_id);
  const { status } = req.body;
  try {
    const result = await client.query(
      `UPDATE requests_data SET status=$1 WHERE id = $2`,
      [requestId, status]
    );
  } catch (err) {
    console.error("Error updating request status:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the request status." });
  }
});

// 이용자의 요구사항 목록을 반환하는 엔드포인트
helperRouter.get("/requests-user/:user_id", async (req, res) => {
  const client = await pool.connect();
  const userId = parseInt(req.params.user_id);
  try {
    const requests = await client.query(
      `SELECT * FROM requests_data WHERE user_id = $1`,
      [userId]
    );
    res.json(requests.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching request data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the request data." });
  }
});

// 도우미의 호출된 목록 반환하는 엔드포인트
helperRouter.get("/requests-helper/:helper_id", async (req, res) => {
  const client = await pool.connect();
  const helperId = parseInt(req.params.helper_id);
  if (isNaN(helperId)) {
    res.status(400).json({ error: "Invalid helper ID" });
    return;
  }
  try {
    const requests = await client.query(
      `SELECT * FROM requests_data WHERE helper_id = $1`,
      [helperId]
    );
    res.json(requests.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching request data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the request data." });
  }
});

// 도우미의 호출된 목록 중 수락된 목록 반환하는 엔드포인트
helperRouter.get("/requests-helper/:helper_id/accepted", async (req, res) => {
  const client = await pool.connect();
  const helperId = parseInt(req.params.helper_id);
  try {
    const requests = await client.query(
      `SELECT * FROM requests_data WHERE helper_id = $1 AND status = '수락'`,
      [helperId]
    );
    res.json(requests.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching request data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the request data." });
  }
});

// 도우미 총수입 불러오기
helperRouter.get("/requests-helper/:helper_id/totalpay", async (req, res) => {
  const client = await pool.connect();
  const helperId = parseInt(req.params.helper_id);
  try {
    const requests = await client.query(
      `SELECT SUM(totalpay) FROM requests_data WHERE helper_id = $1 AND status = '수락'`,
      [helperId]
    );
    res.json(requests.rows);
    client.release();
  } catch (err) {
    console.error("Error fetching request data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the request data." });
  }
});

export default helperRouter;
