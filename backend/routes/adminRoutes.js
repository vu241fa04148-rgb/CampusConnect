const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const { allClaims, reviewClaim } = require("../controllers/claimController");
router.use(protect, adminOnly);
router.get("/claims", allClaims);
router.put("/claims/:id", reviewClaim);
module.exports = router;
