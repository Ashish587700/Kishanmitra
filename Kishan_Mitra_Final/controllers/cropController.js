const Crop = require('../models/Crop');

exports.createCrop = async (req, res) => {
  // if (req.user.userType !== 'farmer') return res.status(403).json({ message: 'Access denied' });
  const { name, quantity, price, condition, available, description, image } = req.body;
  try {
   const userId =  JSON.stringify(req?.user._id).replaceAll('"','');
   console.log("userId ----",userId);
    const crop = await Crop.create({
       name, quantity, price, condition, available, description, farmerId:userId, image
      });
    res.json(crop);
  } catch {
    res.status(400).json({ message: 'Failed to add crop ....!!!!!' });
  }
};

exports.getAllCrops = async (req, res) => {
  console.log("Crop get API called...")
  const crops = await Crop.find().lean();
  // const crops = await Crop.find({"farmerId":JSON.stringify(req.user._id)}).lean();

  res.json(crops);
};
