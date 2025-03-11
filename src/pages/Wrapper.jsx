import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { SessionContext } from "../contexts";


const Wrapper = ({ children, prevent }) => {
  const {loading, session} = useContext(SessionContext);

  if (loading) return (
    <>
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
      {children}
    </>
  );

  if (prevent === "user") {
    return session ? <Navigate to="/" /> : <>{children}</>;
  } else if (prevent === "guest") {
    return session ? <>{children}</> : <Navigate to="/login" />;
  }
};

export default Wrapper;
