
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  createClaim,
  myClaims,
  allClaims,
  reviewClaim
} = require("../controllers/claimController");

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

router.use(protect);

router.post("/", createClaim);
router.get("/mine", myClaims);
router.get("/all", adminOnly, allClaims);
router.put("/:id/review", adminOnly, reviewClaim);

module.exports = router;
