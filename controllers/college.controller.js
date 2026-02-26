import College from "../models/College.model.js";
import User from "../models/User.model.js";

/**
 * @desc    Register a new college
 * @route   POST /api/colleges/register
 * @access  Public
 */
export const registerCollege = async (req, res, next) => {
  try {
    const {
      collegeName,
      type,
      address,
      adminName,
      adminEmail,
      adminContact,
      adminPassword,
      adminRole,
    } = req.body;

    // Check if college with email already exists
    const existingCollege = await College.findOne({ adminEmail });
    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: "College with this email already exists",
      });
    }

    // Generate unique college code
    const prefix = collegeName.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    const collegeCode = `${prefix}${random}`;

    // Create college
    const college = await College.create({
      collegeName,
      collegeCode,
      type,
      address,
      adminEmail,
      adminContact,
      adminName,
    });

    // Create admin user
    const adminUser = await User.create({
      username: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      adminRole: adminRole || "principal",
      college: college._id,
      contactNumber: adminContact,
    });

    res.status(201).json({
      success: true,
      data: {
        college,
        collegeCode: college.collegeCode,
      },
      message: "College registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get college details
 * @route   GET /api/colleges/:id
 * @access  Private
 */
export const getCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update college
 * @route   PUT /api/colleges/:id
 * @access  Private (Admin only)
 */
export const updateCollege = async (req, res, next) => {
  try {
    let college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const { adminPassword, adminEmail, adminName, adminContact } = req.body;

    // Update college record
    college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Sync with User record
    const user = await User.findOne({
      college: college._id,
      $or: [{ role: "admin" }, { role: "superadmin" }],
    });
    if (user) {
      if (adminEmail) user.email = adminEmail;
      if (adminName) user.username = adminName;
      if (adminContact) user.contactNumber = adminContact;
      if (adminPassword) user.password = adminPassword;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all colleges
 * @route   GET /api/colleges
 * @access  Private (Superadmin only)
 */
export const getAllColleges = async (req, res, next) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.status(200).json(colleges);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete college
 * @route   DELETE /api/colleges/:id
 * @access  Private (Superadmin only)
 */
export const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Also delete associated users
    await User.deleteMany({ college: req.params.id });

    res.status(200).json({
      success: true,
      message: "College and associated users deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle college status (Active/Inactive)
 * @route   PATCH /api/colleges/:id/status
 * @access  Private (Superadmin only)
 */
export const toggleCollegeStatus = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    college.isActive = !college.isActive;
    await college.save();

    res.status(200).json({
      success: true,
      message: `College ${college.isActive ? "activated" : "deactivated"} successfully`,
      data: college,
    });
  } catch (error) {
    next(error);
  }
};
