const Transaction = require('../models/Transaction');

exports.getAll = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.userId },
      order: [['date', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    const t = await Transaction.create({
      type, amount, category, note, date, userId: req.userId
    });
    res.status(201).json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const t = await Transaction.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!t) return res.status(404).json({ message: 'Not found' });
    await t.destroy();
    res.json({ message: 'Deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};