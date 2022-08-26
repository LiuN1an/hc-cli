import React, { useEffect } from "react";
import { render } from "react-dom";
import { win } from "./context";
import "./style.css";

export const App = () => {
  useEffect(() => {
    win?.api.registerSystemEvent();
  }, []);

  return (
    <iframe
      src="http://task.10jqka.com.cn/indexguide.html"
      width="400"
      height="400"
    ></iframe>
    // <div className="w-full h-full flex justify-center items-center text-white font-bold bg-blue-300 text-2xl">
    //   Enku
    // </div>
  );
};

render(<App />, document.getElementById("root"));
