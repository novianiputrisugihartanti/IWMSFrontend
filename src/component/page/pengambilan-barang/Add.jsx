import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import Modal from "../../part/Modal";
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
    "Kode Batang": null,
    "Kategori Barang": null,
    "Nama Barang": null,
    "Spesifikasi Barang": null,
    "Sisa Stok": null,
    "Jumlah Pengambilan": null,
    Status: null,
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
  const [isMassproRaw, setIsMassproRaw] = useState(false);
  const [isMassproFg, setIsMassproFg] = useState(false);
  const [isProduction, setIsProduction] = useState(false);
  const [npkInput, setNpkInput] = useState("");
  const [spkInput, setSpkInput] = useState("");
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [firstStatus, setFirstStatus] = useState(null);
  const [isJumlahValid, setIsJumlahValid] = useState(true);
  const modalRef = useRef();
  const isAllJumlahFilled = () => {
    return detailDataRef.current.every((item) => item.pebJumlah > 0);
  };
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

    const value = e.target.value;
  };



  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSpk",
      {},
      setListSpk,
      "Terjadi kesalahan: Gagal mengambil daftar spk."
    );
  }, []);

  // const filterSpkByKategori = async () => {
  //   if (detailDataRef.current.length === 0) {
  //     setListSpk(null);
  //     return;
  //   }

  //   const kategoris = detailDataRef.current[0]?.["Kategori Barang"];
  //   let filterCondition = "";

  //   if (kategoris.includes("MASSPRO")) {
  //     filterCondition = "MSRA,MSFG";
  //   } else if (kategoris.includes("PRODUCTION")) {
  //     filterCondition = "PRFG";
  //   } else {
  //     filterCondition = "other";
  //   }

  //   try {
  //     const data = await UseFetch(
  //       API_LINK + "Utilities/GetListSpkByBarcode",
  //       { filterCondition }
  //     );
  //     if (data === "ERROR") {
  //       throw new Error("Terjadi kesalahan: Gagal mengambil daftar spk.");
  //     } else {
  //       setListSpk(data);
  //     }
  //   } catch (error) {
  //     setIsError({ error: true, message: error.message });
  //   }
  // };

  useEffect(() => {
    if (npkInput === null || npkInput === "") {
      setErrors((prevErrors) => ({ ...prevErrors, pabNpk: "wajib diisi" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, pabNpk: "" }));
      
    }
  }, [npkInput]);

  useEffect(() => {
    if (spkInput === null || spkInput === "") {
      setErrors((prevErrors) => ({ ...prevErrors, pabSpk: "wajib diisi" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, pabSpk: "" }));
    }
  }, [spkInput]);

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
        setIsJumlahValid(false);
        return;
      }
    }
    let newValue = parseFloat(value);
    if (newValue % 1 !== 0) {
      newValue = parseFloat(newValue).toFixed(2);
    }

    if (newValue === 0) {
      SweetAlert("Peringatan", "Jumlah pengambilan tidak boleh 0", "warning");
      setIsJumlahValid(false);
      return;
    }

    if (newValue <= -1) {
      SweetAlert(
        "Peringatan",
        "Jumlah pengambilan tidak boleh minus",
        "warning"
      );
      setIsJumlahValid(false);
      return;
    }

    if (newValue > detailDataRef.current[index]?.sisaStock) {
      SweetAlert(
        "Peringatan",
        "Jumlah pengambilan tidak boleh melebihi sisa stok",
        "warning"
      );
      setIsJumlahValid(false);
      e.target.value = 0;
      return;
    }
    detailDataRef.current[index].pebJumlah = newValue;
    e.target.value = newValue;
    setIsJumlahValid(true);
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

  // useEffect(() => {
  //   console.log(isProduction + " isProduction updated");
  // }, [isProduction]);

  // useEffect(() => {
  //   console.log(firstStatus + " firstStatus updated");
  // }, [firstStatus]);
  // const handleSpkChange = (e) => {
  //   setSpkInput(e.target.value);
  // };

  const handleBarcodeKeyPress = async (e) => {
    console.log(spkInput + "spkInput");
    if (e.key === "Enter" && spkInput !== null && spkInput !== "") {
      e.preventDefault();
      const value = e.target.value;
      setBarcodeInput(value);

      if (value.length === 0) return;

      const endpoint =
        API_LINK +
        "TransaksiPengambilanBarang/GetDataTransPengambilanDetailToSubmit";
      // const params = { barcode: value };
      const params = { barcode: value, spk: spkInput };

      setIsLoading(true);
      try {
        const data = await UseFetch(endpoint, params);
        if (data === "ERROR") {
          throw new Error("Gagal mengambil data.");
        } else if (data.length === 0) {
          SweetAlert("Informasi", "Data tidak ditemukan", "info");
        } else {
          const hasZeroStock = data.some((item) => item["Sisa Stok"] === 0);
          if (hasZeroStock) {
            SweetAlert(
              "Peringatan",
              "Stok kosong, tidak dapat mengambil barang",
              "warning"
            );
            setIsLoading(false);
            return;
          }

          if (detailDataRef.current.length === 0) {
            const firstKategori = data[0]?.["Kategori Barang"];
            setIsMassproFg(
              firstKategori?.toLowerCase()?.includes("masspro fg")
            );
            setIsMassproRaw(
              firstKategori?.toLowerCase()?.includes("masspro raw")
            );
            setIsProduction(
              firstKategori?.toLowerCase()?.includes("production")
            );
          } else {
            const kategori = data[0]?.["Kategori Barang"];
            const isBarcodeMassproFg = kategori
              ?.toLowerCase()
              ?.includes("masspro fg");
            const isBarcodeProduction = kategori
              ?.toLowerCase()
              ?.includes("production");
            const isBarcodeMassproRaw = kategori
              ?.toLowerCase()
              ?.includes("masspro raw");

            if (
              (isMassproFg && !isBarcodeMassproFg) ||
              (isProduction && !isBarcodeProduction) ||
              (isMassproRaw && !isBarcodeMassproRaw) ||
              (!isMassproFg &&
                !isProduction &&
                !isMassproRaw &&
                (isBarcodeMassproFg ||
                  isBarcodeProduction ||
                  isBarcodeMassproRaw))
            ) {
              SweetAlert(
                "Peringatan",
                `Tipe barang dari barcode yang anda input tidak sesuai! Pilih salah satu antara Masspro Raw, Masspro Fg, Non Masspro, atau Production`,
                "warning"
              );
              setIsLoading(false);
              return;
            }
          }

          const firstItemStatus = data[0]?.["Status"];
          if (detailDataRef.current.length === 0) {
            setFirstStatus(firstItemStatus);
          } else if (
            (isMassproFg || isMassproRaw || isProduction) &&
            firstItemStatus !== firstStatus
          ) {
            SweetAlert(
              "Peringatan",
              "Status barang yang diinput tidak sesuai dengan status barang sebelumnya.",
              "warning"
            );
            setIsLoading(false);
            return;
          }
          function getStatus(value) {
            const status = value["Status"];

            if (typeof status === "number") {
              return status === 1 ? "OK" : "NG";
            }

            const parsedStatus = parseInt(status, 10);
            if (!isNaN(parsedStatus)) {
              return parsedStatus === 1 ? "OK" : "NG";
            }

            return status === "OK" ? "OK" : "NG";
          }
          const newDetailData = data.map((value, index) => ({
            Key: value.Key,
            barId: value["Part Number"],
            "Nama Barang": value["Nama Barang"],
            "Spesifikasi Barang": value["Spesifikasi Barang"],
            "Kategori Barang": value["Kategori Barang"],
            "Sisa Stok": value["Sisa Stok"],
            Status: getStatus(value),
            "Kode Batang": value["Kode Batang"]?.split(",")[0],
            pebJumlah: value["Jumlah Pengambilan"],
            penBarcode: value["Kode Batang"]?.split(",")[0],
            sisaStock: value["Sisa Stok"],
          }));

          const uniqueRefData = filterToUniqueData([
            ...detailDataRef.current,
            ...newDetailData,
          ]);
          detailDataRef.current = uniqueRefData;

          const formattedData = detailDataRef.current?.map((value, index) => {
            const firstBarcode = value["Kode Batang"]?.split(",")[0];
            const jumlahElement = (
              <input
                type="text"
                min={0}
                defaultValue={value.pebJumlah}
                onBlur={(e) => handleBlurJumlah(e, index)}
                onKeyDown={(e) => handleKeyDownJumlah(e, index)}
                className="form-control hide-arrow-number"
                style={{ width: "80px", margin: "0 auto", textAlign: "center" }}
              />
            );
            return {
              Key: value.Key,
              "Kode Batang": (
                <img
                  src={`${FILE_LINK}${firstBarcode}.jpg`}
                  alt=""
                  style={{ width: "200px", height: "auto" }}
                />
              ),
              "Kategori Barang": value["Kategori Barang"],
              "Nama Barang": value["Nama Barang"],
              "Spesifikasi Barang": value["Spesifikasi Barang"],

              "Sisa Stok": value["Sisa Stok"],
              "Jumlah Pengambilan":
                value["Kategori Barang"]?.toLowerCase()?.includes("masspro") ||
                value["Kategori Barang"]?.toLowerCase()?.includes("production")
                  ? value.pebJumlah
                  : jumlahElement,
              Status: getStatus(value),
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
              Alignment: [
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
              ],
            };
          });
          setListBarId(data.map((value) => value["Part Number"]));
          setCurrentData([...formattedData]);
          // if (uniqueRefData.length > 0) {
          //   await filterSpkByKategori();
          // }
          setBarcodeInput("");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, pabSpk: "wajib diisi" }));
    }
  };

  const handleClickDeleteRow = (e, key) => {
    e.preventDefault();
    detailDataRef.current = detailDataRef.current.filter(
      (value, i) => value.Key !== key
    );
    if (detailDataRef.current.length === 0) {
      setCurrentData(initialData);
      setFirstStatus(null);
    } else {
      setCurrentData(
        detailDataRef.current.map((value, index) => {
          const jumlahElement = (
            <input
              type="text"
              min={0}
              defaultValue={value.pebJumlah}
              onBlur={(e) => handleBlurJumlah(e, index)}
              className="form-control hide-arrow-number"
              style={{ width: "80px", margin: "0 auto", textAlign: "center" }}
            />
          );
          return {
            Key: value.Key,
            "Kode Batang": (
              <img
                src={`${FILE_LINK}${value["Kode Batang"]}.jpg`}
                alt=""
                style={{ width: "200px", height: "auto" }}
              />
            ),
            "Kategori Barang": value["Kategori Barang"],
            "Nama Barang": value["Nama Barang"],
            "Spesifikasi Barang": value["Spesifikasi Barang"],
            "Sisa Stok": value["Sisa Stok"],
            "Jumlah Pengambilan": value["Kategori Barang"]
              ?.toLowerCase()
              ?.includes("masspro")
              ? value.pebJumlah
              : jumlahElement,
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
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          };
        })
      );
    }
    // filterSpkByKategori();
  };

  const userSchema = object({
    pabNpk: string().required("harus diisi"),
    pabSpk: string().required("harus diisi"),
    pabPengambil: string().required("harus diisi"),
  });

  useEffect(() => {
    if (npkInput === null || npkInput === "") {
      setnamaPengambil("");
      setErrors((prevErrors) => ({
        ...prevErrors,
        pabPengambil: "wajib diisi",
      }));
    } else {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetNamaPengambil",
        { npkId: npkInput },
        (data) => {
          if (Array.isArray(data) && data.length > 0) {
            setnamaPengambil(data[0].NamaPengambil);
            formDataRef.current.pabPengambil = data[0].NamaPengambil;
            
            setIsError(false);
            setErrors((prevErrors) => ({
              ...prevErrors,
              pabPengambil: "",
            }));
          } else {
            setIsError(true);
            setErrors((prevErrors) => ({
              ...prevErrors,
              pabPengambil: "tidak terdaftar",
            }));
            setnamaPengambil("");
          }
        },
        "Terjadi kesalahan: Gagal mengambil nama pengambil."
      );
    }
  }, [npkInput]);

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

  useEffect(() => {
    setIsSaveButtonDisabled(detailDataRef.current.length === 0);
  }, [detailDataRef.current]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;

    if (name === "barcode") {
      setCurrentFilter({ barcode: value });
    }

    if (name === "pabSpk") {
      setSpkInput(value);
    }

    if(name=="pabNpk"){
      setNpkInput(value);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };
  //MODAL
  const validateForm = async () => {
    // const validationErrors = await validateAllInputs(
    //   formDataRef.current,
    //   userSchema,
    //   setErrors
    // );
    if (!isJumlahValid) {
      SweetAlert(
        "Gagal Menyimpan Data",
        "Jumlah pengambilan tidak valid.",
        "error"
      );
      return false;
    }

    if (!isAllJumlahFilled()) {
      SweetAlert(
        "Gagal Menyimpan Data",
        "Jumlah pengambilan wajib diisi.",
        "error"
      );
      return false;
    }

    // if (Object.values(validationErrors).every((error) => !error)) {
    //   return false;
    // }
    return true;
  };
  const [modalMessage, setModalMessage] = useState("");
  const [modalDetailData, setModalDetailData] = useState([]);
  const [modalFormData, setModalFormData] = useState({});

  const handleToggleClick = async () => {
    const isFormValid = await validateForm();

    if (isFormValid) {
      const detailData = detailDataRef.current.map((item) => ({
        kodebatang: item["Kode Batang"],
        kategori: item["Kategori Barang"],
        namabarang: item["Nama Barang"],
        spekbarang: item["Spesifikasi Barang"],
        sisastok: item["Sisa Stok"],
        penjumlah: item.pebJumlah,
        status: item["Status"],
      }));

      setModalDetailData(detailData);
      setModalFormData(formDataRef.current);
      setModalMessage("Apakah Anda yakin ingin menyimpan data ini?");
      modalRef.current.open();
    }
  };

  const handleConfirmToggle = () => {
    handleAdd();
    modalRef.current.close();
  };

  const keyDisplayMap = {
    pabNpk:"NPK",
    pabSpk: "SPK",
    pabPengambil: "Nama Pengambil",
  };

  const handleAdd = async () => {
    formDataRef.current.pabNpk = npkInput;
    formDataRef.current.pabPengambil = namaPengambil;

   
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
  };

  const handleAddDetail = async (PabNo, BarcodeText) => {
    const data = detailDataRef.current.map((value, index) => ({
      pabNo: PabNo,
      barId: value.barId,
      pebJumlah: value.pebJumlah ? value.pebJumlah.toString() : "0",
      pebBarcode: value.penBarcode,
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

    if (isMassproFg || isMassproRaw || isProduction) {
      detailDataRef.current?.map((value, index) => {
        requests.push(
          UseFetch(
            API_LINK +
              "TransaksiPengambilanBarang/UpdatePenStatusAfterSubmitPengambilanMasspro",
            { penDetailId: value.Key }
          )
        );
      });
    }

    try {
      const responses = await Promise.all(requests);
      if (responses.includes("ERROR")) {
        throw new Error(
          "Terjadi kesalahan: Gagal menyimpan data Transaksi Detail."
        );
      } else {
        SweetAlert("Sukses", "Data Transaksi berhasil disimpan", "success");
        setFirstStatus(null);
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
      {/* <form onSubmit={handleAdd}> */}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Pengambilan Barang
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Input
                type="text"
                forInput="pabNpk"
                label="NPK Pengambil"
                isRequired
                value={npkInput}
                onChange={handleInputChange}
                errorMessage={errors.pabNpk}
              />
            </div>
            <div className="col-lg-4">
              <Input
                type="text"
                forInput="pabPengambil"
                label="Nama Pengambil"
                isRequired
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
                isRequired
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
                label="Kode Batang"
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
          type="button"
          className="btn btn-primary"
          disabled={isSaveButtonDisabled}
          onClick={() => handleToggleClick()}
          label="SIMPAN"
        ></Button>
      </div>
      {/* </form> */}
      <Modal
        ref={modalRef}
        title="Konfirmasi"
        size="large"
        Button1={
          <Button
            classType="danger me-1"
            label="Ya"
            onClick={handleConfirmToggle}
          />
        }
      >
        <div>
          <p>{modalMessage}</p>
          <h6>Form Data:</h6>
          {Object.entries(modalFormData).map(([key, value]) => {
             console.log(key+"keyy")
            const displayKey =
              keyDisplayMap[key] || key.replace(/([A-Z])/g, " $1").trim();
              console.log(displayKey)
            const displayValue = value === "" || value === 0 ? "-" : value;

            return (
              <p key={key}>
                {displayKey}: {displayValue}
              </p>
            );
          })}
          <h6>Detail Data:</h6>
          <table className="table table-hover table-striped table table-light border">
            <thead>
              <tr>
                <th>Kode Batang</th>
                <th>Kategori Barang</th>
                <th>Nama Barang</th>
                <th>Spesifikasi Barang</th>
                <th>Sisa Stok</th>
                <th>Jumlah Pengambilan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {modalDetailData.map((item, index) => (
                <tr key={index}>
                  <td>{item.kodebatang}</td>
                  <td>{item.kategori}</td>
                  <td>{item.namabarang}</td>
                  <td>{item.spekbarang}</td>
                  <td>{item.sisastok}</td>
                  <td>{item.penjumlah}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
