import { useEffect, useRef, useState, useCallback } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import TableLandingPage from "../../part/TableLandingPage";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import { faAlignCenter } from "@fortawesome/free-solid-svg-icons";

const initialData = [
  {
    Key: null,
    No: null,
    Kategori: null,
    "ID Barang": null,
    "Nama Barang": null,
    Spesifikasi: null,
    "Stok Minimal": null,
    "Jumlah Stok": null,
    "Satuan": null,
    Count: 0,
  },
];

export default function LandingPageIndex({}) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    column: null,
    query: "",
    sort: "[Nama Barang] asc",
  });

  const handleHeaderBoxSearchQuery = (e) => {
    const { name, value } = e.target;
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      column: name,
      query: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "MasterMaterial/GetDataMaterialsLandingPage",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: [
              "left",
              "left",
              "left",
              "left",
              "left",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentFilter]);

  return (
    <div style={{ marginTop: "80px", marginBottom: "50px" }}>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="d-flex flex-column container-fluid">
          {isError && (
            <div className="flex-fill">
              <Alert
                type="warning"
                message="Terjadi kesalahan: Gagal mengambil data material."
              />
            </div>
          )}

          <div className="card">
            <div className="card-header bg-primary fw-medium text-white w-100">
              Data Stok Barang
            </div>
            <div className="card-body">
              <TableLandingPage
                data={currentData}
                enableColumnSearchBox={true}
                setHeaderBoxSearchQuery={handleHeaderBoxSearchQuery}
              />
            </div>
          </div>
         </div>
      )}
    </div>
  );
}
