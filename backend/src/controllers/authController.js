import Developer from "../models/Developer.js";
import Company from "../models/Company.js";

// Developer Controllers
export const developerSignup = async (req, res) => {
  try {
    const developer = await Developer.create(req.body);
    res.status(201).json({ message: "Developer data pushed", developer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const developerLogin = async (req, res) => {
  try {
    const developer = await Developer.create(req.body); // Just pushing data as requested
    res.status(200).json({ message: "Developer data pushed", developer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Company Controllers
export const companySignup = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ message: "Company data pushed", company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const companyLogin = async (req, res) => {
  try {
    const company = await Company.create(req.body); // Just pushing data as requested
    res.status(200).json({ message: "Company data pushed", company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
