import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
import Order from "../models/order.js";
dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "lasannavodya@gmail.com",
    pass: "syailtafgvvhgmtc",
  }
})

export function registerUser(req, res) {
	const data = req.body;

	data.password = bcrypt.hashSync(data.password, 10);
	//#
	const newUser = new User(data);

	newUser
		.save()
		.then(() => {
			res.json({ message: "User registered successfully" });
		})
		.catch((error) => {
			res.status(500).json({ error: "User registration failed" });
		});
}

export function loginUser(req, res) {
	const data = req.body;

	User.findOne({
		email: data.email,
	}).then((user) => {
		if (user == null) {
			res.status(404).json({ error: "User not found" });
		} else {
			if (user.isBlocked) {
				res
					.status(403)
					.json({ error: "Your account is blocked please contact the admin" });
				return;
			}

			const isPasswordCorrect = bcrypt.compareSync(
				data.password,
				user.password
			);

			if (isPasswordCorrect) {
				const token = jwt.sign(
					{
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						role: user.role,
						profilePicture: user.profilePicture,
						phone: user.phone,
            emailVerified: user.emailVerified
					},
					process.env.JWT_SECRET
				);

				res.json({ message: "Login successful", token: token, user: user });
			} else {
				res.status(401).json({ error: "Login failed" });
			}
		}
	});
}

export function isItAdmin(req) {
	let isAdmin = false;

	if (req.user != null) {
		if (req.user.role == "admin") {
			isAdmin = true;
		}
	}

	return isAdmin;
}

export function isItCustomer(req) {
	let isCustomer = false;

	if (req.user != null) {
		if (req.user.role == "customer") {
			isCustomer = true;
		}
	}

	return isCustomer;
}

export async function getAllUsers(req, res) {
	if (isItAdmin(req)) {
		try {
			const users = await User.find();
			res.json(users);
		} catch (e) {
			res.status(500).json({ error: "Failed to get users" });
		}
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}

export async function blockOrUnblockUser(req, res) {
	const email = req.params.email;
	if (isItAdmin(req)) {
		try {
			const user = await User.findOne({
				email: email,
			});

			if (user == null) {
				res.status(404).json({ error: "User not found" });
				return;
			}

			const isBlocked = !user.isBlocked;

			await User.updateOne(
				{
					email: email,
				},
				{
					isBlocked: isBlocked,
				}
			);

			res.json({ message: "User blocked/unblocked successfully" });
		} catch (e) {
			res.status(500).json({ error: "Failed to get user" });
		}
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}
export function getUser(req, res) {
	if (req.user != null) {
		res.json(req.user);
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}

export async function loginWithGoogle(req, res) {
	//https://www.googleapis.com/oauth2/v3/userinfo
	const accesToken = req.body.accessToken;
	console.log(accesToken);
	try {
		const response = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accesToken}`,
				},
			}
		);
		console.log(response.data);
		const user = await User.findOne({
			email: response.data.email,
		});
		if (user != null) {
			const token = jwt.sign(
				{
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					profilePicture: user.profilePicture,
					phone: user.phone,
          emailVerified: true
				},
				process.env.JWT_SECRET
			);

			res.json({ message: "Login successful", token: token, user: user });
		} else {
      const newUser = new User({
        email: response.data.email,
        password: "123",
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        address: "Not Given",
        phone: "Not given",
        profilePicture: response.data.picture,
        emailVerified: true,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign(
        {
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          role: savedUser.role,
          profilePicture: savedUser.profilePicture,
          phone: savedUser.phone,
        },
        process.env.JWT_SECRET
      );
      res.json({ message: "Login successful", token: token, user: savedUser });
		}
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: "Failed to login with google" });
	}
}


export async function sendOTP(req,res){
   
  if(req.user == null){
    res.status(403).json({error : "Unauthorized"})
    return;
  }
  //generate number between 1000 and 9999
  const otp = Math.floor(Math.random()*9000) + 1000;
  //save otp in database
  const newOTP = new OTP({
    email : req.user.email,
    otp : otp
  })
  await newOTP.save();
  
  const message = {
    from : "lasannavodya@gmail.com",
    to : req.user.email,
    subject : "Validating OTP",
    text : "Your otp code is "+otp
  }

  transport.sendMail(message, (err, info) => {
    if(err){
      console.log(err); 
      res.status(500).json({error : "Failed to send OTP"})    
    }else{
      console.log(info)
      res.json({message : "OTP sent successfully"})
    }
  });

}


export async function verifyOTP(req,res){
  if(req.user == null){
    res.status(403).json({error : "Unauthorized"})
    return;
  }
  const code = req.body.code;

  const otp = await OTP.findOne({
    email : req.user.email,
    otp : code
  })

  if(otp == null){
    res.status(404).json({error : "Invalid OTP"})
    return;
  }else{
    await OTP.deleteOne({
      email : req.user.email,
      otp : code
    })

    await User.updateOne({
      email : req.user.email
    },{
      emailVerified : true
    })

    res.status(200).json({message : "Email verified successfully"})
  }
  
}

// Get user profile with bookings
export async function getUserProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get user details
    const user = await User.findOne({ email: req.user.email })
      .select('-password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's orders/bookings
    const orders = await Order.find({ email: req.user.email })
      .sort({ orderDate: -1 }); // Most recent first

    res.json({
      profile: user,
      bookings: orders
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
}

// Update user profile
export async function updateUserProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const allowedUpdates = [
      'firstName',
      'lastName',
      'address',
      'phone',
      'profilePicture'
    ];

    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update JWT with new user information
    const token = jwt.sign(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phone: user.phone,
        emailVerified: user.emailVerified
      },
      process.env.JWT_SECRET
    );

    res.json({
      message: "Profile updated successfully",
      user,
      token
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// Get user's booking history
export async function getUserBookings(req, res) {
  try {
    if (!req.user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { status, startDate, endDate } = req.query;
    let query = { email: req.user.email };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) {
        query.orderDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.orderDate.$lte = new Date(endDate);
      }
    }

    const bookings = await Order.find(query)
      .sort({ orderDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    res.status(500).json({ error: "Failed to get bookings" });
  }
}
