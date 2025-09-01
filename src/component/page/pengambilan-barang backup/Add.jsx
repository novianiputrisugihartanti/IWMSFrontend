import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

const initialData = [
  {
    Key: null,
    No: null,
    Barcode: null,
    "Nama Barang": null,
    "Sisa Stok": null,
    "Jumlah Pengambilan": null,
    Action: null,
    Count: 0,
  },
];

export default function TransaksiPengambilanBarangAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listNpk, setListNpk] = useState({});
  const [listSpk, setListSpk] = useState({});
  const [namaPengambil, setnamaPengambil] = useState("");
  const [currentData, setCurrentData] = useState(initialData);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [listBarId, setListBarId] = useState([]);

  const formDataRef = useRef({
    pabNpk: "",
    pabSpk: "",
  });

  const detailDataRef = useRef([]);

  const handleBarcodeChange = (e) => {
    setBarcodeInput(e.target.value);
  };

  const handleKeyDownJumlah = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlurJumlah(e, index);
    }
  };

  const handleBlurJumlah = async (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
    let { value } = e.target;
    if (value?.length === 0) {
      return;
    }
    if (value.includes("/")) {
      const [numerator, denominator] = value.split("/").map(Number);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        value = (numerator / denominator).toString();
      } else {
        SweetAlert("Peringatan", "Format input tidak valid", "warning");
        e.target.value = 0;
        return;
      }
    }
    let newValue = parseFloat(value);
    if (newValue % 1 !== 0) {
      newValue = parseFloat(newValue).toFixed(2);
    }

    if (newValue > detailDataRef.current[index]?.sisaStock) {
      SweetAlert(
        "Peringatan",
        "Jumlah pengambilan tidak boleh melebihi sisa stok",
        "warning"
      );
      e.target.value = 0;
      return;
    }
    detailDataRef.current[index].pebJumlah = newValue;
    e.target.value = newValue;
  };

  const filterToUniqueData = (data) => {
    const uniqueKeySet = new Set();
    const uniqueData = [];

    data.forEach((value) => {
      if (value.Key !== null && !uniqueKeySet.has(value.Key)) {
        uniqueKeySet.add(value.Key);
        uniqueData.push(value);
      }
    });
    return uniqueData;
  };

  const handleBarcodeKeyPress = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const endpoint =
        API_LINK +
        "TransaksiPengambilanBarang/GetDataTransPengambilanDetailToSubmit";
      const params = { barcode: barcodeInput };

      if (barcodeInput === "") {
        SweetAlert("Peringatan", "Barcode tidak boleh kosong", "warning");
        return;
      }

      setIsLoading(true);
      try {
        const data = await UseFetch(endpoint, params);
        if (data === "ERROR") {
          throw new Error("Gagal mengambil data.");
        } else if (data.length === 0) {
          SweetAlert("Informasi", "Data tidak ditemukan", "info");
        } else {
          const newDetailData = data.map((value, index) => ({
            Key: value.Key,
            barId: value.Key,
            "Nama Barang": value["Nama Barang"],
            "Sisa Stok": value["Sisa Stok"],
            Barcode: value.Barcode?.split(",")[0],
            pebJumlah: 0,
            penBarcode: null,
            sisaStock: value["Sisa Stok"],
          }));

          const uniqueRefData = filterToUniqueData([
            ...detailDataRef.current,
            ...newDetailData,
          ]);
          detailDataRef.current = uniqueRefData;

          const formattedData = detailDataRef.current?.map((value, index) => {
            const firstBarcode = value.Barcode?.split(",")[0];
            return {
              Key: value.Key,
              Barcode: (
                <img
                  src={`${FILE_LINK}${firstBarcode}.jpg`}
                  alt=""
                  style={{ width: "200px", height: "auto" }}
                />
              ),
              "Nama Barang": value["Nama Barang"],
              "Sisa Stok": value["Sisa Stok"],
              "Jumlah Pengambilan": (
                <input
                  type="text"
                  min={0}
                  defaultValue={value.pebJumlah}
                  onBlur={(e) => handleBlurJumlah(e, index)}
                  onKeyDown={(e) => handleKeyDownJumlah(e, index)}
                  className="form-control hide-arrow-number"
                  style={{
                    width: "80px",
                    margin: "0 auto",
                    textAlign: "center",
                  }}
                />
              ),
              Action: (
                <button
                  type="button"
                  onClick={(e) => handleClickDeleteRow(e, value.Key)}
                  className="btn btn-outline-dark border-0"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              ),
              Count: value.Count,
              Alignment: ["center", "center", "center", "center", "center"],
            };
          });
          setListBarId(data.map((value) => value["Part Number"]));
          setCurrentData([...formattedData]);
          setBarcodeInput("");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClickDeleteRow = (e, key) => {
    e.preventDefault();
    detailDataRef.current = detailDataRef.current.filter(
      (value, i) => value.Key !== key
    );
    if (detailDataRef.current.length === 0) {
      setCurrentData(initialData);
    } else {
      setCurrentData(
        detailDataRef.current.map((value, index) => ({
          Key: value.Key,
          Barcode: (
            <img
              src={`${FILE_LINK}${value.Barcode}.jpg`}
              alt=""
              style={{ width: "200px", height: "auto" }}
            />
          ),
          "Nama Barang": value["Nama Barang"],
          "Sisa Stok": value["Sisa Stok"],
          "Jumlah Pengambilan": (
            <input
              type="text"
              min={0}
              defaultValue={value.pebJumlah}
              onBlur={(e) => handleBlurJumlah(e, index)}
              className="form-control hide-arrow-number"
              style={{ width: "80px", margin: "0 auto", textAlign: "center" }}
            />
          ),
          Action: (
            <button
              type="button"
              onClick={(e) => handleClickDeleteRow(e, value.Key)}
              className="btn btn-outline-dark border-0"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          ),
          Count: value.Count,
          Alignment: ["center", "center", "center", "center", "center"],
        }))
      );
    }
  };

  const userSchema = object({
    pabNpk: string(),
    pabSpk: string(),
    pabPengambil: string(),
  });

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListNpkPengambil",
      {},
      setListNpk,
      "Terjadi kesalahan: Gagal mengambil daftar NPK."
    );
  }, []);

  useEffect(() => {
    if (formDataRef.current["pabNpk"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetNamaPengambil",
        { npkId: formDataRef.current["pabNpk"] },
        (data) => {
          if (Array.isArray(data) && data.length > 0) {
            setnamaPengambil(data[0].NamaPengambil);
          } else {
            setIsError(true);
          }
        },
        "Terjadi kesalahan: Gagal mengambil nama pengambil."
      );
    }
  }, [formDataRef.current["pabNpk"]]);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSpk",
      {},
      setListSpk,
      "Terjadi kesalahan: Gagal mengambil daftar spk."
    );
  }, []);

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter({});
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;

    if (name === "barcode") {
      setCurrentFilter({ barcode: value });
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPengambilanBarang/CreateTransPengambilan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data pengambilan Barang."
          );
        } else {
          if (data?.length > 0) {
            handleAddDetail(data[0]?.PabNo, barcodeInput);
          }
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
    }
  };

  const handleAddDetail = async (PabNo, BarcodeText) => {
    const data = detailDataRef.current.map((value, index) => ({
      pabNo: PabNo,
      barId: value.Key,
      pebJumlah: value.pebJumlah ? value.pebJumlah.toString() : "0",
      pebBarcode: BarcodeText,
    }));

    let requests = [];

    data.forEach((value) => {
      requests.push(
        UseFetch(
          API_LINK + "TransaksiPengambilanBarang/CreateTransPengambilanDetail",
          value
        )
      );
    });

    try {
      const responses = await Promise.all(requests);
      if (responses.includes("ERROR")) {
        throw new Error(
          "Terjadi kesalahan: Gagal menyimpan data Transaksi Detail."
        );
      } else {
        SweetAlert("Sukses", "Data Transaksi berhasil disimpan", "success");
        onChangePage("index");
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
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
            Pengambilan Barang
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <DropDown
                  forInput="pabNpk"
                  label="NPK Pengambil"
                  arrData={listNpk}
                  value={formDataRef.current.pabNpk}
                  onChange={handleInputChange}
                  errorMessage={errors.pabNpk}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="pabPengambil"
                  label="Nama Pengambil"
                  disabled
                  value={namaPengambil}
                  onChange={handleInputChange}
                  errorMessage={errors.pabPengambil}
                />
              </div>

              <div className="col-lg-4">
                <DropDown
                  forInput="pabSpk"
                  label="Nomor SPK"
                  arrData={listSpk}
                  value={formDataRef.current.pabSpk}
                  onChange={handleInputChange}
                  errorMessage={errors.pabSpk}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barcode"
                  label="Barcode"
                  value={barcodeInput}
                  onChange={handleBarcodeChange}
                  onKeyPress={handleBarcodeKeyPress}
                  errorMessage={errors.barcode}
                />
              </div>
            </div>
            <div className="row mt-2">
              {isLoading ? (
                <Loading />
              ) : (
                <div className="d-flex flex-column">
                  <Table data={currentData} />
                </div>
              )}
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
