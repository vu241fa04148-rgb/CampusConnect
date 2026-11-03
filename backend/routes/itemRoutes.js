const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { createItem, getItems } = require("../controllers/itemController");
router.get("/", protect, getItems);
router.post("/", protect, createItem);
module.exports = router;
