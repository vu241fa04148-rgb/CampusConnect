const router = require("express").Router();
const { protect, studentOnly } = require("../middleware/auth");
const { createItem, getItems, myReports } = require("../controllers/itemController");
router.use(protect);
router.get("/", getItems);
router.get("/mine", myReports);
router.post("/", studentOnly, createItem);
module.exports = router;
