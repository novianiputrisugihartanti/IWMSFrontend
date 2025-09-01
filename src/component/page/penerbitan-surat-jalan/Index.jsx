import { useEffect, useRef, useState, useCallback } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
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
    "Tanggal": null,
    "No. Surat Jalan": null,
    "No. Order Sheet": null,
    "No. SPK": null,
    "Pelanggan": null,
    Count: 0,
  },
];

const sortOptions = [
  {Value:"[No. Surat Jalan] asc", Text: "No. Surat Jalan [↑]"},
  {Value:"[No. Surat Jalan] desc", Text: "No. Surat Jalan [↓]"},
  { Value: "[Tanggal] asc", Text: "Tanggal [↑]" },
  { Value: "[Tanggal] desc", Text: "Tanggal [↓]" },
];

export default function TransaksiPengambilanBarangIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal] desc",
  });

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
    }));
  }, []);

  
  const handleDownload = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        API_LINK + "TransaksiPenerbitanSuratJalan/DownloadExcel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pabNoSuratJalan: id }),
        }
      );
      if (response.status !== 200) {
        setIsError(true);
        throw new Error(response?.message);
      } else {
        setIsError(false);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${id}.xlsx`;
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
        const data = await UseFetch(API_LINK + "TransaksiPenerbitanSuratJalan/GetDataTransPenerbitanSuratJalan", currentFilter);
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Aksi: ["Detail", "Excel"],
            Alignment: ["center", "center", "center", "center", "center", "center", "center"],
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
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data transaksi Penerbitan Surat Jalan."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianPengambilanSuratJalan"
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
                defaultValue="[Nama PengambilanBarang] asc"
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
                onDetail={onChangePage}
                onDownload={handleDownload}
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
