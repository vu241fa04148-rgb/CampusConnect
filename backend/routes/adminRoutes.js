const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const { allClaims, reviewClaim } = require("../controllers/claimController");
const Item = require("../models/Item");
const User = require("../models/User");

router.use(protect, adminOnly);
router.get("/claims", allClaims);
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Could not load all items." });
  }
});
router.put("/claims/:id", reviewClaim);
router.get("/stats", async (req, res) => {
  try {
    const [users, items, claims, pending, approved, rejected, successful] = await Promise.all([
      User.countDocuments(), Item.countDocuments(), require("../models/Claim").countDocuments(),
      require("../models/Claim").countDocuments({ status: "pending" }),
      require("../models/Claim").countDocuments({ status: "approved" }),
      require("../models/Claim").countDocuments({ status: "rejected" }),
      require("../models/Claim").countDocuments({ status: "successful" })
    ]);
    res.json({ users, items, claims, pending, approved, rejected, successful });
  } catch (error) {
    res.status(500).json({ message: "Could not load dashboard statistics." });
  }
});
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "admin"].includes(role)) return res.status(400).json({ message: "Role must be student or admin." });
    if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: "You cannot change your own role." });
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true }).select("name email role createdAt");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User role updated.", user });
  } catch (error) {
    res.status(500).json({ message: "Could not update user role." });
  }
});
router.delete("/users/:id", async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: "You cannot delete your own account." });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const ownedItems = await Item.find({ user: user._id }).distinct("_id");
    const Claim = require("../models/Claim");
    await Claim.deleteMany({ $or: [{ claimant: user._id }, { item: { $in: ownedItems } }] });
    await Item.deleteMany({ user: user._id });
    await require("../models/Notification").deleteMany({ user: user._id });
    await user.deleteOne();
    res.json({ message: "User and related records deleted." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete user." });
  }
});
router.patch("/items/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "claimed", "returned", "closed"].includes(status)) return res.status(400).json({ message: "Invalid item status." });
    const item = await Item.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true }).populate("user", "name");
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json({ message: "Item status updated.", item });
  } catch (error) {
    res.status(500).json({ message: "Could not update item status." });
  }
});
router.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    await require("../models/Claim").deleteMany({ item: item._id });
    res.json({ message: "Item and its claims deleted." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete item." });
  }
});
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Could not load users." });
  }
});
module.exports = router;
