class UnitOfWork {
  constructor(db) {
    this.db = db;
  }

  run(fn) {
    return this.db.transaction(fn)();
  }
}

module.exports = { UnitOfWork };
