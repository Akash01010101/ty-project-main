const Portfolio = require('../models/Portfolio');

const getPortfolio = async (req, res) => {
  const user = req.user.userId;

  try {
    const portfolio = await Portfolio.find({ user });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const addPortfolioItem = async (req, res) => {
  const { title, description, imageUrl, projectUrl, skills } = req.body;
  const user = req.user.userId;

  try {
    const portfolioItem = new Portfolio({
      user,
      title,
      description,
      imageUrl,
      projectUrl,
      skills,
    });

    await portfolioItem.save();
    res.status(201).json(portfolioItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPortfolio,
  addPortfolioItem,
};
