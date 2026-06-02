const userModel = require("../models/user.model")
const jwt = require('jsonwebtoken')
const { uploadImage } = require("../services/imagekit.service")
const { sendEmail } = require("../services/email.service")
const { redis } = require("../db/redis")
const bcrypt = require('bcryptjs')
const crypto = require('crypto')


async function registerController(req, res) {
  try {
    const { name, email, password, phone, role } = req.body
    if (role && role === "admin") {
      return res.status(403).json({ message: "You are not allowed to register as admin" })
    }
    const isUserExist = await userModel.findOne({ email })
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (isUserExist) {
      return res.status(400).json({ message: "User already exist,try to Login" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    })
    const token = await jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({
      message: "Registered the user Successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Error in registering the user", error: error.message })
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      })
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials"
      })
    }
    const token = await jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.status(200).json({
      message: "LoggedIn Sucessfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Error in logging in the user", error: error.message })
  }
}

async function updateProfileController(req, res) {
  try {
    const { name, phone } = req.body
    const user = await userModel.findOne({ _id: req.user.id })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (req.file) {
      const profileImage = await uploadImage({ buffer: req.file.buffer });
      user.profileImage = profileImage;
    }
    user.name = name || user.name
    user.phone = phone || user.phone

    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified
      }

    })
  } catch (error) {
    res.status(500).json({ message: "Error in updating the profile", error: error.message })
  }
}

async function sendOTPController(req, res) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.setex(req.user.email, 300, otp)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial, Helvetica, sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="
          background:#ffffff;
          border-radius:32px;
          overflow:hidden;
          box-shadow:0 20px 60px rgba(15,23,42,0.12);
        ">

          <!-- Top Gradient -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#f97316,#fb923c,#fdba74);
              padding:50px 40px;
              text-align:center;
            ">

              <div style="
                width:90px;
                height:90px;
                background:rgba(255,255,255,0.18);
                border:2px solid rgba(255,255,255,0.3);
                border-radius:28px;
                margin:auto;
                line-height:90px;
                font-size:42px;
              ">
                🍱
              </div>

              <h1 style="
                margin:24px 0 10px;
                color:white;
                font-size:36px;
                font-weight:700;
                letter-spacing:-1px;
              ">
                ResQMeal
              </h1>

              <p style="
                margin:0;
                color:rgba(255,255,255,0.92);
                font-size:16px;
                line-height:1.7;
              ">
                Rescue surplus food in real-time.
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:50px 40px;">

              <h2 style="
                margin:0;
                color:#0f172a;
                font-size:28px;
                text-align:center;
              ">
                Verify Your Email
              </h2>

              <p style="
                margin:18px 0 0;
                color:#64748b;
                font-size:16px;
                line-height:1.8;
                text-align:center;
              ">
                Use the verification code below to continue your journey with ResQMeal.
              </p>

              <!-- OTP Box -->
              <div style="
                margin:40px auto;
                background:linear-gradient(135deg,#fff7ed,#ffedd5);
                border:2px dashed #fb923c;
                border-radius:28px;
                padding:28px;
                text-align:center;
              ">

                <p style="
                  margin:0 0 14px;
                  color:#9a3412;
                  font-size:14px;
                  font-weight:600;
                  letter-spacing:1px;
                  text-transform:uppercase;
                ">
                  Your OTP Code
                </p>

                <div style="
                  color:#ea580c;
                  font-size:52px;
                  font-weight:800;
                  letter-spacing:12px;
                  line-height:1;
                ">
                  ${otp}
                </div>

              </div>

              <!-- Expiry -->
              <div style="
                background:#f8fafc;
                border-radius:20px;
                padding:18px;
                text-align:center;
              ">
                <p style="
                  margin:0;
                  color:#334155;
                  font-size:15px;
                  line-height:1.7;
                ">
                  ⏳ This OTP is valid for only 
                  <span style="
                    color:#dc2626;
                    font-weight:700;
                  ">
                    5 minutes
                  </span>.
                </p>
              </div>

              <!-- Security -->
              <p style="
                margin-top:35px;
                color:#94a3b8;
                font-size:14px;
                line-height:1.8;
                text-align:center;
              ">
                If you did not request this email, you can safely ignore it.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:30px;
              text-align:center;
              border-top:1px solid #e2e8f0;
              background:#fafafa;
            ">

              <p style="
                margin:0;
                color:#94a3b8;
                font-size:13px;
              ">
                © ${new Date().getFullYear()} ResQMeal • Turning leftovers into hope
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

    await sendEmail(
      req.user.email,
      "OTP for email verification",
      `Your OTP for email verification is ${otp}. This OTP is valid for only 5 minutes.`,
      html
    );
    return res.status(200).json({
      message: "OTP sent to the registered email address"
    });
  }
  catch (error) {
    res.status(500).json({ message: "Error in sending OTP", error: error.message })
  }
}

