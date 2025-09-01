import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateInput } from "../../util/ValidateForm";
import UseFetch from "../../util/UseFetch";
import Table from "../../part/Table";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Label from "../../part/Label";
import DropDown from "../../part/Dropdown";

const initialData = [
  {
    Key: null,
    No: null,
    "Nama Barang": null,
    Count: 0,
  },
];

export default function TransaksiPemerimaanBarangDetail({
  onChangePage,
  withID,
}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState(initialData);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [shift, setShift] = useState("");
  const [statusBarang, setStatusBarang] = useState("");
  const [customer, setCustomer] = useState("PT. MTM");

  const formDataRef = useRef({
    prbId: withID,
    prbKategoriBarang: "",
    prbSpk: "",
    prbVendor: "",
    prbCustomer:"",
    prbSuratjalanvendor:"",
    tanggalKedatangan: "",
    prbShift: "",
    status: "",
    prbTanggalInspeksi: "",
  });

  const userSchema = object({
    prbId: string(),
    prbKategoriBarang: string(),
    prbSpk: string(),
    prbVendor: string(),
    prbCustomer: string(),
    prbSuratjalanvendor: string(),
    tanggalKedatangan: string(),
    prbShift: string(),
    status: string(),
    prbTanggalInspeksi: string(),
  });

  useEffect(() => {
    const fetchHeaderData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenerimaanBarang/GetDataTransPenerimaanById",
          { prbId: withID }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data penerimaan barang."
          );
        } else {
          const updateFormData = {
            prbId: data[0].prbId,
            prbKategoriBarang: data[0].prbKategoriBarang,
            prbSpk: data[0].prbSpk,
            prbVendor: data[0].prbVendor,
            prbCustomer: data[0].prbCustomer,
            prbSuratjalanvendor: data[0].prbSuratjalanvendor,
            tanggalKedatangan: data[0].tanggalKedatangan,
            prbShift: data[0].prbShift,
            status: data[0].status,
            prbTanggalInspeksi: data[0].prbTanggalInspeksi
              ? getDateText(data[0].prbTanggalInspeksi)
              : "-",
          };
          formDataRef.current = { ...formDataRef.current, ...updateFormData };
          setSelectedCategory(data[0].prbKategoriBarang);
          if (updateFormData.status !== null && updateFormData.status !== "") {
            setShift(data[0].prbShift);
          }
          if (updateFormData.status !== null && updateFormData.status !== "") {
            setStatusBarang(data[0].status);
          }
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      }
    };

    const fetchTableData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiPenerimaanBarang/GetDataTransPenerimaanDetailToShow",
          { prbId: withID },
          "POST"
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setTableData(initialData);
        } else {
          const formattedData = data.map((value) => ({
            ...{
              No: value.No,
              Barcode: (
                <img
                  src={`${FILE_LINK}${value.Barcode}.jpg`}
                  alt=""
                  style={{ width: "200px", height: "auto" }}
                />
              ),
              "Nama Barang": value["Nama Barang"],
              Jumlah: value.Jumlah,
            },
            Alignment: ["center", "center", "center", "center"],
          }));
          setTableData(formattedData);
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

    fetchHeaderData();
    fetchTableData();
  }, [withID]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));

    if (name === "prbShift") {
      setShift(value);
    }
    if (name === "status") {
      setStatusBarang(value);
    }
  };

  const onDownloadPdf = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const response = await fetch(
        API_LINK + "TransaksiPenerimaanBarang/DownloadPdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prbId: withID }),
        }
      );
      if (response.status !== 200) {
        throw new Error(response?.message);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formDataRef.current.prbId}.pdf`;
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

  const getDateText = (dateParam) => {
    const date = new Date(dateParam);
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = date.toLocaleDateString("id-ID", options);

    return formattedDate;
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Penerimaan Barang
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="prbSpk"
                title="Nomor SPK"
                data={formDataRef.current.prbSpk}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="tanggalKedatangan"
                title="Tanggal Kedatangan"
                data={formDataRef.current.tanggalKedatangan}
              />
            </div>
            {selectedCategory === "MASSPRO RAW" && (
              <>
                <div className="col-lg-4">
                <Label forLabel="SuratJalanVendor" title="Surat Jalan Vendor" data={formDataRef.current.prbSuratjalanvendor} />
                </div>
                <div className="col-lg-4">
                  <Label forLabel="Vendor" title="Vendor" data={formDataRef.current.prbVendor} />

                </div>
                <div className="col-lg-4">
                  <Label
                    forLabel="status"
                    title="Status"
                    data={
                      formDataRef.current.status?.trim() === "1" ? "OK" : "NG"
                    }
                  />
                </div>
              </>
            )}
            {(selectedCategory === "MASSPRO FG" || selectedCategory === "PRODUCTION FG") && (
              <>
                <div className="col-lg-4">
                  <Label
                    forLabel="shift"
                    title="Shift"
                    data={shift ? shift : "-"}
                  />
                </div>
                <div className="col-lg-4">
                  <Label forLabel="customer" title="Pelanggan" data={formDataRef.current.prbCustomer} />
                </div>
                <div className="col-lg-4">
                  <Label
                    forLabel="tanggalInspeksi"
                    title="Tanggal Inspeksi"
                    data={formDataRef.current.prbTanggalInspeksi}
                  />
                </div>
                <div className="col-lg-4">
                  <Label
                    forLabel="status"
                    title="Status"
                    data={
                      formDataRef.current.status?.trim() === "1" ? "OK" : "NG"
                    }
                  />
                </div>
              </>
            )}
          </div>
          <div className="row mt-2">
            <div className="d-flex flex-column">
              <Table data={tableData} />
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
        {(selectedCategory === "MASSPRO FG" ||
          selectedCategory === "MASSPRO RAW" ||
          selectedCategory === "PRODUCTION FG") && (
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Unduh"
            onClick={() => onDownloadPdf()}
          />
        )}
      </div>
    </>
  );
}
