// import { useState } from "react";
// import MasterMaterialIndex from "./Index";
// import MasterMaterialAdd from "./Add";
// import MasterMaterialDetail from "./Detail";
// import MasterMaterialEdit from "./Edit";

// export default function MasterMaterial() {
//   const [pageMode, setPageMode] = useState("index");
//   const [dataID, setDataID] = useState();

//   function getPageMode() {
//     switch (pageMode) {
//       case "index":
//         return <MasterMaterialIndex onChangePage={handleSetPageMode} />;
//       case "add":
//         return <MasterMaterialAdd onChangePage={handleSetPageMode} />;
//       case "detail":
//         return (
//           <MasterMaterialDetail
//             onChangePage={handleSetPageMode}
//             withID={dataID}
//           />
//         );
//       case "edit":
//         return (
//           <MasterMaterialEdit
//             onChangePage={handleSetPageMode}
//             withID={dataID}
//           />
//         );
//       default:
//         return <MasterMaterialIndex onChangePage={handleSetPageMode} />;
//     }
//   }

//   function handleSetPageMode(mode, withID) {
//     setDataID(withID);
//     setPageMode(mode);
//   }

//   return <div>{getPageMode()}</div>;
// }

import { useState, useEffect } from "react";
import MasterMaterialIndex from "./Index";
import MasterMaterialAdd from "./Add";
import MasterMaterialDetail from "./Detail";
import MasterMaterialEdit from "./Edit";
import Loading from "../../part/Loading";
export default function MasterMaterial() {
  const [pageMode, setPageMode] = useState("index");
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePage = (mode, id = null) => {
    // console.log("Changing page to:", mode, "with ID:", id);
    setIsLoading(true);
    
    // Simpan ID jika ada
    if (id) {
      setSelectedId(id);
    }
    
    // Set page mode dengan sedikit delay
    setTimeout(() => {
      setPageMode(mode);
      setIsLoading(false);
    }, 100);
  };

  if (isLoading) return <Loading />;

  switch (pageMode) {
    case "index":
      return <MasterMaterialIndex onChangePage={handleChangePage} />;
    case "add":
      return <MasterMaterialAdd onChangePage={handleChangePage} />;
    case "detail":
      return (
        <MasterMaterialDetail
          onChangePage={handleChangePage}
          withID={selectedId}
        />
      );
    case "edit":
      return (
        <MasterMaterialEdit
          onChangePage={handleChangePage}
          withID={selectedId}
        />
      );
    default:
      return <MasterMaterialIndex onChangePage={handleChangePage} />;
  }
}