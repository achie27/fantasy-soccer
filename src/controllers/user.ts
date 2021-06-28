import express from "express";

export const createNewUser = async (req: express.Request, res: express.Response) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const fetchUsers = async (req: express.Request, res: express.Response) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const fetchUserById = async (req: express.Request, res: express.Response) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const updateUserById = async (req: express.Request, res: express.Response) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const deleteUserById = async (req: express.Request, res: express.Response) => {
  try {

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};