async function verifyOTPController(req, res) {
  try {
    const { otp } = req.body;
    const storedOTP = await redis.get(req.user.email)
    if (storedOTP === otp) {
      await userModel.findByIdAndUpdate(req.user.id, { isVerified: true })
      await redis.del(req.user.email)
      return res.status(200).json({
        message: "Email verified successfully"
      })
    } else {
      return res.status(400).json({
        message: "Invalid OTP"
      })
    }
  } catch (error) {
    res.status(500).json({ message: "Error in verifying OTP", error: error.message })
  }
}

async function logoutController(req, res) {
  try {
    await redis.set(`blacklist-${req.cookies.token}`, 'true', 'EX', 7 * 24 * 60 * 60)
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    })
    return res.status(200).json({
      message: "Logged out successfully"
    })
  } catch (error) {
    res.status(500).json({ message: "Error in logging out the user", error: error.message })
  }
}

async function getUserController(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user
    })
  } catch (error) {
    res.status(500).json({ message: "Error in fetching the user", error: error.message })
  }
}

async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    await redis.setex(`reset:${hashedResetToken}`, 900, user._id.toString())
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial, Helvetica, sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="
          background:#ffffff;
          border-radius:32px;
          overflow:hidden;
          box-shadow:0 20px 60px rgba(15,23,42,0.12);
        ">

          <!-- Header -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#f97316,#fb923c,#fdba74);
              padding:50px 40px;
              text-align:center;
            ">

              <div style="
                width:90px;
                height:90px;
                background:rgba(255,255,255,0.18);
                border:2px solid rgba(255,255,255,0.3);
                border-radius:28px;
                margin:auto;
                line-height:90px;
                font-size:42px;
              ">
                🔐
              </div>

              <h1 style="
                margin:24px 0 10px;
                color:white;
                font-size:36px;
                font-weight:700;
              ">
                ResQMeal
              </h1>

              <p style="
                margin:0;
                color:rgba(255,255,255,0.92);
                font-size:16px;
              ">
                Secure Password Recovery
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:50px 40px;">

              <h2 style="
                margin:0;
                color:#0f172a;
                font-size:28px;
                text-align:center;
              ">
                Reset Your Password
              </h2>

              <p style="
                margin:20px 0;
                color:#64748b;
                font-size:16px;
                line-height:1.8;
                text-align:center;
              ">
                We received a request to reset the password associated
                with your ResQMeal account.
              </p>

              <div style="
                background:linear-gradient(135deg,#fff7ed,#ffedd5);
                border:2px dashed #fb923c;
                border-radius:28px;
                padding:35px;
                text-align:center;
                margin:35px 0;
              ">

                <p style="
                  margin:0 0 24px;
                  color:#9a3412;
                  font-size:15px;
                ">
                  Click the button below to create a new password.
                </p>

                <a
                  href="${resetLink}"
                  target="_blank"
                  style="
                    display:inline-block;
                    background:#ea580c;
                    color:#ffffff;
                    text-decoration:none;
                    padding:16px 36px;
                    border-radius:14px;
                    font-size:16px;
                    font-weight:700;
                  "
                >
                  Reset Password
                </a>

              </div>

              <p style="font-size:13px;color:#94a3b8;word-break:break-all;">
         If the button doesn't work, copy and paste this link into your browser:
         <br />
       ${resetLink}
       </p>

              <div style="
                background:#f8fafc;
                border-radius:20px;
                padding:18px;
                text-align:center;
              ">
                <p style="
                  margin:0;
                  color:#334155;
                  font-size:15px;
                  line-height:1.7;
                ">
                  ⏳ This reset link will expire in
                  <span style="
                    color:#dc2626;
                    font-weight:700;
                  ">
                    15 minutes
                  </span>.
                </p>
              </div>

              <p style="
                margin-top:30px;
                color:#94a3b8;
                font-size:14px;
                line-height:1.8;
                text-align:center;
              ">
                If you didn't request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:30px;
              text-align:center;
              border-top:1px solid #e2e8f0;
              background:#fafafa;
            ">
              <p style="
                margin:0;
                color:#94a3b8;
                font-size:13px;
              ">
                © ${new Date().getFullYear()} ResQMeal • Turning leftovers into hope
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      "You have requested a password reset. Click the link below to reset your password.",
      html
    )

    return res.status(200).json({
      message: "Password reset link sent to the registered email address"
    })
  } catch (error) {
    res.status(500).json({ message: "Error in sending password reset link", error: error.message })
  }
}

async function resetPasswordController(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" })
    }
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const userId = await redis.get(`reset:${hashedResetToken}`)
    if (!userId) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await userModel.findByIdAndUpdate(userId, { password: hashedPassword })
    await redis.del(`reset:${hashedResetToken}`)
    return res.status(200).json({
      message: "Password reset successfully"
    })
  } catch (error) {
    res.status(500).json({ message: "Error in resetting password", error: error.message })
  }
}

module.exports = {
  registerController, loginController, logoutController, getUserController, updateProfileController, sendOTPController, verifyOTPController, forgotPasswordController, resetPasswordController
}