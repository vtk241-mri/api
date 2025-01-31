const jwt = require("jsonwebtoken");
const users = require("../data/users");

const createResponse = (code, message, result = null, errors = null) => ({
  data: { code, message, result, errors },
});

exports.registerUser = (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = users.find((user) => user.email === email);

    if (userExists) {
      return res.status(400).json(
        createResponse(400, "User already exists", null, {
          message: "Email is taken",
        })
      );
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: role || "User",
    };

    users.push(newUser);
    res.status(201).json(
      createResponse(201, "User created successfully", {
        id: newUser.id,
        name,
        email,
        role,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Server error", null, { message: error.message })
      );
  }
};

exports.loginUser = (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      return res.status(400).json(
        createResponse(400, "Invalid email or password", null, {
          message: "Check credentials",
        })
      );
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "jwt_secret", {
      expiresIn: "1h",
    });

    res.json(createResponse(200, "Login successful", { token }));
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Server error", null, { message: error.message })
      );
  }
};

exports.getUsers = (req, res) => {
  try {
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(createResponse(200, "Users retrieved", sanitizedUsers));
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Server error", null, { message: error.message })
      );
  }
};

exports.getUserById = (req, res) => {
  try {
    const user = users.find((user) => user.id === parseInt(req.params.id));
    if (!user)
      return res.status(404).json(
        createResponse(404, "User not found", null, {
          message: "No such user",
        })
      );

    const { password, ...userWithoutPassword } = user;
    res.json(createResponse(200, "User retrieved", userWithoutPassword));
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Server error", null, { message: error.message })
      );
  }
};

exports.updateUser = (req, res) => {
  try {
    const user = users.find((user) => user.id === parseInt(req.params.id));
    if (!user)
      return res.status(404).json(
        createResponse(404, "User not found", null, {
          message: "No such user",
        })
      );

    Object.assign(user, req.body);
    res.json(createResponse(200, "User updated", user));
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Server error", null, { message: error.message })
      );
  }
};

exports.deleteUser = (req, res) => {
  try {
    const index = users.findIndex(
      (user) => user.id === parseInt(req.params.id)
    );
    if (index === -1)
      return res.status(404).json(
        createResponse(404, "User not found", null, {
          message: "No such user",
        })
      );

    users.splice(index, 1);
    res.json(createResponse(200, "User deleted"));
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Server error", null, { message: error.message })
      );
  }
};

exports.redirectToUsers = (req, res) => {
  res.status(300).json(
    createResponse(300, "Multiple choices", null, {
      message: "Redirecting to /users",
      location: "/users",
    })
  );
};
