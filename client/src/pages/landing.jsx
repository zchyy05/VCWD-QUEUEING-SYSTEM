import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <>
      <div>
        <div className="bg-primary">
          <h1 className="text-center font-rubik font-bold">QUEUING SYSTEM</h1>
        </div>
        <div>
          <h1 className="font-rubik font-bold text-xl">asd</h1>
          <h1 className="font-bold">asd</h1>
        </div>
        <div className="flex justify-around items-center">
          <Link to="/auth/signup font-rubik"> Sign In </Link>
          <Link to="/auth/signin"> Sign In </Link>
        </div>
      </div>
    </>
  );
};

export default Landing;
