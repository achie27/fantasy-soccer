import express from "express";

export const createNewPlayer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const fetchPlayers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const fetchPlayerById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const updatePlayerById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};

export const deletePlayerById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
};
