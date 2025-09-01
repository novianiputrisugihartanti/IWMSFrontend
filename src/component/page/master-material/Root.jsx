import { useState } from "react";
import MasterMaterialIndex from "./Index";
import MasterMaterialAdd from "./Add";
import MasterMaterialDetail from "./Detail";
import MasterMaterialEdit from "./Edit";

export default function MasterMaterial() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterMaterialIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterMaterialAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterMaterialDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterMaterialEdit
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
