import * as authService from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const signUp = async (req, res) => {
  const newUser = await authService.signup(req.body);

  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
    avatar: newUser.avatarURL,
    verify: newUser.verify,
  });
};

const signIn = async (req, res) => {
  const loggedInUser = await authService.signin(req.body);
  const { user, refreshToken, accessToken } = loggedInUser;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    path: "/",
  });
  res.json({ user, accessToken });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await authService.findUser({ verificationCode });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await authService.updateUser(
    { _id: user._id },
    { verify: true, verificationCode: "" }
  );

  res
    .status(200)
    .json({ message: "Verification successful. You can Login now" });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await authService.findUser({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  await authService.emailSender(email, user.verificationCode);

  res.json({ message: "Verification email sent" });
};

const updatePassword = async (req, res) => {
  const { _id, password } = req.user;
  const { oldPassword, newPassword } = req.body;

  await authService.passwordUpdate(
    { _id, password },
    { oldPassword, newPassword }
  );

  res.status(200).json({ message: "User password update success" });
};

const updateAvatar = async (req, res) => {
  const { _id, avatarURL } = req.user;
  const { path: oldPath, filename } = req.file;

  if (!req.user) {
    throw HttpError(401, "Not authorized");
  }

  if (!req.file) {
    throw HttpError(400, "There is no data to update");
  }

  const data = { _id, avatarURL, oldPath, filename };

  const newAvatar = await authService.avatarUpdate(data);
 
  res.status(200).json(newAvatar);
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    throw HttpError(401, "Not authorized");
  }
  const refreshedTokens = await authService.tokenRefresh(refreshToken);

  res.cookie("refreshToken", refreshedTokens.refreshToken, {
    httpOnly: true,
    secure: false,
    path: "/",
  });

  res.status(200).json({
    accessToken: refreshedTokens.accessToken,
  });
};

const getCurrent = (req, res) => {
  const { name, email, avatarURL, verify } = req.user;
  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  res.json({ name, email, avatarURL, verify });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await authService.updateUser({ _id }, { refreshToken: "" });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    path: "/",
  });

  // res.cookie('refreshToken',"", {
  //   httpOnly: true,
  //   secure: false,
  //    path:"/"
  // });
  res.status(204).json("No Content");
};

export default {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  updateAvatar: ctrlWrapper(updateAvatar),
  updatePassword: ctrlWrapper(updatePassword),
  refreshToken: ctrlWrapper(refreshToken),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};

// const update = async (req, res) => {
//   const { _id, password, avatarURL } = req.user;
//   const { oldPassword, newPassword } = req.body;
//   const data = {};

//   const comparePassword = await authService.validatePassword(
//     oldPassword,
//     password
//   );

//   if (!comparePassword) {
//     throw HttpError(400, "Invalid password");
//   }
//   if (newPassword) {
//     const hashPassword = await bcrypt.hash(newPassword, 10);
//     data.password = hashPassword;
//   }

//   if (req.file) {
//     const { path: oldPath, filename } = req.file;

//     const image = await Jimp.read(oldPath);
//     image.resize(250, 250).write(oldPath);

//     const newPath = path.join(avatarsPath, filename);

//     await fs.rename(oldPath, newPath);
//     const newAvatar = path.join("avatars", filename);

//     data.avatarURL = newAvatar;

//     const isGravatar = avatarURL.split('/').includes("gravatar.com")
//     if(!isGravatar){
//     const toDelAvatar = path.join(toDelPath, avatarURL);

//     await fs.rm(toDelAvatar);}
//   }
//   if (!data.password && !data.avatarURL) {
//     throw HttpError(401, "There is no data to update");
//   }
//   await authService.updateUser({ _id }, data);

//   res.status(200).json(data.avatarURL);
// };
