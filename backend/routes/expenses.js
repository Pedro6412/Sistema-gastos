const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Obtém todas as despesas
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.getAll();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtém despesa por ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.getById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cria nova despesa
router.post('/', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }
    const newExpense = await Expense.create({
      description,
      amount: parseFloat(amount),
      category,
      date,
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualiza despesa
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const updatedExpense = await Expense.update(req.params.id, {
      description,
      amount: parseFloat(amount),
      category,
      date,
    });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exclui despesa
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtém resumo de despesas por categoria
router.get('/summary/categories', async (req, res) => {
  try {
    const summary = await Expense.getTotalByCategory();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
