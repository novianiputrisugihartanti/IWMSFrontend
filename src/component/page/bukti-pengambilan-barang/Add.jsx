import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

const initialData = [
  {
    Key: null,
    No: null,
    "Nama Barang": null,
    Count: 0,
  },
];

export default function TransaksiBuktiPengambilanBarangAdd({ onChangePage }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(initialData);
  const [pabNoList, setPabNoList] = useState([]);

  useEffect(() => {
    const getCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiBuktiPengambilanBarang/GetDataTransBuktiPengambilanBarangDetailToSubmit",
          { tanggal: getCurrentDate() }
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Alignment: ["center", "center", "center", "center", "center"],
          }));
          setCurrentData(formattedData);
          setPabNoList(data.map((value) => value["Key"]));
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (pabNoList.length === 0) {
      SweetAlert(
        "Peringatan",
        "Tidak ada data transaksi yang dapat disimpan",
        "warning"
      );
      return;
    }
    try {
      const data = await UseFetch(
        API_LINK +
          "TransaksiBuktiPengambilanBarang/CreateTransBuktiPengambilanBarang",
        { pabNoList: pabNoList?.join(",") }
      );

      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal menyimpan data pengambilan Barang."
        );
      } else {
        SweetAlert(
          "Sukses",
          "Data pengambilan Barang berhasil disimpan",
          "success"
        );
        onChangePage("index");
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Bukti Pengambilan Barang
          </div>
          <div className="card-body p-4">
            <div className="row mt-2">
              <div className="d-flex flex-column">
                <Table data={currentData} />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
