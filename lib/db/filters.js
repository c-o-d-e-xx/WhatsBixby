const mongoose = require("mongoose");

const FilterSchema = new mongoose.Schema({
  chat: { type: String, required: true },
  pattern: { type: String, required: true },
  text: { type: String, required: true },
  regex: { type: Boolean, default: false },
});

const Filter = mongoose.model("Filter", FilterSchema);

const getFilter = async (jid = null, filter = null) => {
  const query = { chat: jid };
  if (filter) query.pattern = filter;
  const filters = await Filter.find(query).lean();
  return filters.length > 0 ? filters : false;
};

const setFilter = async (jid, filter, tex, regx = false) => {
  const existingFilter = await Filter.findOne({ chat: jid, pattern: filter });

  if (!existingFilter) {
    return await Filter.create({ chat: jid, pattern: filter, text: tex, regex: regx });
  } else {
    return await Filter.updateOne({ chat: jid, pattern: filter }, { text: tex, regex: regx });
  }
};

const deleteFilter = async (jid, filter) => {
  const deleted = await Filter.findOneAndDelete({ chat: jid, pattern: filter });
  return deleted ? true : false;
};

module.exports = { Filter, getFilter, setFilter, deleteFilter };
