import { useState } from "react";
import TransaksiPengambilanBarangIndex from "./Index";
import TransaksiPengambilanBarangAdd from "./Add";
import TransaksiPengambilanBarangDetail from "./Detail";

export default function TransaksiPengambilanBarang() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TransaksiPengambilanBarangIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <TransaksiPengambilanBarangAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <TransaksiPengambilanBarangDetail
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
