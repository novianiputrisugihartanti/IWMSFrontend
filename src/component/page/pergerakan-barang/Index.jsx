import React, { useEffect, useRef, useState, useCallback } from "react";
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
import * as XLSX from "xlsx";

const initialData = [
  {
    Key: null,
    No: null,
    "Nomor Transaksi": null,
    "Tanggal Transaksi": null,
    "Nomor SPK": null,
    Count: 0,
  },
];

const sortOptions = [
  { Value: "[Nomor Transaksi] asc", Text: "Nomor Transaksi [↑]" },
  { Value: "[Nomor Transaksi] desc", Text: "Nomor Transaksi [↓]" },
  { Value: "[Tanggal Transaksi] asc", Text: "Tanggal Transaksi [↑]" },
  { Value: "[Tanggal Transaksi] desc", Text: "Tanggal Transaksi [↓]" }
];

export default function LaporanPergerakanBarangIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nomor Transaksi] desc",
    startDate: "",
    endDate: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStartDate = useRef();
  const searchFilterEndDate = useRef();

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
    }));
  }, []);

  const handleDownload = async () => {
    if (
      !searchFilterStartDate.current.value ||
      !searchFilterEndDate.current.value
    ) {
      SweetAlert("Peringatan", "Range Tanggal tidak boleh kosong.", "warning");
      return;
    }
    setIsLoading(true);
    try {
      const path = window.location.pathname;
      const endPoint =
        path === "/pergerakan_barang_masspro"
          ? "DownloadExcelMasspro"
          : "DownloadExcelNonMasspro";
      const nonMassproRequest = {
        startDate: searchFilterStartDate.current.value,
        endDate: searchFilterEndDate.current.value,
      };
      const massproRequest = {
        startMonth: searchFilterStartDate.current.value,
        endMonth: searchFilterEndDate.current.value,
      };
      const request =
        path === "/pergerakan_barang_masspro"
          ? massproRequest
          : nonMassproRequest;

      const response = await fetch(
        API_LINK + `LaporanPergerakanBarang/${endPoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );
      if (response.status !== 200) {
        setIsError(true);
        throw new Error(response?.message);
      } else {
        setIsError(false);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan_Pergerakan_Barang_${searchFilterStartDate.current.value}_to_${searchFilterEndDate.current.value}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const path = window.location.pathname;
        const endPoint =
          path === "/pergerakan_barang_masspro"
            ? "GetDataLaporanPergerakanBarangMasspro"
            : "GetDataLaporanPergerakanBarangNonMasspro";
        const data = await UseFetch(
          API_LINK + `LaporanPergerakanBarang/${endPoint}`,
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: ["center", "center", "center", "center"],
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

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    const endDate = new Date(currentFilter.endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (startDate > today) {
      SweetAlert(
        "Peringatan",
        "Tanggal awal tidak boleh lebih dari hari ini.",
        "warning"
      );
      return;
    }

    if (startDate > endDate) {
      SweetAlert(
        "Peringatan",
        "Tanggal awal tidak boleh lebih dari Tanggal Akhir.",
        "warning"
      );
      return;
    }

    setCurrentFilter({ ...currentFilter, startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    const endDate = new Date(e.target.value);
    const startDate = new Date(currentFilter.startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (endDate > today) {
      SweetAlert(
        "Peringatan",
        "Tanggal akhir tidak boleh lebih dari hari ini.",
        "warning"
      );
      return;
    }

    if (endDate < startDate) {
      SweetAlert(
        "Peringatan",
        "Tanggal akhir tidak boleh kurang dari tanggal awal.",
        "warning"
      );
      return;
    }

    setCurrentFilter({ ...currentFilter, endDate: e.target.value });
  };

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data transaksi Pergerakan barang."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Button
              iconName="download"
              classType="primary"
              label="Unduh"
              onClick={handleDownload}
              disabled={currentData.length === 0 || currentData[0].Key === null}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianPengambilanBarang"
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
              />
              <Input
                ref={searchFilterStartDate}
                type="date"
                value={currentFilter.startDate}
                onChange={handleStartDateChange}
                label="Tanggal Awal"
              />
              <Input
                ref={searchFilterEndDate}
                type="date"
                value={currentFilter.endDate}
                onChange={handleEndDateChange}
                label="Tanggal Akhir"
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table data={currentData} onDetail={onChangePage} />
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
