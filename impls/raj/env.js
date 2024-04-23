class Env {
  #outer;
  #data;

  constructor(outer) {
    this.#outer = outer;
    this.#data = {};
  }

  find(key) {
    const value = this.#data[key];
    if (value) return this;
    if (this.#outer) return this.#outer.find(key);
  }

  set(key, value) {
    this.#data[key] = value;
    return value;
  }

  get(key) {
    const env = this.find(key);
    if (env === undefined) throw new Error(key + " not found");

    return env.#data[key];
  }
}

module.exports = Env;
