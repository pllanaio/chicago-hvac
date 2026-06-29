const React = require("react");
const { createRoot } = require("react-dom/client");
const App = require("./App.jsx").default;

require("../style.css");

createRoot(document.getElementById("root")).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);
