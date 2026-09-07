const User = require('../models/User');
const { wrapDB } = require('../middleware/dbErrorHandler');

exports.updateProfile = wrapDB(async (req, res) => {
  const { username, bio, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(username && { username }),
      ...(bio !== undefined && { bio }),
      ...(avatar && { avatar })
    },
    { new: true, runValidators: true }
  );
  res.json(user);
});

exports.changePassword = wrapDB(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});
