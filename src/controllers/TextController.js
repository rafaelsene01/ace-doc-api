const Text = require("../models/Text");

module.exports = {
  async getText(req, res) {
    const data = {
      _id: req?.params?._id.trim(),
    };

    if (!/^[a-zA-Z0-9]+$/.test(data._id)) {
      return res.status(400).send({
        message: "Formato do ID inválido, aceitamos somente letras e números.",
      });
    }

    try {
      const obj = await Text.findOne({ _id: data._id });
      if (!obj) {
        await Text.create({ _id: data._id, text: "" });
      }
      return res.status(200).send({ text: obj?.text || "" });
    } catch (err) {
      res.status(500).send({ message: err });
    }
  },

  async updateText(req, res) {
    const data = {
      _id: req?.params?._id.trim(),
      text: req?.body?.text || "",
    };

    try {
      await Text.update({ _id: data._id }, data, { upsert: true });

      return res.status(204).send();
    } catch (err) {
      return res.status(500).send({ message: err });
    }
  },
};
