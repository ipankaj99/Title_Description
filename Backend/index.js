import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel, server } from "./user.js";
import postModel from "./post.js";
import verifyToken from "./Protected_Routes/verifyToken.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import nodemailer from "nodemailer";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Connect DB
server();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const emailVerify = {};

// ------------------------- Routes -------------------------

app.post("/signup", upload.single("profilePic"), async (req, res) => {
  const { username, email, password, otp } = req.body;
  const imagePath = req.file
    ? `/uploads/${req.file.filename}`
    : "/uploads/default.jpeg";

  const userExists = await userModel.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  if (!emailVerify[email])
    return res.status(404).json({ message: "No OTP found for this email" });

  if (emailVerify[email].expireAt < Date.now())
    return res.status(400).json({ message: "OTP is Expired" });

  if (emailVerify[email].otp !== parseInt(otp))
    return res.status(400).json({ message: "Wrong OTP" });

  const hashPassword = await bcrypt.hash(password, 13);
  const createUser = await userModel.create({
    username,
    email,
    password: hashPassword,
    profilePic: imagePath,
  });

  const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  res.status(200).json({ message: "User created successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const findUser = await userModel.findOne({ email });
  if (!findUser) return res.status(400).json({ message: "User not exists" });

  const valid = await bcrypt.compare(password, findUser.password);
  if (!valid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  res.status(200).json({ message: "Login successful" });
});

app.post("/post", verifyToken, async (req, res) => {
  const { title, description } = req.body;
  const user = await userModel.findOne({ email: req.user });
  if (!user) return res.status(401).json({ message: "User not found" });

  const newPost = await postModel.create({
    title,
    description,
    user: user._id,
  });

  user.posts.push(newPost._id);
  await user.save();

  res.status(201).json({ post: newPost });
});

app.get("/get-post", verifyToken, async (req, res) => {
  const user = await userModel.findOne({ email: req.user }).populate("posts");
  if (!user) return res.status(404).json({ message: "User not found" });

  const profilePic = user.profilePic || "/uploads/default.jpeg";
  res.status(200).json({ posts: user.posts, profilePic });
});

app.get("/protected", verifyToken, async (req, res) => {
  const user = await userModel.findOne({ email: req.user }).populate("posts");
  if (!user) return res.status(404).json({ message: "User does not exist" });

  res.status(200).json({ message: "User is already logged in" });
});

app.get("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error during logout" });
  }
});

app.post("/verify-email", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  emailVerify[email] = {
    otp,
    expireAt: Date.now() + 60 * 1000,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rohillapankaj402@gmail.com",
      pass: "pwbg sfsd wbwj wyng",
    },
  });

  const mailOptions = {
    from: '"Pankaj Rohilla" <rohillapankaj402@gmail.com>',
    to: email,
    subject: "Your Verification Code",
    html: `<p>Your OTP is <b>${otp}</b>. It will expire in 1 minute.</p>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Error sending OTP:", err);
      return res
        .status(500)
        .json({ message: "Failed to send OTP", error: err.message });
    }

    return res.status(200).json({ message: "OTP sent successfully" });
  });
});

app.delete("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;

    const deletedPost = await postModel.findByIdAndDelete(id);
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });

    const user = await userModel.findOne({ email });
    if (user) {
      user.posts = user.posts.filter((item) => item.toString() !== id);
      await user.save();
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/editPost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedPost = await postModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    if (updatedPost) {
      return res
        .status(200)
        .json({ message: "Successfully updated", updatedPost });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/forgot/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const findUser = await userModel.findOne({ email });
    if (!findUser)
      return res.status(400).json({ message: "Wrong email ID" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    emailVerify[email] = {
      otp,
      expireAt: Date.now() + 60 * 1000,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rohillapankaj402@gmail.com",
        pass: "pwbg sfsd wbwj wyng",
      },
    });

    const mailOptions = {
      from: "rohillapankaj402@gmail.com",
      to: email,
      subject: "OTP to reset your password",
      text: `OTP for resetting your password is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending mail:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
      return res.status(200).json({ message: "OTP sent successfully", otp });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/ChangePassword", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Unauthorized user" });

    if (!emailVerify[email])
      return res.status(404).json({ message: "No OTP found for this email" });

    if (emailVerify[email].expireAt < Date.now())
      return res.status(400).json({ message: "OTP is Expired" });

    if (emailVerify[email].otp !== parseInt(otp))
      return res.status(400).json({ message: "Wrong OTP" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({ message: "Verified" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

app.post("/UpdatePassword", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.cookies.token;
    if (!token)
      return res.status(400).json({ message: "Try after some time" });

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decode.email;

    if (!password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Password and Confirm Password do not match" });

    const hashedPassword = await bcrypt.hash(confirmPassword, 13);
    const result = await userModel.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0)
      return res.status(400).json({ message: "User not found" });

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
