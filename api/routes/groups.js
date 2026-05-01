import express from "express";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/groups — Get all groups the user is part of
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ createdBy: req.user._id }, { "members.user": req.user._id }],
    })
      .populate("createdBy", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/groups/:id — Get a specific group
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is member or creator
    const isMember =
      group.createdBy._id.toString() === req.user._id.toString() ||
      group.members.some((m) => m.user?._id.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups — Create a new group
router.post("/", async (req, res) => {
  try {
    const { name, description, icon, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name,
      description: description || "",
      icon: icon || "👥",
      category: category || "general",
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          name: req.user.name,
          email: req.user.email,
          isAdmin: true,
        },
      ],
    });

    const populatedGroup = await group.populate(
      "createdBy members.user",
      "name email avatar"
    );
    res.status(201).json(populatedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/groups/:id — Update a group
router.put("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator or admin can update
    const isAdmin =
      group.createdBy.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          m.user?.toString() === req.user._id.toString() && m.isAdmin
      );

    if (!isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(group, req.body);
    await group.save();

    const updated = await group.populate(
      "createdBy members.user",
      "name email avatar"
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups/:id/add-member — Add a member to group
router.post("/:id/add-member", async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin =
      group.createdBy.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          m.user?.toString() === req.user._id.toString() && m.isAdmin
      );

    if (!isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!userId && !email) {
      return res.status(400).json({ message: "userId or email is required" });
    }

    // Check if member already exists
    const exists = group.members.some(
      (m) =>
        m.user?.toString() === userId ||
        m.email === email
    );

    if (exists) {
      return res.status(400).json({ message: "Member already in group" });
    }

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      group.members.push({
        user: userId,
        name: user.name,
        email: user.email,
        isAdmin: false,
      });
    } else {
      group.members.push({
        user: null,
        name: name || "Unknown",
        email,
        isAdmin: false,
      });
    }

    await group.save();
    const updated = await group.populate(
      "createdBy members.user",
      "name email avatar"
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/groups/:id/remove-member/:memberId — Remove member from group
router.delete("/:id/remove-member/:memberId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin =
      group.createdBy.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          m.user?.toString() === req.user._id.toString() && m.isAdmin
      );

    if (!isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    group.members = group.members.filter(
      (m) => m._id.toString() !== req.params.memberId
    );

    await group.save();
    const updated = await group.populate(
      "createdBy members.user",
      "name email avatar"
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/groups/:id — Delete a group
router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator can delete
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
