import { useEffect, useRef, useState, useCallback } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";

const initialData = [
  {
    Key: null,
    No: null,
    Foto: null,
    "ID Barang": null,
    "Nama Material": null,
    Spesifikasi: null,
    "Stok Tersedia": null,
    Status: null,
    Count: 0,
  },
];

const showAlert = (message) => {
  SweetAlert("Peringatan", message, "warning");
};

const sortOptions = [
  { Value: "[ID Barang] asc", Text: "ID Barang [↑]" },
  { Value: "[ID Barang] desc", Text: "ID Barang [↓]" },
  { Value: "[Created Date] asc", Text: "Tanggal Dibuat [↑]" },
  { Value: "[Created Date] desc", Text: "Tanggal Dibuat [↓]" },
];

const statusOptions = [
  { Value: 1, Text: "Aktif" },
  { Value: 0, Text: "Non Aktif" },
];

export default function MasterMaterialIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Created Date] desc",
    status: 1
  });

  const path = window.location.pathname;
  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const handleSetCurrentPage = useCallback((newCurrentPage) => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: parseInt(searchFilterStatus.current.value)
    }));
  }, []);

  const handleSetStatus = useCallback(
    async (id) => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "MasterMaterial/SetStatusMaterial",
          {
            barId: id,
          }
        );
        if (data === "ERROR" || data.length === 0) {
          setIsError(true);
        } else {
          SweetAlert(
            "Sukses",
            "Status data barang/jasa berhasil diubah menjadi " +
              (data[0].Status == 1 ? "Aktif" : "Non Aktif"),
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilter.page, handleSetCurrentPage]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "MasterMaterial/GetDataMaterials",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => {
            return {
              Key: value.Key,
              No: value.No,
              Foto: value["Foto"],
              "ID Barang": value["ID Barang"],
              Nama: value["Nama Material"],
              Spesifikasi: value["Spesifikasi"],
              Stok: value["Stok Tersedia"],
              Status: value["Status"] == 1 ? "Aktif" : "Non Aktif",
              Lokasi: value["Lokasi"] == null || "" ? "-" : value["Lokasi"],
              Rak: value["Rak"] == null || "" ? "-" : value["Rak"],
              Bin: value["Bin"] == null || "" ? "-" : value["Bin"],
              Count: value.Count,
              Aksi: ["Toggle", "Detail", "Edit"],
              Alignment: [
                "center",
                "center",
                "left",
                "left",
                "center",
                "center",
                "center",
                "left",
                "left",
                "left",
              ],
            };
          });
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
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data material."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            {path === "/master_material" && (
              <Button
                iconName="add"
                classType="success"
                label="Tambah"
                onClick={() => onChangePage("add")}
              />
            )}
            <Input
              ref={searchQuery}
              forInput="pencarianMaterial"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={sortOptions}
                defaultValue="[Created Date] desc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={statusOptions}
                defaultValue={1}
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onToggle={handleSetStatus}
                onDetail={onChangePage}
                onEdit={onChangePage}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
