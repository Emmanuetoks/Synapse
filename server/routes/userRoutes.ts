import { Request, Response, Router } from "express";
import {
  authenticateUser,
  createUser,
  deleteUser,
  findUser,
  updateUser,
} from "../database/userDB";
import { defaultResponse } from "../store";
import { UserInterface } from "../models/userModel";

const userRoutes = Router();

// Setup of a RESTful api

userRoutes.get("/", async (req, res) => {
  // query: email, password
  // response: did password match with the user of provided email (will be used for login)

  const email = req.query.email as string;
  const password = req.query.password as string;

  // gets a default response object
  const response = defaultResponse();

  // tries to find user
  const user = await findUser({ email });

  // if user is found
  if (user !== undefined) {
    // authenticate user
    const userAuthenticated = await authenticateUser(user, password);
    if (userAuthenticated) {
      // give success response
      response.success = true;
      response.log = "user authenticated";
      response.data = { user };
    } else {
      response.log = "wrong password";
    }
  } else {
    response.log = "user not found";
  }

  // respond evaluated response
  res.json(response);
});

userRoutes.post("/", async (req, res) => {
  // body: userDetails
  // response (if userDetails.email is unique): newly created user from provided userDetails
  // response (if userDetails.email is used): error message saying user already exists

  const userDetails = req.body.userDetails as UserInterface;
  const email = userDetails.email as string;
  const userExists = (await findUser({ email })) !== undefined;

  const response = defaultResponse();

  if (userExists) {
    response.log = "user already exists";
  } else {
    const user = await createUser(userDetails);
    if (user === undefined) {
      response.log = "failed to create user";
    } else {
      response.success = true;
      response.log = "user created";
      response.data = { user };
    }
  }

  res.json(response);
});

userRoutes.get("/:_id/", async (req, res) => {
  // params: id
  // response: user details from provided id

  const _id = req.params._id as string;
  const user = await findUser({ _id });
  const response = defaultResponse();

  if (user === undefined) {
    response.log = "user not found";
  } else {
    response.success = true;
    response.log = "user found";
    response.data = { user };
  }

  res.json(response);
});

userRoutes.patch("/:_id/", async (req, res) => {
  // params: _id
  // body: updateKeys
  // response: updated user

  const _id = req.params._id as string;
  const updateKeys = req.body.updateKeys;

  const response = defaultResponse();
  const user = await updateUser(_id, updateKeys);

  if (user === undefined) {
    response.log = "user not found";
  } else {
    response.success = true;
    response.log = "user updated";
    response.data = { user };
  }

  res.json(response);
});

userRoutes.delete("/:_id/", async (req, res) => {
  // params: _id
  // response: deletes user

  const _id = req.params._id as string;
  const response = defaultResponse();
  const userDeleted = await deleteUser(_id);

  if (!userDeleted) {
    response.log = "failed to delete user";
  } else {
    response.success = true;
    response.log = "user deleted";
  }

  res.json(response);
});

export default userRoutes;
