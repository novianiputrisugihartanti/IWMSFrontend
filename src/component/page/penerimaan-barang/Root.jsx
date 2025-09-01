import { useState } from "react";
import TransaksiPemerimaanBarangIndex from "./Index";
import TransaksiPemerimaanBarangDetail from "./Detail";
import TransaksiPemerimaanBarangAdd from "./Add";

export default function TransaksiPemerimaanBarang() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TransaksiPemerimaanBarangIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <TransaksiPemerimaanBarangAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <TransaksiPemerimaanBarangDetail
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
