const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createPoll,
  getPoll,
  vote,
  getUserPolls,
  deletePoll,
} = require("../controllers/pollController");

router.post("/", auth, createPoll);
router.get("/user", auth, getUserPolls);
router.get("/:id", getPoll);
router.post("/:id/vote", vote);
router.delete("/:id", auth, deletePoll);

module.exports = router;
