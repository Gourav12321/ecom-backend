const express = require("express");
const router = express.Router();
const {
  sendmailAndsaveData,
  verifyEmail,
  setupPassword,
  signin,
  userAddress,
  getUserWithAddresses,
  OAuth,
  OAuthLogin,
  getAddress,
  editUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllAddresses,
  updateAddress,
  deleteAddress,
  getAddressByEmail,
} = require("../controller/UserAuth.controller");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/verifyMail", sendmailAndsaveData);
router.get("/verify-email", verifyEmail);
router.post("/setup-password", setupPassword);
router.post("/signin", signin);
router.post("/oAuth", OAuth);
router.post("/oAuthLogin", OAuthLogin);

router.post("/userAddress", userAddress);
router.get("/getUser", getUserWithAddresses);
router.post("/getaddress/:id", getAddress);
router.get("/getaddressbyemail/:email", getAddressByEmail);
router.get("/getAllAddresses", getAllAddresses);
router.put('/updateAddress', updateAddress);
router.delete('/deleteAddress/:addressId', deleteAddress);

router.put("/edit-user", editUser);
router.get("/users",adminMiddleware, getAllUsers);
router.put("/update-user", updateUser);
router.delete("/delete-user/:id",adminMiddleware, deleteUser);

router.get("/admin", adminMiddleware, (req, res) => {
  res.status(200).json({ message: "Welcome to the admin panel." });
});

module.exports = router;
