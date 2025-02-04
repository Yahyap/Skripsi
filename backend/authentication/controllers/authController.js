const connection = require("../mysql/connect");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  try {
    console.log("Register .....");

    let {
      firstname,
      lastname,
      user_email_address,
      user_password,
      user_password_repeat,
    } = req.body;

    let createdAt = new Date().toISOString();
    let updateAt = new Date().toISOString();

    if (!firstname) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input firstname",
      });
    }

    if (!user_email_address) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input Email",
      });
    }

    if (!validator.isEmail(user_email_address)) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input Valid Email",
      });
    }

    if (!user_password) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input Password",
      });
    }

    if (user_password.length <= 5) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input More than 6 Character",
      });
    }

    if (user_password_repeat !== user_password) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Correct Input Password",
      });
    }

    // Cek jika email sudah ada
    let db = `SELECT * FROM user_login WHERE user_email = ?`;
    connection.query(db, [user_email_address], function (err, data) {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({
          status: "Failed",
          requestAt: new Date().toISOString(),
          message: "Internal Server Error",
        });
      }

      if (data.length >= 1) {
        return res.status(409).json({
          status: "Failed",
          requestAt: new Date().toISOString(),
          message: "Email Already Exist",
        });
      }

      const salt = bcrypt.genSaltSync(8);
      user_password = bcrypt.hashSync(user_password, salt);

      let ins_db = `INSERT INTO user_login (firstname, lastname, user_email, user_password, createdAt, updateAt) 
      VALUES (?, ?, ?, ?, ?, ?)`;
      connection.query(
        ins_db,
        [
          firstname,
          lastname,
          user_email_address,
          user_password,
          createdAt,
          updateAt,
        ],
        function (err, data) {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({
              status: "Failed",
              requestAt: new Date().toISOString(),
              message: "Internal Server Error",
            });
          }

          return res.status(201).json({
            status: "Success",
            requestAt: new Date().toISOString(),
            message: "Selamat! Akun anda telah berhasil dibuat",
          });
        }
      );
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    console.log("Login .....");
    let { user_email_address, user_password } = req.body;

    if (!user_email_address) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input Email",
      });
    }

    if (!user_password) {
      return res.status(400).json({
        status: "Failed",
        requestAt: new Date().toISOString(),
        message: "Please Input Password",
      });
    }

    db = `
  SELECT * FROM user_login
  WHERE user_email = "${user_email_address}"
  `;

    connection.query(db, function (err, data) {
      console.log(data.length);
      if (data.length <= 0) {
        return res.status(400).json({
          status: "Failed",
          requestAt: new Date().toISOString(),
          message: "Wrong Email",
        });
      }

      const passwordIsValid = bcrypt.compareSync(
        user_password,
        data[0].user_password
      );
      if (!passwordIsValid) {
        return res.status(400).json({
          status: "Failed",
          requestAt: new Date().toISOString(),
          message: "Wrong Password",
        });
      }

      let user_id = data[0].user_id;
      let firstname = data[0].firstname;
      let lastname = data[0].lastname;
      const userData = { user_id, user_email_address, firstname, lastname };
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
      };

      res.cookie("token", userData, cookieOptions);
      return res.status(201).json({
        status: "Success",
        message: "logged in successfully",
        requestAt: new Date().toISOString(),
        userData,
      });
    });
  } catch (err) {
    return res.status(err.code).json({
      status: "Failed",
      message: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    console.log("Logout .....");
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({
      status: "Success",
      requestAt: new Date().toISOString(),
      message: "logged out successfully",
    });
  } catch (err) {
    return res.status(err.code).json({
      status: "Failed",
      message: err.message,
    });
  }
};

exports.protected = async (req, res) => {
  try {
    console.log("Home .....");
    let userData = req.cookies.token;
    console.log(userData);

    db = `SELECT * FROM user_login WHERE user_email = "${userData.user_email_address}"`;
    connection.query(db, function (err, data) {
      let user_id = data[0].user_id;
      let user_email_address = data[0].user_email;
      let firstname = data[0].firstname;
      let lastname = data[0].lastname;
      userData = { user_id, user_email_address, firstname, lastname };
      const cookieOptions = {
        httpOnly: true,
        secure: false,
      };
      res.cookie("token", userData, cookieOptions);
      return res.status(201).json({
        status: "Success",
        requestAt: new Date().toISOString(),
        message: "Ini home",
        user: userData,
      });
    });
  } catch (err) {
    return res.status(err.code).json({
      status: "Failed",
      message: err.message,
    });
  }
};

exports.home = async (req, res) => {
  try {
    console.log("Home .....");
    const userData = req.cookies.token;
    return res.status(201).json({
      status: "Success",
      requestAt: new Date().toISOString(),
      message: "Ini home",
      user: userData,
    });
  } catch (err) {
    return res.status(err.code).json({
      status: "Failed",
      message: err.message,
    });
  }
};
