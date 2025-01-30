import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <>
      <div>
        <div>
          <h1 className="text-center"> QUEUING SYSTEM</h1>
        </div>
        <div className="flex justify-around items-center">
          <Link to="/auth/signup"> Sign In </Link>
          <Link to="/auth/signin"> Sign In </Link>
        </div>
      </div>
    </>
  );
};

export default Landing;
