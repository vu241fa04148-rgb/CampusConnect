const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const { title, type, category, description, location, date, imageUrl } = req.body;
    if (!title || !["lost", "found"].includes(type) || !description || !location || !date) {
      return res.status(400).json({ message: "Please complete all required fields" });
    }
    const item = await Item.create({
      title, type, category, description, location, date, imageUrl,
      user: req.user._id
    });
    res.status(201).json({ item });
  } catch {
    res.status(500).json({ message: "Could not create item" });
  }
};

exports.getItems = async (req, res) => {
  try {
    const filter = {};
    if (["lost", "found"].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.search) filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { location: { $regex: req.query.search, $options: "i" } }
    ];
    if (req.query.mine === "true") filter.user = req.user._id;
    const items = await Item.find(filter).populate("user", "name").sort({ createdAt: -1 });
    res.json({ items });
  } catch {
    res.status(500).json({ message: "Could not load items" });
  }
};
