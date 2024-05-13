const Category = require("../models/Categories");
const User = require("../models/User");

exports.createCategory = async (req, res) => {
  try {
    const { name: categoryName } = req.body;
    const userId = req.user.id; // Assuming req.user contains the user ID

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Check if category exists in user's categories
    const categoryExists = user.categories.includes(categoryName);
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Create new category
    const category = await Category.create(req.body);

    // Update user document to add the new category
    const updatedUser = await User.findByIdAndUpdate(userId, { $push: { categories: category._id } })
    .populate("categories").exec()
    ;

    res.status(201).json({
      success : true,
      category : category,
      updatedUser : updatedUser ,
      message : "Category created and added to user successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating category: " + error.message,
    });
  }
};
