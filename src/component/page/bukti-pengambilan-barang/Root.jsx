import { useState } from "react";
import TransaksiBuktiPengambilanBarangIndex from "./Index";
import TransaksiBuktiPengambilanBarangAdd from "./Add";
import TransaksiBuktiPengambilanBarangDetail from "./Detail";

export default function TransaksiPengambilanBarang() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TransaksiBuktiPengambilanBarangIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <TransaksiBuktiPengambilanBarangAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <TransaksiBuktiPengambilanBarangDetail
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
