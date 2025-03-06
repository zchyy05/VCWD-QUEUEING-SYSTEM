import React from "react";
import { motion } from "framer-motion";
const CustomLoading = () => {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      ></motion.div>
    </div>
  );
};

export default CustomLoading;
