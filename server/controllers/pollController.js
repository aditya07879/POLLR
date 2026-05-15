const Poll = require("../models/Poll");

const getVoterIdentifier = (req) => {
  return req.headers["x-voter-token"] || req.ip || "unknown";
};

exports.createPoll = async (req, res) => {
  const { question, options, expiresAt } = req.body;

  if (!question || !options || options.length < 2 || options.length > 6)
    return res
      .status(400)
      .json({ message: "Question and 2–6 options required" });
  if (!expiresAt || new Date(expiresAt) <= new Date())
    return res.status(400).json({ message: "Expiry must be in the future" });

  try {
    const poll = await Poll.create({
      question,
      options: options.map((text) => ({ text, votes: 0 })),
      expiresAt: new Date(expiresAt),
      createdBy: req.userId,
    });
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({
      $or: [
        { slug: req.params.id },
        {
          _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null,
        },
      ],
    }).select("-voters");

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    res.json({ ...poll.toObject(), isExpired: new Date() > poll.expiresAt });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.vote = async (req, res) => {
  const { optionIndex } = req.body;
  const voterIdentifier = getVoterIdentifier(req);

  try {
    const poll = await Poll.findOne({
      $or: [
        { slug: req.params.id },
        {
          _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null,
        },
      ],
    });

    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (new Date() > poll.expiresAt)
      return res.status(403).json({ message: "Poll has expired" });
    if (poll.voters.includes(voterIdentifier))
      return res.status(409).json({ message: "You have already voted" });
    if (optionIndex < 0 || optionIndex >= poll.options.length)
      return res.status(400).json({ message: "Invalid option" });

    poll.options[optionIndex].votes += 1;
    poll.voters.push(voterIdentifier);
    await poll.save();

    const pollData = poll.toObject();
    delete pollData.voters;

    
    req.io.to(poll.slug).emit("voteUpdate", { ...pollData, isExpired: false });

    res.json({ ...pollData, isExpired: false });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.userId })
      .select("-voters")
      .sort({ createdAt: -1 });

    const pollsWithStatus = polls.map((p) => ({
      ...p.toObject(),
      isExpired: new Date() > p.expiresAt,
    }));

    res.json(pollsWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!poll)
      return res
        .status(404)
        .json({ message: "Poll not found or unauthorized" });
    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
