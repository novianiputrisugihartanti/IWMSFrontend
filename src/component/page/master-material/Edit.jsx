import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterMaterialEdit({ onChangePage, withID }) {
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
  const path = window.location.pathname;
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
    barSpesifikasi: string().required("harus diisi"),
    barMerk: string().required("harus diisi"),
    barSatuan: string().required("harus diisi"),
    barMinStok: number().typeError("masukkan angka yang valid"),
    barPemilik: string().required("harus diisi"),
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
    var validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;

    if (name === "barMinStok") {
      if (!/^[0-9]*$/.test(value) || value < 0) {
        validationError = {
          name,
          error: "Input tidak valid: hanya angka yang diizinkan dan tidak boleh minus",
        };
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.Clipboard).getData('text');
    const isValid = /^[0-9]*$/.test(paste); // Hanya izinkan angka
  
    if (!isValid || paste < 0) {
      e.preventDefault();
      SweetAlert("Error", "Input tidak valid: hanya angka yang diizinkan dan tidak boleh -1", "error");
    }
  };

  const handleFileChange = async (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
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

      if (path === "/master_material") {
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
      }

      try {
        if (path === "/master_material") {
          await Promise.all(uploadPromises);
        }

        const data = await UseFetch(
          API_LINK + "MasterMaterial/EditMaterial",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Material.");
        } else {
          SweetAlert("Sukses", "Data barang/jasa berhasil diedit", "success");
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
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Barang
          </div>
          <div className="card-body p-4">
            <div className="row">
              {path === "/master_material" && (
                <div className="col-lg-4">
                  <FileUpload
                    forInput="barFoto"
                    label="Foto (.pdf, .jpg, .png, .zip)"
                    formatFile=".pdf,.jpg,.png,.zip"
                    ref={fileFotoRef}
                    onChange={() =>
                      handleFileChange(fileFotoRef, "pdf,jpg,png,zip")
                    }
                    errorMessage={errors.barFoto}
                    hasExisting={formDataRef.current.barFoto}
                  />
                </div>
              )}
              <div className="col-lg-4">
                <DropDown
                  forInput="barKategori"
                  disabled
                  label="Kategori"
                  isRequired
                  arrData={listKategori}
                  value={formDataRef.current.barKategori}
                  onChange={handleInputChange}
                  errorMessage={errors.barKategori}
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
                  errorMessage={errors.barNama}
                />
              </div>
              {path === "/master_material" && (
                <>
                  <div className="col-lg-4">
                    <DropDown
                      forInput="barJenis"
                      label="Jenis"
                      arrData={listJenis}
                      value={formDataRef.current.barJenis}
                      onChange={handleInputChange}
                      errorMessage={errors.barJenis}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barSpesifikasi"
                      label="Spesifikasi"
                      isRequired
                      value={formDataRef.current.barSpesifikasi}
                      onChange={handleInputChange}
                      errorMessage={errors.barSpesifikasi}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barMerk"
                      label="Merek"
                      isRequired
                      value={formDataRef.current.barMerk}
                      onChange={handleInputChange}
                      errorMessage={errors.barMerk}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="number"
                      forInput="barMinStok"
                      isRequired
                      label="Stok Minimal"
                      value={parseInt(formDataRef.current.barMinStok)}
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      errorMessage={errors.barMinStok}
                    />
                  </div>
                  <div className="col-lg-4">
                    <DropDown
                      forInput="barPemilik"
                      label="Pemilik"
                      isRequired
                      arrData={listPemilik}
                      value={formDataRef.current.barPemilik}
                      onChange={handleInputChange}
                      errorMessage={errors.barPemilik}
                    />
                  </div>

                  <div className="col-lg-4">
                    <DropDown
                      forInput="barSatuan"
                      label="Satuan"
                      isRequired
                      arrData={listSatuan}
                      value={formDataRef.current.barSatuan}
                      onChange={handleInputChange}
                      errorMessage={errors.barSatuan}
                    />
                  </div>
                </>
              )}
              {showVendor && path === "/master_material" && (
                <div className="col-lg-4">
                  <DropDown
                    forInput="barVendor"
                    label="Nama Vendor"
                    arrData={listVendor}
                    value={formDataRef.current.barVendor}
                    onChange={handleInputChange}
                    errorMessage={errors.barVendor}
                  />
                </div>
              )}
              {showCustomer && path === "/master_material" && (
                <div className="col-lg-4">
                  <DropDown
                    forInput="barCustomer"
                    label="Nama Pelanggan"
                    arrData={listCustomer}
                    value={formDataRef.current.barCustomer}
                    onChange={handleInputChange}
                    errorMessage={errors.barCustomer}
                  />
                </div>
              )}
              {path === "/master_material_gudang" && (
                <>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barLokasi"
                      label="Lokasi"
                      value={formDataRef.current.barLokasi}
                      onChange={handleInputChange}
                      errorMessage={errors.barLokasi}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barRak"
                      label="Rak"
                      value={formDataRef.current.barRak}
                      onChange={handleInputChange}
                      errorMessage={errors.barRak}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      type="text"
                      forInput="barBin"
                      label="Bin"
                      value={formDataRef.current.barBin}
                      onChange={handleInputChange}
                      errorMessage={errors.barBin}
                    />
                  </div>
                </>
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
