// import React from "react";
// import logo from "./logo.svg";
import "./MintToken";
import "./MintNFT";
import "./WrappedSol";
import "./App.css";
import MintToken from "./MintToken";
import MintNFT from "./MintNFT";
import WrappedSol from "./WrappedSol";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MintToken />
        <br />
        <br />
        <br />
        <br />
        <MintNFT />
        <br />
        <br />
        <br />
        <br />
        <WrappedSol />
        <br />
        <br />
        <br />
        <br />
      </header>
    </div>
  );
}

export default App;
