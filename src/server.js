import app from "./index";

const port = normalizaPort(process.env.PORT || "3333");

function normalizaPort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}/`);
});
