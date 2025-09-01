import { useState } from "react";
import PenerbitanSuratJalanIndex from "./Index";
import PenerbitanSuratJalanAdd from "./Add";
import PenerbitanSuratJalanDetail from "./Detail";

export default function PenerbitanSuratJalan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PenerbitanSuratJalanIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <PenerbitanSuratJalanAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <PenerbitanSuratJalanDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
