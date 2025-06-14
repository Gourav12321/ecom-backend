const { User, Address } = require("../model/User.model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sendmailAndsaveData = async (req, res) => {
  const { fullName, email, password } = req.body;

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = new User({
      fullName,
      email,
      password : hashedPassword ,
      verificationToken,
    });

    await newUser.save();

    const mailOptions = {
      from: `"Gourav Ecommerce" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification - Gourav Ecommerce ✔",
      text: `Hello ${fullName},\n\nPlease verify your email by clicking the link: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hello ${fullName},</h2>
          <p>Thank you for registering at Gourav Ecommerce. Please verify your email by clicking the link below:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If the button above does not work, please copy and paste the following link into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>Thank you,<br>The Gourav Ecommerce Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json(newUser);
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const OAuth = async (req, res) => {
  try {
    const { fullName, email, profile } = req.body;

    if (!fullName || !email || !profile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const newUser = new User({
      fullName,
      email,
      profile,
      verificationToken: null,
      verification: true,
    });

    await newUser.save();
    res
      .status(200)
      .json({
        success: true,
        message: "OAuth registration successful",
        user: newUser,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const OAuthLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });
    if (user === null) {
      return res
        .status(400)
        .json({ message: "User Not Found Please Signup First", user: null });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role : user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Send token in the cookie
  res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });

    res
      .status(200)
      .json({ success: true, message: "OAuth Login successful", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification token" });
    }

    user.verification = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ success: true, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to verify email" });
  }
};

const setupPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.verification) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user or user not verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password setup successful" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to setup password" });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.verification) {
      return res
        .status(403)
        .json({ success: false, message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

  // Create the JWT token
  const token = jwt.sign({ id: user._id, email: user.email, role : user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Send token in the cookie
  res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour expiration

    res.status(200).json({ success: true, user});

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to sign in" });
  }
};

const userAddress = async (req, res) => {
  try {
    const { email, address } = req.body;

    const existingAddress = await Address.findOne({ email });

    if (existingAddress) {
      existingAddress.addresses.push(address);
      await existingAddress.save();
    } else {
      const newAddress = new Address({ email, addresses: [address] });
      await newAddress.save();
    }

    res.status(200).json({ message: "Address saved successfully" });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ message: "Failed to save address" });
  }
};



const getUserWithAddresses = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.userEmail }).populate(
      "addresses"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to retrieve user with addresses",
      });
  }
};

const getAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const address = await Address.findById(id);

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, address });
  } catch (error) {
    console.error("Error in getAddress:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve address" });
  }
};

const getAddressByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const addressDocs = await Address.find({ email }).populate('addresses');

    if (addressDocs.length === 0) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const addresses = addressDocs.map(doc => doc.addresses).flat();


    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Error in getAddress:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve address" });
  }
};


const editUser = async (req, res) => {
  const { fullName, currentPassword, newPassword, profile } = req.body;
  const email = req.body.email;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Both current and new passwords are required." });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid current password." });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (fullName) user.fullName = fullName;
    if (profile) user.profile = profile;
    const role = user.role;
    const updatedUser = await user.save();
    res.status(200).json({
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profile: updatedUser.profile,
      role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { email, fullName, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { fullName, role }, 
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};
const getAllAddresses = async (req, res) => {
  try {
    const { email } = req.query;

    const address = await Address.findOne({ email });

    if (!address) {
      return res.status(404).json({ success: false, message: "Addresses not found" });
    }

    res.status(200).json({ success: true, addresses: address.addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve addresses" });
  }
};


const updateAddress = async (req, res) => {
  try {
    const { email, address } = req.body;

    if (!email || !address || !address._id) {
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { email: email, "addresses._id": address._id },
      { $set: { "addresses.$": address } },
      { new: true }
    );

    if (updatedAddress) {
      res.status(200).json({ success: true, address: updatedAddress });
    } else {
      res.status(404).json({ success: false, message: 'Address not found' });
    }
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const deleteAddress = async (req, res) => {
  try {
    const { email } = req.query; 
    const { addressId } = req.params;
    const result = await Address.updateOne(
      { email: email, 'addresses._id': addressId }, 
      { $pull: { addresses: { _id: addressId } } } 
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Address not found' });
    }
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = {
  deleteUser,
  updateUser,
  getAllUsers,
  editUser,
  OAuthLogin,
  sendmailAndsaveData,
  verifyEmail,
  setupPassword,
  signin,
  userAddress,
  getUserWithAddresses,
  OAuth,
  getAddress,
  getAllAddresses,
  deleteAddress,
  updateAddress,
  getAddressByEmail
};
