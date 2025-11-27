const connection = require('../config/database');

class Expense {
  static async getAll() {
    return await connection('expenses').select('*').orderBy('date', 'desc');
  }

  static async getById(id) {
    const [expense] = await connection('expenses').where({ id }).select('*');
    return expense;
  }

  static async create(expense) {
    const [id] = await connection('expenses').insert(expense);
    return { id, ...expense };
  }

  static async update(id, expense) {
    await connection('expenses').where({ id }).update(expense);
    return { id, ...expense };
  }

  static async delete(id) {
    return await connection('expenses').where({ id }).del();
  }

  static async getTotalByCategory() {
    return await connection('expenses')
      .select('category')
      .sum('amount as total')
      .groupBy('category');
  }
}

module.exports = Expense;
