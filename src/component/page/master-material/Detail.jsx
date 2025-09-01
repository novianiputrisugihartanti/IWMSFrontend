import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import LabelImages from "../../part/LabelImages";

export default function MasterMaterialDetail({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKategori, setListKategori] = useState({});
  const [listPemilik, setListPemilik] = useState({});
  const [listSatuan, setListSatuan] = useState({});
  const [listVendor, setListVendor] = useState({});
  const [listCustomer, setListCustomer] = useState({});
  const [showVendor, setShowVendor] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [listJenis, setListJenis] = useState({});

  const formDataRef = useRef({
    barKategori: "",
    barId: withID,
    barNama: "",
    barFoto: "",
    barSpesifikasi: "",
    barMerk: "",
    barSatuan: "",
    barMinStok: 0,
    barPemilik: "",
    barCustomer: "",
    barVendor: "",
    barJenis: "",
    barLokasi: "",
    barRak: "",
    barBin: "",
  });

  const fileFotoRef = useRef(null);

  const userSchema = object({
    barNama: string().required("harus diisi"),
    barKategori: string().required("harus diisi"),
    barFoto: string(),
    barId: string(),
    barSpesifikasi: string(),
    barMerk: string(),
    barSatuan: string(),
    barMinStok: number().typeError("masukkan angka yang valid"),
    barPemilik: string(),
    barCustomer: string(),
    barVendor: string(),
    barJenis: string(),
    barLokasi: string(),
    barRak: string(),
    barBin: string(),
  });

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
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListKategori",
      {},
      setListKategori,
      "Terjadi kesalahan: Gagal mengambil daftar kategori."
    );
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListPemilik",
      {},
      setListPemilik,
      "Terjadi kesalahan: Gagal mengambil daftar pemilik."
    );
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListSatuan",
      {},
      setListSatuan,
      "Terjadi kesalahan: Gagal mengambil daftar satuan."
    );
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListVendor",
      {},
      setListVendor,
      "Terjadi kesalahan: Gagal mengambil daftar vendor."
    );
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListCustomer",
      {},
      setListCustomer,
      "Terjadi kesalahan: Gagal mengambil daftar customer."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      try {
        const data = await UseFetch(
          API_LINK + "MasterMaterial/GetDataMaterialById",
          { barId: withID }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Material.");
        } else {
          const updateFormData = {
            barId: data[0].barId,
            barKategori: data[0].barKategori,
            barNama: data[0].barNama,
            barFoto: data[0].barFoto,
            barSpesifikasi: data[0].barSpesifikasi,
            barMerk: data[0].barMerk,
            barSatuan: data[0].barSatuan,
            barMinStok: data[0].barMinStok,
            barPemilik: data[0].barPemilik,
            barCustomer: data[0].barCustomer,
            barVendor: data[0].barVendor,
            barJenis: data[0].barJenis,
            barLokasi: data[0].barLokasi,
            barRak: data[0].barRak,
            barBin: data[0].barBin,
          };
          formDataRef.current = { ...formDataRef.current, ...updateFormData };
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

    fetchData();
  }, [withID]);

  useEffect(() => {
    const category = formDataRef.current.barKategori;
    if (category === "MASSPRO FG" || category === "MASSPRO RAW") {
      setShowVendor(true);
    }
    if (
      category === "MASSPRO FG" ||
      category === "MASSPRO RAW" ||
      category === "PRODUCTION FG"
    ) {
      setShowCustomer(true);
    } else {
      setShowVendor(false);
      setShowCustomer(false);
      formDataRef.current.barVendor = "";
      formDataRef.current.barCustomer = "";
    }
    if (category !== null && category !== "") {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListJenisByKategori",
        { kategori: category },
        setListJenis,
        "Terjadi kesalahan: Gagal mengambil daftar jenis."
      );
    }
  }, [formDataRef.current.barKategori]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleEdit = async (e) => {
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
      const uploadPromises = [];

      const fileInputs = [{ ref: fileFotoRef, key: "barFoto" }];

      fileInputs.forEach((fileInput) => {
        if (fileInput.ref.current.files.length > 0) {
          uploadPromises.push(
            UploadFile(fileInput.ref.current).then(
              (data) => (formDataRef.current[fileInput.key] = data.Hasil)
            )
          );
        }
      });

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterMaterial/EditMaterial",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Material.");
        } else {
          SweetAlert("Sukses", "Data Material berhasil diedit", "success");
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

  const onDownloadBarocode = async (page) => {
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const response = await fetch(
        API_LINK + "MasterMaterial/DownloadBarcode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ barId: withID }),
        }
      );
      if (response.status !== 200) {
        throw new Error(response?.message);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formDataRef.current.barId}.pdf`;
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Barang
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <LabelImages
                  forLabel="barFoto"
                  title="Foto"
                  image={formDataRef.current.barFoto}
                  data={
                    formDataRef.current?.barFoto?.replace("-", "") === "" ? (
                      "-"
                    ) : (
                      <a
                        href={FILE_LINK + formDataRef.current.barFoto}
                        className="text-decoration-none"
                        target="_blank"
                      >
                        Unduh gambar
                      </a>
                    )
                  }
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="barKategori"
                  disabled
                  label="Kategori"
                  isRequired
                  arrData={listKategori}
                  value={formDataRef.current.barKategori}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barJenis"
                  disabled
                  label="Jenis"
                  value={formDataRef.current.barJenis}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barNama"
                  disabled
                  label="Nama"
                  isRequired
                  value={formDataRef.current.barNama}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barSpesifikasi"
                  disabled
                  label="Spesifikasi"
                  value={formDataRef.current.barSpesifikasi}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barMerk"
                  disabled
                  label="Merek"
                  value={formDataRef.current.barMerk}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="number"
                  forInput="barMinStok"
                  disabled
                  label="Stok Minimal"
                  value={formDataRef.current.barMinStok}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="barPemilik"
                  disabled
                  label="Pemilik"
                  arrData={listPemilik}
                  value={formDataRef.current.barPemilik}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="barSatuan"
                  disabled
                  label="Satuan"
                  arrData={listSatuan}
                  value={formDataRef.current.barSatuan}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barLokasi"
                  disabled
                  label="Lokasi"
                  value={formDataRef.current.barLokasi}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barRak"
                  disabled
                  label="Rak"
                  value={formDataRef.current.barRak}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="barBin"
                  disabled
                  label="Bin"
                  value={formDataRef.current.barBin}
                  onChange={handleInputChange}
                />
              </div>
              {showVendor && (
                <div className="col-lg-4">
                  <DropDown
                    forInput="barVendor"
                    disabled
                    label="Nama Vendor"
                    arrData={listVendor}
                    value={formDataRef.current.barVendor}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {showCustomer && (
                <div className="col-lg-4">
                  <DropDown
                    forInput="barCustomer"
                    disabled
                    label="Nama Pelanggan"
                    arrData={listCustomer}
                    value={formDataRef.current.barCustomer}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {formDataRef.current.barKategori &&
                !formDataRef.current.barKategori
                  .toLowerCase()
                  .includes("masspro") &&
                !formDataRef.current.barKategori
                  .toLowerCase()
                  .includes("production") && (
                  <div className="col-lg-4 ms-auto my-3">
                    <img
                      src={`${FILE_LINK}${formDataRef.current.barId}.jpg`}
                      alt=""
                      className="w-100"
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          {formDataRef.current.barKategori &&
            !formDataRef.current.barKategori
              .toLowerCase()
              .includes("masspro") &&
            !formDataRef.current.barKategori
              .toLowerCase()
              .includes("production") && (
              <Button
                classType="primary me-2 px-4 py-2"
                label="UNDUH"
                onClick={() => onDownloadBarocode("index")}
              />
            )}

          <Button
            classType="secondary me-2 px-4 py-2"
            label="KEMBALI"
            onClick={() => onChangePage("index")}
          />
        </div>
      </form>
          
    </>
  );
}
