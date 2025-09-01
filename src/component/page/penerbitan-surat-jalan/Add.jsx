import { useEffect, useRef, useState } from "react";
import { object, string, date } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

const initialData = [
  {
    Key: null,
    No: null,
    "Nomor Transaksi Pengambilan": null,
    TanggalSuratJalan: null,
    Pengambil: null,
    SPK: null,
    Keterangan: null,
    Count: 0,
  },
];

export default function PenerbitanSuratJalanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listNpk, setListNpk] = useState({});
  const [listSpk, setListSpk] = useState({});
  const [spkInput, setSpkInput] = useState("");
  const [currentData, setCurrentData] = useState(initialData);
  const [selectedSpk, setSelectedSpk] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [pabNomorPO, setPP] = useState("");

  const [currentFilter, setCurrentFilter] = useState({
    TanggalSuratJalan: "[Tanggal] asc",
    prbSpk: selectedSpk,
  });

  const formDataRef = useRef({
    pabNo: "",
    pabOrdeSheet: "",
    pabNomorPO: "",
    TanggalSuratJalan: "",
    prbSpk: "",
  });

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setSelectedItem(value);
  };

  useEffect(() => {
    formDataRef.current["pabNo"] = selectedItem;
  }, [selectedItem]);

  const getTransaksiDetailToSubmit = async () => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiPenerbitanSuratJalan/GetDataTransPenerbitanSuratJalanDetailToSubmit",
          currentFilter
        );
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            " ": (
              <input
                type="radio"
                onChange={handleRadioChange}
                className="form-check-input"
                value={value.Key}
                name="selectedRadio"
              />
            ),
            ...value,
            Alignment: [
              "center",
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
  };

  useEffect(() => {
    if (selectedSpk) {
      fetchPurchaseOrder(selectedSpk);
    }
  }, [selectedSpk]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const userSchema = object({
    pabNo: string().required("Pilih salah satu nomor transaksi pengambilan."),
    TanggalSuratJalan: date()
      .required("wajib diisi")
      .min(startOfToday, "Tanggal tidak boleh kurang dari hari ini"),
    pabOrdeSheet: string(),
    pabNomorPO: string().required("wajib diisi"),
    prbSpk: string().required("wajib diisi"),
  });

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSpk",
      {},
      setListSpk,
      "Terjadi kesalahan: Gagal mengambil daftar spk."
    );
  }, []);

  const fetchPurchaseOrder = async (spkId) => {
    setIsError(false);
    setIsLoading(true);
    try {
      const data = await UseFetch(API_LINK + "Utilities/GetPurchaseOrder", {
        spkId: spkId,
      });
      if (Array.isArray(data) && data.length > 0) {
        setPP(data[0].pabNomorPO); // Update state untuk menampilkan nomor PO
        formDataRef.current.pabNomorPO = data[0].pabNomorPO; // Update referensi form data
        setErrors((prevErrors) => ({
          ...prevErrors,
          pabNomorPO: "",
        }));
        setSelectedSpk(spkId);
        await getTransaksiDetailToSubmit();
      } else {
        setIsError(true);
        setErrors((prevErrors) => ({
          ...prevErrors,
          pabNomorPO: "tidak terdaftar",
        }));
        setPP(""); // Kosongkan jika data tidak ditemukan
      }
    } catch (error) {
      setIsError(true);
      setErrors((prevErrors) => ({
        ...prevErrors,
        pabNomorPO: "Terjadi kesalahan dalam mengambil data PO.",
      }));
    } finally {
      setIsLoading(false);
    }
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
    if (name === "prbSpk") {
      if (value === "" || value === null) {
        setCurrentData(initialData);
        setPP("");
      } else {
        setSelectedSpk(value);
        formDataRef.current["prbSpk"] = value;
        setCurrentFilter((prevFilter) => ({
          ...prevFilter,
          prbSpk: value,
        }));
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));

    if (name === "TanggalSuratJalan") {
      setCurrentFilter({ TanggalSuratJalan: value });
    }
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
          API_LINK +
            "TransaksiPenerbitanSuratJalan/CreateTransPenerbitanSuratJalan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data Penerbitan Surat Jalan."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Data Penerbitan Surat Jalan berhasil disimpan",
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
            Penerbitan Surat Jalan
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
                <Input
                  type="date"
                  forInput="TanggalSuratJalan"
                  label="Tanggal"
                  value={formDataRef.current.TanggalSuratJalan}
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.TanggalSuratJalan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="pabOrdeSheet"
                  label="No. Order Sheet"
                  value={formDataRef.current.pabOrdeSheet}
                  onChange={handleInputChange}
                  errorMessage={errors.pabOrdeSheet}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="pabNomorPO"
                  label="No. Purchase Order"
                  disabled
                  isRequired
                  value={pabNomorPO}
                  onChange={handleInputChange}
                  errorMessage={errors.pabNomorPO}
                />
              </div>
            </div>
            <div className="row mt-2">
              {isLoading ? (
                <Loading />
              ) : (
                <div className="d-flex flex-column">
                  <Table data={currentData} />
                  {errors.pabNo && (
                    <div className="text-danger mt-2">{errors.pabNo}</div>
                  )}
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
