
import { useEffect, useRef, useState } from "react";
import { object, string, number, date } from "yup";
import { API_LINK } from "../../util/Constants";
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
    "Nama Barang": null,
    "Spesifikasi Barang": null,
    "Jumlah Permintaan": null,
    "Jumlah Penerimaan Sebelumnya": null,
    "Jumlah Penerimaan Saat Ini": null,
    Count: 0,
  },
];

const statusOptions = [
  { Value: "1", Text: "OK" },
  { Value: "0", Text: "NG" },
];

const shiftOptions = [
  { Value: 1, Text: "1" },
  { Value: 2, Text: "2" },
];

export default function TransaksiPemerimaanBarangAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState({});
  const [listSpk, setListSpk] = useState({});
  const [currentData, setCurrentData] = useState(initialData);
  const [currentDate, setCurrentDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSpk, setSelectedSpk] = useState("");
  const [shift, setShift] = useState("");
  const [statusBarang, setStatusBarang] = useState("");
  const [customer, setCustomer] = useState("PT Menara Terus Makmur");
  const modalRef = useRef();
  const [currentFilter, setCurrentFilter] = useState({});
  const [listBarId, setListBarId] = useState([]);
  const [listJumlah, setListJumlah] = useState([]);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [isJumlahValid, setIsJumlahValid] = useState(true);
  const isAllJumlahFilled = () => {
    return detailDataRef.current.every((item) => item.penJumlah > 0);
  };

  const formDataRef = useRef({
    prbTanggalInspeksi: "",
    prbShift: 0,
    prbTanggalDiterima: "",
    prbSpk: "",
    kategoriBarang: "",
    suratJalanVendor: "",
    status: "",
    customer: "",
    vendor: "",
  });

  const setEndOfDay = (date) => {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  };

  const userSchema = object({
    prbTanggalInspeksi: string()
      .required("Tanggal inspeksi wajib diisi")
      .test(
        "is-today-or-before",
        "tidak boleh lebih dari hari ini",
        (value) => !value || new Date(value) <= setEndOfDay(new Date())
      ),
    prbShift: number(),
    prbTanggalDiterima: string(),
    prbSpk: string().required("wajib diisi"),
    kategoriBarang: string().required("wajib diisi"),
    suratJalanVendor: string(),
    status: string().required("wajib diisi"),
    customer: string(),
    vendor: string(),
  });

  const detailDataRef = useRef([]);

  const getCurrentDateValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  };

  const getCurrentDateText = () => {
    const today = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = today.toLocaleDateString("id-ID", options);

    return formattedDate;
  };

  useEffect(() => {
    const currentDateText = getCurrentDateText();
    setCurrentDate(currentDateText);
    setVendor("Menara Terus Makmur");

    if (!selectedCategory) {
      return;
    }
    if (!selectedSpk) {
      return;
    }

    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiPenerimaanBarang/GetDataTransPenerimaanDetailToSubmit",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          detailDataRef.current = data.map((value) => ({
            barId: value.Key,
            prbId: null,
            penJumlah: 0,
            penBarcode: null,
            permintaan: value["Jumlah Permintaan"],
            prevPengambilan: value["Jumlah Penerimaan Sebelumnya"],
          }));

          const formattedData = data.map((value, index) => ({
            ...value,
            "Jumlah Penerimaan Saat Ini": (
              <input
                type="number"
                min={0}
                value={detailDataRef.current.penJumlah}
                onChange={(e) => handleChangeJumlah(e, index)}
                className="form-control hide-arrow-number"
                style={{ width: "80px", margin: "0 auto", textAlign: "center" }}
              />
            ),
            Alignment: ["center", "center", "center", "center", "center"],
          }));
          setListBarId(data.map((value) => value.Key));
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentFilter, selectedCategory, selectedSpk]); // Tambahkan dependency yang benar

  useEffect(() => {
    setIsSaveButtonDisabled(detailDataRef.current.length === 0);
  }, [detailDataRef.current]);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "TransaksiPenerimaanBarang/GetListKategoriPenerimaan",
      {},
      setListKategori,
      "Terjadi kesalahan: Gagal mengambil daftar kategori."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSpk",
      {},
      setListSpk,
      "Terjadi kesalahan: Gagal mengambil daftar spk."
    );
  }, []);

  const validateForm = async () => {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (!isJumlahValid) {
      SweetAlert(
        "Gagal Menyimpan Data",
        "Jumlah penerimaan tidak valid.",
        "error"
      );
      return false;
    }

    if (!isAllJumlahFilled()) {
      SweetAlert(
        "Gagal Menyimpan Data",
        "Jumlah penerimaan wajib diisi.",
        "error"
      );
      return false;
    }

    if (Object.values(validationErrors).some((error) => error)) {
      return false;
    }

    return true;
  };

  const [modalMessage, setModalMessage] = useState("");
  const [modalDetailData, setModalDetailData] = useState([]);
  const [modalFormData, setModalFormData] = useState({});

  const handleToggleClick = async () => {
    const isFormValid = await validateForm();

    if (isFormValid) {
      const detailData = detailDataRef.current.map((item) => ({
        barId: item.barId,
        permintaan: item.permintaan,
        prevPengambilan: item.prevPengambilan,
        penJumlah: item.penJumlah,
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
    prbTanggalInspeksi: "Tanggal Inspeksi",
    prbShift: "Shift",
    prbTanggalDiterima: "Tanggal Diterima",
    prbSpk: "No SPK",
    kategoriBarang: "Kategori Barang",
    suratJalanVendor: "Surat Jalan Vendor",
    status: "Status",
    customer: "Pelanggan",
    vendor: "Vendor",
    // Add other key mappings here
  };

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
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));

    let newFilter = { ...currentFilter };

    if (name === "kategoriBarang") {
      setSelectedCategory(value);
      newFilter.kategoriBarang = value;
    }
    if (name === "prbSpk") {
      setSelectedSpk(value);
      newFilter.prbSpk = value;
    }

    setCurrentFilter(newFilter);

    if (name === "prbShift") {
      setShift(value);
    }
    if (name === "status") {
      setStatusBarang(value);
    }
  };

  const handleChangeJumlah = async (e, index) => {
    let { value } = e.target;
    value = Number(value);

    if (value < 1) {
      SweetAlert(
        "Peringatan",
        "Jumlah penerimaan tidak boleh kurang dari 1",
        "warning"
      );
      setIsJumlahValid(false);
      return;
    }
    if (
      value >
      detailDataRef.current[index]?.permintaan -
        detailDataRef.current[index]?.prevPengambilan
    ) {
      SweetAlert(
        "Peringatan",
        "Jumlah penerimaan tidak boleh melebihi total dari jumlah permintaan dan penerimaan sebelumnya",
        "warning"
      );
      setIsJumlahValid(false);
      return;
    }

    detailDataRef.current[index].pebJumlah = value;
    detailDataRef.current[index].penJumlah = value;
    setIsJumlahValid(true);
  };

  const handleAdd = async () => {
    

    // if (!isJumlahValid) {
    //   SweetAlert(
    //     "Gagal Menyimpan Data",
    //     "Jumlah penerimaan tidak valid.",
    //     "error"
    //   );
    //   return;
    // }

    // if (!isAllJumlahFilled()) {
    //   SweetAlert(
    //     "Gagal Menyimpan Data",
    //     "Jumlah penerimaan wajib diisi.",
    //     "error"
    //   );
    //   return;
    // }

    formDataRef.current.prbTanggalInspeksi = formDataRef.current
      .prbTanggalInspeksi
      ? formDataRef.current.prbTanggalInspeksi
      : "";
    formDataRef.current.prbTanggalDiterima = getCurrentDateValue();
    formDataRef.current.prbShift = shift ? parseInt(shift) : 0;
    formDataRef.current.status = formDataRef.current.status
      ? formDataRef.current.status
      : "1";

    // const validationErrors = await validateAllInputs(
    //   formDataRef.current,
    //   userSchema,
    //   setErrors
    // );

    // if (Object.values(validationErrors).every((error) => !error)) {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    setErrors({});

    try {
      const data = await UseFetch(
        API_LINK + "TransaksiPenerimaanBarang/CreateTransPenerimaan",
        formDataRef.current
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data Transaksi.");
      } else {
        if (data?.length > 0) {
          console.log("masukdetail")
          handleAddDetail(data[0]?.PrbID, data[0]?.BarcodeText);
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
    // }
  };

  const handleAddDetail = async (PrbID, BarcodeText) => {
    const data = currentData.map((value, index) => ({
      barId: listBarId[index],
      prbId: PrbID,
      penJumlah: detailDataRef.current[index].penJumlah
        ? parseInt(detailDataRef.current[index].penJumlah)
        : 0,
      penBarcode: BarcodeText,
      penStatus: statusBarang,
    }));

    let requests = [];

    data.forEach((value) => {
      requests.push(
        UseFetch(
          API_LINK + "TransaksiPenerimaanBarang/CreateTransPenerimaanDetail",
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
      {/* <form onSubmit={handleAdd}> */}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Penerimaan Barang
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <div className="input-group">
                <DropDown
                  forInput="prbSpk"
                  label="Nomor SPK"
                  arrData={listSpk}
                  isRequired
                  value={formDataRef.current.prbSpk}
                  onChange={handleInputChange}
                  errorMessage={errors.prbSpk}
                />
              </div>
            </div>
            <div className="col-lg-4">
              <DropDown
                forInput="kategoriBarang"
                label="Kategori Barang"
                arrData={listKategori}
                isRequired
                value={formDataRef.current.kategoriBarang}
                onChange={handleInputChange}
                errorMessage={errors.kategoriBarang}
              />
            </div>
            <div className="col-lg-4">
              <Input
                type="text"
                forInput="prbTanggalDiterima"
                label="Tanggal Kedatangan"
                disabled
                value={currentDate}
                onChange={handleInputChange}
                errorMessage={errors.prbTanggalDiterima}
              />
            </div>
            <div className="col-lg-4">
              <Input
                type="date"
                forInput="prbTanggalInspeksi"
                label="Tanggal Inspeksi"
                isRequired
                value={formDataRef.current.prbTanggalInspeksi}
                onChange={handleInputChange}
                errorMessage={errors.prbTanggalInspeksi}
              />
            </div>
            <div className="col-lg-4">
              <DropDown
                forInput="status"
                label="Status"
                isRequired
                arrData={statusOptions}
                value={statusBarang}
                onChange={handleInputChange}
                errorMessage={errors.status}
              />
            </div>
            {selectedCategory === "MASSPRO RAW" && (
              <>
                <div className="col-lg-4">
                  <Input
                    type="text"
                    forInput="suratJalanVendor"
                    label="Surat Jalan Vendor"
                    value={formDataRef.current.suratJalanVendor}
                    onChange={handleInputChange}
                    errorMessage={errors.suratJalanVendor}
                  />
                </div>
                <div className="col-lg-4">
                  <Input
                    type="text"
                    forInput="vendor"
                    label="Vendor"
                    disabled
                    value={vendor}
                    onChange={handleInputChange}
                    errorMessage={errors.vendor}
                  />
                </div>
              </>
            )}
            {selectedCategory === "MASSPRO FG" && (
              <>
                <div className="col-lg-4">
                  <Input
                    type="text"
                    forInput="customer"
                    label="Pelanggan"
                    disabled
                    value={customer}
                    onChange={handleInputChange}
                    errorMessage={errors.customer}
                  />
                </div>
              </>
            )}
            {(selectedCategory === "MASSPRO FG" ||
              selectedCategory === "PRODUCTION FG") && (
              <>
                <div className="col-lg-4">
                  <DropDown
                    forInput="prbShift"
                    label="Shift"
                    arrData={shiftOptions}
                    value={shift}
                    onChange={handleInputChange}
                    errorMessage={errors.prbShift}
                  />
                </div>
              </>
            )}
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
            const displayKey =
            keyDisplayMap[key] || key.replace(/([A-Z])/g, " $1").trim();
            let displayValue = value === "" || value === 0 ? "-" : value;
            if (displayKey == "Status"){
              displayValue = value === 1 ? "OK" : "NG";
            }
            
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
                <th>Bar ID</th>
                <th>Jumlah Permintaan</th>
                <th>Jumlah Penerimaan Sebelumnya</th>
                <th>Jumlah Penerimaan Saat Ini</th>
              </tr>
            </thead>
            <tbody>
              {modalDetailData.map((item, index) => (
                <tr key={index}>
                  <td>{item.barId}</td>
                  <td>{item.permintaan}</td>
                  <td>{item.prevPengambilan}</td>
                  <td>{item.penJumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* </form> */}
    </>
  );
}
