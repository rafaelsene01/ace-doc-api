const Text = require("../models/Text");

module.exports = {
  async getText(req, res) {
    const data = {
      _id: req?.params?._id.trim(),
    };

    const text = await Text.findOne({ _id: data._id }, (err, obj) => {
      if (err) {
        return res.status(500).send({ error: err });
      }

      return res.status(200).send({ text: obj.text });
    });
  },

  async updateText(req, res) {
    const data = {
      _id: req?.params?._id.trim(),
      text: req?.body?.text || "",
    };

    Text.update({ _id: data._id }, data, { upsert: true }, (err) => {
      if (err) {
        return res.status(500).send({ error: err });
      }

      req.io.emit("text", data);
      return res.status(204).send();
    });
  },
};
