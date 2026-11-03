
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const Notification = require("../models/Notification");

exports.createClaim = async (req, res) => {
  try {
    const itemId = req.body.itemId || req.body.item;
    const { proofDescription } = req.body;

    if (!itemId || !proofDescription || !proofDescription.trim()) {
      return res.status(400).json({
        message: "Item and proof description are required"
      });
    }

    const item = await Item.findById(itemId);

    if (!item || item.status !== "active") {
      return res.status(404).json({
        message: "Item is unavailable"
      });
    }

    if (String(item.user) === String(req.user._id)) {
      return res.status(400).json({
        message: "You cannot claim your own listing"
      });
    }

    const pending = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: "pending"
    });

    if (pending) {
      return res.status(409).json({
        message: "You already submitted a pending claim"
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      proofDescription: proofDescription.trim()
    });

    await Notification.create({
      user: item.user,
      message: `A student submitted a claim for "${item.title}".`
    });

    res.status(201).json({
      message: "Claim submitted successfully",
      claim
    });

  } catch (error) {
    console.error("Claim submission error:", error);

    res.status(500).json({
      message: error.message || "Could not submit claim"
    });
  }
};

exports.myClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      claimant: req.user._id
    })
      .populate("item")
      .sort({ createdAt: -1 });

    res.json({ claims });

  } catch (error) {
    console.error("My claims error:", error);

    res.status(500).json({
      message: "Could not load claims"
    });
  }
};

exports.allClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("item")
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });

    res.json({ claims });

  } catch (error) {
    console.error("All claims error:", error);

    res.status(500).json({
      message: "Could not load claims"
    });
  }
};

exports.reviewClaim = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected"
      });
    }

    const claim = await Claim.findById(req.params.id).populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found"
      });
    }

    claim.status = status;
    claim.reviewedBy = req.user._id;

    await claim.save();

    if (status === "approved") {
      await Item.findByIdAndUpdate(claim.item._id, {
        status: "claimed"
      });
    }

    await Notification.create({
      user: claim.claimant,
      message: `Your claim was ${status}.`
    });

    res.json({ claim });

  } catch (error) {
    console.error("Review claim error:", error);

    res.status(500).json({
      message: "Could not review claim"
    });
  }
};
