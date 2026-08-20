const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(username && { username }), ...(bio !== undefined && { bio }), ...(avatar && { avatar }) },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
