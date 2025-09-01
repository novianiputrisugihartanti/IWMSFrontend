import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../backbone/Header";
import LandingPageIndex from "./Index";

export default function LandingPage({ userInfo, isLandingPage }) {

  const [isLoading, setIsLoading] = useState(true);

  const handleSetCurrentPage = useCallback((newCurrentPage) => {
    setIsLoading(true);
  }, []);

  return (
    <>
      <Header userInfo={userInfo} isLandingPage={isLandingPage}  />
      <LandingPageIndex  handleSetCurrentPage={handleSetCurrentPage} isLoading={isLoading} />
    </>
  );
}