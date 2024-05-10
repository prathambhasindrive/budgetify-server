const Category = require('../models/Categories');

exports.createCategory = async (req, res) => {
    try {
        
        const category = await Category.create(req.body);
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while creating category "+error.message
        });
    }
};