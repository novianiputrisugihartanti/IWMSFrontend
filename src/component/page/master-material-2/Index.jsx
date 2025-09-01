import { useEffect, useRef, useState, useCallback } from "react";
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
import { API_LINK } from "../../util/Constants";

const PAGE_SIZE = 10;

const initialData = [
  {
    Key: null,
    No: null,
    "Part Number": null,
    "Nama Material": null,
    Kategori: null,
    "Sub Kategori": null,
    Spesifikasi: null,
    Satuan: null,
    Status: null,
    Count: 0,
  },
];

const sortOptions = [
  { Value: "[Created Date] desc", label: "Tanggal Dibuat ↓" },
  { Value: "[Created Date] asc", label: "Tanggal Dibuat ↑" },
];

const statusOptions = [
  { Value: 1, label: "Aktif" },
  { Value: 0, label: "Non Aktif" },
];

export default function MasterMaterialIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Created Date] desc",
    status: 1,
    activeUser: "noviani.putri",
  });

  const searchQuery = useRef();

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsError(false);
    setIsLoading(true);

    const data = await UseFetch(
      API_LINK + "MasterBarang/GetDataBarang",
      currentFilter
    );
    console.log("data", data);

    if (data === "ERROR") {
      setIsError(true);
      setCurrentData(initialData);
    } else if (Array.isArray(data) && data.length > 0) {
      const formatted = data.map((item) => ({
        Key: item.Key,
        No: item.No,
        Foto: item["Gambar"],
        "Part Number": item["Part Number"],
        "Nama Material": item["Nama Material"],
        Spesifikasi: item["Spesifikasi"],
        Kategori: item["Kategori"],
        "Sub Kategori": item["Sub Kategori"],
        Satuan: item["Satuan"],
        Status: item["Status"],
        Count: item.Count,
        Aksi: item["Status"] === "Aktif" ? ["Toggle", "Edit"] : ["Toggle"],
        Alignment: [
          "center",
          "center",
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

      setCurrentData(formatted);
    } else {
      setCurrentData(initialData);
    }

    setIsLoading(false);
  }, [currentFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handleSearchInput = (e) => {
    if (e.key === "Enter") {
      setCurrentFilter((prev) => ({
        ...prev,
        page: 1,
        query: searchQuery.current.value,
      }));
    }
  };

  const handleSearchClick = () => {
    setCurrentFilter((prev) => ({
      ...prev,
      page: 1,
      query: searchQuery.current.value,
    }));
  };

  const handleSortChange = (label) => {
    const found = sortOptions.find((opt) => opt.label === label);
    setCurrentFilter((prev) => ({
      ...prev,
      page: 1,
      sort: found ? found.Value : prev.sort,
    }));
  };

  const handleStatusChange = (e) => {
    // console.log(e);
    setCurrentFilter((prev) => ({
      ...prev,
      status: e === "" ? null : e === "Aktif" ? 1 : 0,
    }));
  };

  const handlePageChange = (p) => {
    setCurrentFilter((prev) => ({ ...prev, page: p }));
  };

  const handleToggle = async (id) => {
    // Optimistic update
    setCurrentData((prev) =>
      prev.map((item) =>
        item.Key === id
          ? { ...item, Status: item.Status === "Aktif" ? "Non Aktif" : "Aktif" }
          : item
      )
    );

    const data = await UseFetch(API_LINK + "MasterPart/NonAktifPartNumber", {
      id: id,
    });

    // console.log(data);
    if (data === "ERROR") {
      SweetAlert("Error", "Gagal toggle status.", "error");
    } else {
      SweetAlert("Sukses", `${data.message}`, "success");
    }

    fetchData();
  };

  const handleEdit = (mode, id) => {
    onChangePage("edit", id);
  };

  // --- Render ---
  return (
    <div className="container-fluid mt-4">
      {isError && <Alert type="warning" message="Gagal ambil data." />}

      <div className="input-group mb-3">
        <Button
          iconName="add"
          classType="success"
          label="Tambah"
          onClick={() => onChangePage("add")}
        />
        <Input ref={searchQuery} placeholder="Cari..." />
        <Button
          iconName="search"
          classType="primary px-4"
          title="Cari"
          onClick={handleSearchClick}
        />
        <Filter>
          <DropDown
            arrData={sortOptions}
            type="none"
            label="Urut Berdasarkan"
            forInput="ddUrut"
            defaultValue={currentFilter.sort}
            onChange={handleSortChange}
          />
          <DropDown
            arrData={statusOptions}
            type="none"
            forInput="ddStatus"
            label="Status"
            defaultValue={currentFilter.status}
            onChange={handleStatusChange}
          />
        </Filter>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Table
            data={currentData}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
          <Paging
            pageSize={PAGE_SIZE}
            pageCurrent={currentFilter.page}
            totalData={currentData[0]?.Count || 0}
            navigation={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
