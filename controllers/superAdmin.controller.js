import College from "../models/College.model.js";
import User from "../models/User.model.js";

/**
 * @desc    Get all colleges with their admin count and info
 * @route   GET /api/super-admin/colleges
 * @access  Private/SuperAdmin
 */
export const getAllColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({}).sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update college status or details
 * @route   PUT /api/super-admin/colleges/:id
 * @access  Private/SuperAdmin
 */
export const updateCollege = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!college) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
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
 * @desc    Delete/Terminate a college
 * @route   DELETE /api/super-admin/colleges/:id
 * @access  Private/SuperAdmin
 */
export const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    }







    await college.deleteOne();


    await User.deleteMany({ college: req.params.id });

    res.status(200).json({
      success: true,
      message: "College and all associated data removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all admins (principal/hod) for a specific college
 * @route   GET /api/super-admin/colleges/:id/admins
 * @access  Private/SuperAdmin
 */
export const getCollegeAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({
      college: req.params.id,
      role: "admin",
    });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};
